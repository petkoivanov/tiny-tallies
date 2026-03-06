/**
 * SessionWrapper: Per-theme ambient decoration overlay for math sessions.
 *
 * Renders slow, low-opacity animated elements at screen edges based on
 * the active theme. Decorations use pointerEvents="none" so they never
 * intercept touch events on the session content beneath.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { ThemeId } from '@/theme';

interface SessionWrapperProps {
  children: React.ReactNode;
}

// ---- Decoration configs per theme ----

interface DecorationItem {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  borderRadius?: number;
  rotate?: string;
}

function getDecorations(themeId: ThemeId, colors: { primary: string; primaryLight: string; textMuted: string }): DecorationItem[] {
  switch (themeId) {
    case 'dark':
      return [
        { top: '3%', left: '8%', size: 8, opacity: 0.1, duration: 6000, delay: 0, color: colors.textMuted, borderRadius: 4 },
        { top: '5%', right: '12%', size: 6, opacity: 0.1, duration: 6000, delay: 1500, color: colors.textMuted, borderRadius: 3 },
        { bottom: '5%', left: '15%', size: 7, opacity: 0.1, duration: 6000, delay: 3000, color: colors.textMuted, borderRadius: 3.5 },
      ];
    case 'ocean':
      return [
        { bottom: '3%', left: '10%', size: 10, opacity: 0.15, duration: 7000, delay: 0, color: colors.primary, borderRadius: 5 },
        { bottom: '5%', right: '15%', size: 8, opacity: 0.15, duration: 7000, delay: 1750, color: colors.primaryLight, borderRadius: 4 },
        { bottom: '8%', left: '25%', size: 6, opacity: 0.12, duration: 7000, delay: 3500, color: colors.primary, borderRadius: 3 },
        { top: '4%', right: '8%', size: 7, opacity: 0.12, duration: 7000, delay: 5250, color: colors.primaryLight, borderRadius: 3.5 },
      ];
    case 'forest':
      return [
        { top: '3%', left: '5%', size: 10, opacity: 0.15, duration: 5000, delay: 0, color: colors.primary, rotate: '45deg' },
        { top: '6%', right: '10%', size: 8, opacity: 0.12, duration: 5000, delay: 1250, color: colors.primaryLight, rotate: '30deg' },
        { bottom: '4%', right: '8%', size: 9, opacity: 0.15, duration: 5000, delay: 2500, color: colors.primary, rotate: '60deg' },
      ];
    case 'sunset':
      return [
        { top: '2%', left: '5%', size: 60, opacity: 0.2, duration: 8000, delay: 0, color: colors.primary, borderRadius: 4 },
        { bottom: '3%', right: '5%', size: 50, opacity: 0.15, duration: 8000, delay: 4000, color: colors.primaryLight, borderRadius: 4 },
      ];
    case 'space':
      return [
        { top: '2%', left: '8%', size: 3, opacity: 0.25, duration: 4000, delay: 0, color: '#ffffff', borderRadius: 1.5 },
        { top: '5%', right: '12%', size: 2, opacity: 0.2, duration: 5000, delay: 800, color: '#ffffff', borderRadius: 1 },
        { top: '8%', left: '30%', size: 3, opacity: 0.2, duration: 4500, delay: 1600, color: colors.primaryLight, borderRadius: 1.5 },
        { bottom: '4%', right: '20%', size: 2, opacity: 0.25, duration: 5500, delay: 2400, color: '#ffffff', borderRadius: 1 },
        { bottom: '7%', left: '15%', size: 3, opacity: 0.15, duration: 6000, delay: 3200, color: colors.primaryLight, borderRadius: 1.5 },
      ];
    default:
      return [];
  }
}

// ---- Animated decoration component ----

function DecorationDot({ item }: { item: DecorationItem }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: item.duration / 2, easing: Easing.linear }),
        withTiming(0, { duration: item.duration / 2, easing: Easing.linear }),
      ),
      -1,
      false,
    );
  }, [item.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacityBase = item.opacity * 0.5;
    const opacityRange = item.opacity * 0.5;
    return {
      opacity: opacityBase + progress.value * opacityRange,
      transform: [{ translateY: -2 + progress.value * 4 }],
    };
  });

  const isSunsetBar = item.size > 30;

  const positionStyle = useMemo((): ViewStyle => {
    const base: ViewStyle = {
      position: 'absolute',
      width: isSunsetBar ? '90%' : item.size,
      height: isSunsetBar ? 3 : item.size,
      borderRadius: item.borderRadius ?? item.size / 2,
      backgroundColor: item.color,
    };
    if (item.top != null) base.top = item.top as ViewStyle['top'];
    if (item.bottom != null) base.bottom = item.bottom as ViewStyle['bottom'];
    if (item.left != null) base.left = item.left as ViewStyle['left'];
    if (item.right != null) base.right = item.right as ViewStyle['right'];
    if (item.rotate) base.transform = [{ rotate: item.rotate }];
    return base;
  }, [item, isSunsetBar]);

  return <Animated.View style={[positionStyle, animatedStyle]} />;
}

// ---- Main wrapper ----

export function SessionWrapper({ children }: SessionWrapperProps) {
  const themeId = (useAppStore((s) => s.themeId) ?? 'dark') as ThemeId;
  const { colors } = useTheme();

  const decorations = useMemo(
    () => getDecorations(themeId, colors),
    [themeId, colors],
  );

  return (
    <View testID="session-wrapper" style={styles.container}>
      {/* Decorative overlay -- does not intercept touches */}
      <View
        testID="session-decorations"
        style={styles.decorations}
        pointerEvents="none"
      >
        {decorations.map((item, i) => (
          <DecorationDot key={`${themeId}-${i}`} item={item} />
        ))}
      </View>

      {/* Session content renders on top */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
