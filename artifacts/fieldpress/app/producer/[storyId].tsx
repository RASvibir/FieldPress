// FieldPress — AI Producer Screen
// Takes the story's text notes and generates a summary, outline, and social caption.
// v1: All mocked locally. v2 hook: swap generateAiDraft() with a real API call.
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { generateAiDraft } from '@/services/aiMock';
import { useStories } from '@/state/store';
import { AiDraft } from '@/types';

function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Pressable
      onPress={handleCopy}
      style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.7 }]}
    >
      <Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? Colors.success : Colors.textSecondary} />
      <Text style={[styles.copyBtnText, copied && { color: Colors.success }]}>
        {copied ? 'COPIED!' : label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

function LoadingState() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ).start();

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIcon}>
        <Feather name="cpu" size={32} color={Colors.cyan} />
      </View>
      <Text style={styles.loadingTitle}>GENERATING DRAFT</Text>
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
      <Text style={styles.loadingSubtitle}>{'> Analysing field notes...'}</Text>
    </View>
  );
}

export default function AiProducerScreen() {
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const { getStoryById, getItemsForStory } = useStories();

  const story = getStoryById(storyId ?? '');
  const allItems = story ? getItemsForStory(storyId ?? '') : [];
  const textItems = allItems.filter((i) => i.type === 'text');

  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!story) {
      setError('Story not found.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    generateAiDraft(story, textItems)
      .then((result) => {
        setDraft(result);
        setIsLoading(false);
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      })
      .catch(() => {
        setError('Failed to generate draft. Please try again.');
        setIsLoading(false);
      });
  }, [storyId]);

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      {/* Header with scan-line gradient */}
      <LinearGradient
        colors={['#003300', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Feather name="cpu" size={16} color={Colors.cyan} />
          <Text style={styles.headerTitle}>AI PRODUCER</Text>
        </View>
        <View style={styles.headerBtn} />
      </LinearGradient>

      {story && (
        <View style={styles.storyChip}>
          <Feather name="file-text" size={12} color={Colors.textSecondary} />
          <Text style={styles.storyChipText} numberOfLines={1}>
            {story.title}
          </Text>
          <View style={styles.noteCountBadge}>
            <Text style={styles.noteCountText}>{textItems.length} NOTE{textItems.length !== 1 ? 'S' : ''}</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={28} color={Colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>{'< GO BACK'}</Text>
          </Pressable>
        </View>
      ) : draft ? (
        <Animated.ScrollView
          style={{ opacity: fadeIn }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + webBottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>SUMMARY</Text>
              </View>
              <CopyButton label="Copy summary" text={draft.summary} />
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{draft.summary}</Text>
            </View>
          </View>

          {/* Story Outline */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, styles.sectionBadgeCyan]}>
                <Text style={[styles.sectionBadgeText, styles.sectionBadgeTextCyan]}>OUTLINE</Text>
              </View>
            </View>
            <View style={styles.outlineCard}>
              {draft.outline.map((bullet, i) => (
                <View key={i} style={styles.outlineItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Caption */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, styles.sectionBadgeAmber]}>
                <Text style={[styles.sectionBadgeText, styles.sectionBadgeTextAmber]}>CAPTION</Text>
              </View>
              <CopyButton label="Copy caption" text={draft.caption} />
            </View>
            <View style={styles.captionCard}>
              <Text style={styles.captionText}>{draft.caption}</Text>
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Feather name="info" size={12} color={Colors.textMuted} />
            <Text style={styles.disclaimerText}>
              AI-generated draft — verify all facts before publishing.
            </Text>
          </View>
        </Animated.ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.text,
    letterSpacing: 3,
  },
  storyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: Colors.card,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  storyChipText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  noteCountBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  noteCountText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.25)',
    marginBottom: 4,
  },
  loadingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cyan,
  },
  loadingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    letterSpacing: 0.5,
  },
  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backLinkText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  sectionBadgeCyan: {
    backgroundColor: Colors.audioBlueBg,
    borderColor: 'rgba(0,255,255,0.25)',
  },
  sectionBadgeAmber: {
    backgroundColor: 'rgba(255,192,0,0.10)',
    borderColor: 'rgba(255,192,0,0.25)',
  },
  sectionBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 2,
  },
  sectionBadgeTextCyan: {
    color: Colors.cyan,
  },
  sectionBadgeTextAmber: {
    color: Colors.amber,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  summaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  outlineCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.cyan,
  },
  outlineItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: Colors.cyan,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  captionCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
  },
  captionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  disclaimerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
