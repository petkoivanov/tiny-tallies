/**
 * PeerBenchmarkScreen — shows anonymous peer comparison data for parents.
 *
 * Displays percentile rankings by skill domain at national and state levels.
 * Only accessible when the parent has opted into benchmarking.
 */

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Globe, MapPin } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { useBenchmarks } from '@/hooks/useBenchmarks';
import type { BenchmarkDomain } from '@/services/api/apiClient';

/** Format skill domain ID into readable label */
function formatDomain(domain: string): string {
  if (domain === 'overall') return 'Overall';
  return domain
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** Color for percentile badge */
function percentileColor(p: number, colors: { correct: string; primary: string; textSecondary: string; incorrect: string }): string {
  if (p >= 75) return colors.correct;
  if (p >= 50) return colors.primary;
  if (p >= 25) return colors.textSecondary;
  return colors.incorrect;
}

function PercentileBar({
  domain,
  styles,
  colors,
}: {
  domain: BenchmarkDomain;
  styles: ReturnType<typeof createStyles>;
  colors: Record<string, string>;
}) {
  const pColor = percentileColor(domain.percentile, colors as never);
  const barWidth = `${Math.max(5, domain.percentile)}%` as `${number}%`;

  return (
    <View style={styles.domainRow} testID={`benchmark-domain-${domain.skillDomain}`}>
      <View style={styles.domainHeader}>
        <Text style={styles.domainLabel}>{formatDomain(domain.skillDomain)}</Text>
        <View style={[styles.percentileBadge, { backgroundColor: pColor }]}>
          <Text style={styles.percentileText}>{domain.percentile}th</Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: pColor }]} />
        {/* Quartile markers */}
        <View style={[styles.quartileMark, { left: '25%' }]} />
        <View style={[styles.quartileMark, { left: '50%' }]} />
        <View style={[styles.quartileMark, { left: '75%' }]} />
      </View>
      <Text style={styles.sampleText}>
        Based on {domain.sampleSize} {domain.sampleSize === 1 ? 'child' : 'children'}
      </Text>
    </View>
  );
}

function createStyles(colors: Record<string, string>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    backButton: {
      minWidth: layout.minTouchTarget,
      minHeight: layout.minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      color: colors.textPrimary,
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    domainRow: {
      gap: spacing.xs,
    },
    domainHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    domainLabel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
    percentileBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: layout.borderRadius.sm,
    },
    percentileText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: '#fff',
    },
    barTrack: {
      height: 12,
      backgroundColor: colors.backgroundLight,
      borderRadius: 6,
      overflow: 'hidden',
      position: 'relative',
    },
    barFill: {
      height: '100%',
      borderRadius: 6,
    },
    quartileMark: {
      position: 'absolute',
      top: 0,
      width: 1,
      height: '100%',
      backgroundColor: colors.textMuted,
      opacity: 0.3,
    },
    sampleText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
    },
    infoText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    centeredText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    errorText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.incorrect,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    retryButton: {
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: layout.borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#fff',
    },
  });
}

export default function PeerBenchmarkScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const benchmarkOptIn = useAppStore((s) => s.benchmarkOptIn);
  const ageRange = useAppStore((s) => s.ageRange);
  const childName = useAppStore((s) => s.childName);

  const { data, loading, error, refresh } = useBenchmarks();

  const styles = useMemo(() => createStyles(colors as never), [colors]);

  // Not opted in
  if (!benchmarkOptIn || !ageRange) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Peer Benchmarks</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.centeredText}>
            Enable peer benchmarking in Parental Controls to see how{' '}
            {childName ?? 'your child'} compares with other kids.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Peer Benchmarks</Text>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centeredText}>Loading benchmarks...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={refresh}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {data && !loading && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <Text style={styles.infoText}>
            Showing percentile rankings for age group {data.ageRange}
            {data.stateCode ? ` in ${data.stateCode}` : ''}
          </Text>

          {/* National Benchmarks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>National</Text>
            </View>
            <View style={styles.card}>
              {data.national.map((domain) => (
                <PercentileBar
                  key={domain.skillDomain}
                  domain={domain}
                  styles={styles}
                  colors={colors as never}
                />
              ))}
            </View>
          </View>

          {/* State Benchmarks */}
          {data.state && data.state.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  {data.stateCode ?? 'State'}
                </Text>
              </View>
              <View style={styles.card}>
                {data.state.map((domain) => (
                  <PercentileBar
                    key={domain.skillDomain}
                    domain={domain}
                    styles={styles}
                    colors={colors as never}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {!data && !loading && !error && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>
            No benchmark data available yet. Keep practicing and sync to see comparisons!
          </Text>
        </View>
      )}
    </View>
  );
}
