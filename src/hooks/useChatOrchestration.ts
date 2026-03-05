import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/store/appStore';
import { getBugDescription } from '@/services/tutor/bugLookup';
import type { UseTutorReturn } from '@/hooks/useTutor';
import type { FeedbackState } from '@/hooks/useSession';
import type { SessionProblem } from '@/services/session';
import type { SessionPhase } from '@/services/session';
import type { RootStackParamList } from '@/navigation/types';

type SessionNavProp = NativeStackNavigationProp<RootStackParamList, 'Session'>;

/** Sentinel value used to force wrong-answer scoring for BOOST-revealed taps */
const BOOST_SENTINEL = -999999;

export interface ChatOrchestrationParams {
  tutor: UseTutorReturn;
  currentProblem: SessionProblem | null;
  currentIndex: number;
  correctAnswer: number | null;
  feedbackState: FeedbackState | null;
  sessionPhase: SessionPhase;
  isComplete: boolean;
  isOnline: boolean;
  handleAnswer: (selectedValue: number) => void;
  setLastWrongContext: (
    ctx: { wrongAnswer: number; bugDescription: string | null } | null,
  ) => void;
}

export interface ChatOrchestrationReturn {
  chatOpen: boolean;
  chatMinimized: boolean;
  showHelp: boolean;
  shouldPulse: boolean;
  showCorrectAnswer: boolean;
  boostHighlightAnswer: number | null;
  responseMode: 'standard' | 'gotit';
  bannerMessage: string;
  handleAnswerWithBoost: (selectedValue: number) => void;
  handleHelpTap: () => void;
  handleResponse: (
    type: 'understand' | 'more' | 'confused' | 'retry' | 'gotit',
  ) => void;
  handleCloseChat: () => void;
  handleBannerTap: () => void;
}

export function useChatOrchestration(
  params: ChatOrchestrationParams,
): ChatOrchestrationReturn {
  const {
    tutor,
    currentProblem,
    currentIndex,
    correctAnswer,
    feedbackState,
    sessionPhase,
    isComplete,
    isOnline,
    handleAnswer,
    setLastWrongContext,
  } = params;

  const navigation = useNavigation<SessionNavProp>();
  const addTutorMessage = useAppStore((s) => s.addTutorMessage);
  const incrementWrongAnswerCount = useAppStore(
    (s) => s.incrementWrongAnswerCount,
  );
  const tutorConsentGranted = useAppStore((s) => s.tutorConsentGranted);

  // Chat UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track whether consent was pending
  const consentPendingRef = useRef(false);

  // BOOST mode: derived directly from tutor mode
  const boostReveal = tutor.tutorMode === 'boost';

  // Track whether TEACH has already minimized chat
  const teachMinimizedRef = useRef(false);

  // Track whether to reveal the correct answer after wrong tap
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // When feedback activates with incorrect answer, reveal correct after 500ms
  useEffect(() => {
    if (feedbackState && !feedbackState.correct) {
      const timer = setTimeout(() => {
        setShowCorrectAnswer(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    // Reset when feedback clears
    setShowCorrectAnswer(false);
  }, [feedbackState]);

  // Pulse help button after wrong answer
  useEffect(() => {
    if (feedbackState && !feedbackState.correct && !helpUsed) {
      setShouldPulse(true);
    }
  }, [feedbackState, helpUsed]);

  // TEACH mode: auto-expand ManipulativePanel and minimize chat (once per escalation)
  useEffect(() => {
    if (
      tutor.shouldExpandManipulative &&
      chatOpen &&
      !teachMinimizedRef.current
    ) {
      teachMinimizedRef.current = true;
      setChatMinimized(true);
      setChatOpen(false);
    }
  }, [tutor.shouldExpandManipulative, chatOpen]);

  // Auto-fire tutor request when returning from ConsentScreen with consent granted
  useEffect(() => {
    if (tutorConsentGranted && consentPendingRef.current) {
      consentPendingRef.current = false;
      if (isOnline) {
        tutor.requestHint();
      }
    }
  }, [tutorConsentGranted, isOnline, tutor]);

  // Per-problem reset (chat, escalation state, wrong context)
  useEffect(() => {
    tutor.resetForProblem();
    setChatOpen(false);
    setChatMinimized(false);
    setHelpUsed(false);
    setShouldPulse(false);
    setLastWrongContext(null);
    teachMinimizedRef.current = false;
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Cleanup auto-close timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  // Help button visibility: practice phase only, not when chat/banner visible, not when complete
  const showHelp =
    sessionPhase === 'practice' && !chatOpen && !chatMinimized && !isComplete;

  /**
   * Wrapped answer handler with BOOST scoring guard.
   *
   * When boostReveal is true and the child taps the highlighted correct answer,
   * we pass a sentinel value to handleAnswer so it scores as WRONG for Elo/BKT/XP.
   */
  const handleAnswerWithBoost = useCallback(
    (selectedValue: number) => {
      // Track wrong answers and resolve bug descriptions for tutor context
      if (correctAnswer !== null && selectedValue !== correctAnswer) {
        incrementWrongAnswerCount();
        const selectedOption = currentProblem?.presentation.options.find(
          (o) => o.value === selectedValue,
        );
        const bugDesc = getBugDescription(selectedOption?.bugId);
        setLastWrongContext({
          wrongAnswer: selectedValue,
          bugDescription: bugDesc ?? null,
        });
      }

      // BOOST scoring guard: revealed correct tap is scored as WRONG
      if (
        boostReveal &&
        correctAnswer !== null &&
        selectedValue === correctAnswer
      ) {
        handleAnswer(BOOST_SENTINEL);
        return;
      }

      handleAnswer(selectedValue);
    },
    [
      boostReveal,
      correctAnswer,
      handleAnswer,
      incrementWrongAnswerCount,
      currentProblem,
      setLastWrongContext,
    ],
  );

  // Handle help tap: open chat and request first hint (or intercept for consent)
  const handleHelpTap = useCallback(() => {
    setHelpUsed(true);
    setShouldPulse(false);
    setChatOpen(true);
    setChatMinimized(false);

    if (!tutorConsentGranted) {
      addTutorMessage({
        id: `consent-${Date.now()}`,
        role: 'tutor',
        text: 'Ask a grown-up to turn on your math helper! They can set it up for you.',
        timestamp: Date.now(),
      });
      consentPendingRef.current = true;
      navigation.navigate('Consent');
      return;
    }

    if (isOnline) {
      tutor.requestHint();
    }
  }, [isOnline, tutor, tutorConsentGranted, addTutorMessage, navigation]);

  // Determine response mode based on tutor mode
  const responseMode: 'standard' | 'gotit' =
    tutor.tutorMode === 'boost' ? 'gotit' : 'standard';

  // Handle response buttons (including gotit for BOOST)
  const handleResponse = useCallback(
    (type: 'understand' | 'more' | 'confused' | 'retry' | 'gotit') => {
      switch (type) {
        case 'understand': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: 'I understand!',
            timestamp: Date.now(),
          });
          setTimeout(() => {
            addTutorMessage({
              id: `tutor-encourage-${Date.now()}`,
              role: 'tutor',
              text: 'Great! Give it a try!',
              timestamp: Date.now(),
            });
          }, 200);
          autoCloseTimerRef.current = setTimeout(() => {
            setChatOpen(false);
          }, 1500);
          break;
        }
        case 'more': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: 'Tell me more',
            timestamp: Date.now(),
          });
          tutor.requestTutor();
          break;
        }
        case 'confused': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: "I'm confused",
            timestamp: Date.now(),
          });
          tutor.requestTutor();
          break;
        }
        case 'retry': {
          if (isOnline) {
            tutor.requestTutor();
          }
          break;
        }
        case 'gotit': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: 'Got it!',
            timestamp: Date.now(),
          });
          autoCloseTimerRef.current = setTimeout(() => {
            setChatOpen(false);
          }, 800);
          break;
        }
      }
    },
    [addTutorMessage, tutor, isOnline],
  );

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // ChatBanner: tap re-expands full chat
  const handleBannerTap = useCallback(() => {
    setChatOpen(true);
    setChatMinimized(false);
  }, []);

  // Get latest tutor message text for banner
  const lastTutorMessage = tutor.messages
    .filter((m) => m.role === 'tutor')
    .at(-1);
  const bannerMessage = lastTutorMessage?.text ?? '';

  return {
    chatOpen,
    chatMinimized,
    showHelp,
    shouldPulse,
    showCorrectAnswer,
    boostHighlightAnswer: boostReveal ? correctAnswer : null,
    responseMode,
    bannerMessage,
    handleAnswerWithBoost,
    handleHelpTap,
    handleResponse,
    handleCloseChat,
    handleBannerTap,
  };
}
