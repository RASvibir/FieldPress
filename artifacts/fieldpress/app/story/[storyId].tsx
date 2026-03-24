// FieldPress — Story Detail Screen
// The reporter's desk: write text notes, record audio clips, open AI Producer.
// Workflow: collect raw material here → AI Producer turns it into a publishable draft.
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  isAudioSupported,
  playRecording,
  requestMicPermission,
  startRecording,
  stopPlayback,
  stopRecording,
} from '@/services/audio';
import { useStories } from '@/state/store';
import { StoryItem } from '@/types';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function TextNoteItem({ item }: { item: StoryItem }) {
  return (
    <View style={styles.textCard}>
      <View style={styles.textCardDot} />
      <View style={styles.textCardContent}>
        <Text style={styles.noteText}>{item.content}</Text>
        <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );
}

function AudioClipItem({
  item,
  index,
  isPlaying,
  onPlayToggle,
}: {
  item: StoryItem;
  index: number;
  isPlaying: boolean;
  onPlayToggle: (item: StoryItem) => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  return (
    <View style={[styles.audioCard, isPlaying && styles.audioCardPlaying]}>
      <Animated.View
        style={[styles.audioIconContainer, isPlaying && styles.audioIconActive, { opacity: isPlaying ? pulseAnim : 1 }]}
      >
        <Feather name="mic" size={16} color={isPlaying ? Colors.white : Colors.audioBlue} />
      </Animated.View>
      <View style={styles.audioInfo}>
        <Text style={styles.audioLabel}>Field Recording #{index + 1}</Text>
        <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
      </View>
      <Pressable
        onPress={() => onPlayToggle(item)}
        style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.7 }]}
      >
        <Ionicons
          name={isPlaying ? 'stop-circle' : 'play-circle'}
          size={30}
          color={isPlaying ? Colors.accent : Colors.audioBlue}
        />
      </Pressable>
    </View>
  );
}

export default function StoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const { getStoryById, getItemsForStory, addTextItem, addAudioItem } = useStories();

  const story = getStoryById(storyId ?? '');
  const items = story ? getItemsForStory(storyId ?? '') : [];

  const [noteText, setNoteText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  const recordPulse = useRef(new Animated.Value(1)).current;

  // Pre-compute audio clip index so numbering is stable across re-renders
  const audioIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    let count = 0;
    items.forEach((item) => {
      if (item.type === 'audio') {
        map.set(item.id, count);
        count++;
      }
    });
    return map;
  }, [items]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(recordPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      recordPulse.stopAnimation();
      recordPulse.setValue(1);
    }
  }, [isRecording]);

  const handleAddNote = useCallback(() => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTextItem(storyId ?? '', trimmed);
    setNoteText('');
  }, [noteText, storyId]);

  const handleRecordToggle = useCallback(async () => {
    if (!isAudioSupported) {
      Alert.alert('Not supported', 'Audio recording is not available on web.');
      return;
    }
    if (isRecording) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const uri = await stopRecording();
        addAudioItem(storyId ?? '', uri);
        setIsRecording(false);
      } catch (err) {
        setIsRecording(false);
        Alert.alert('Error', 'Failed to stop recording.');
      }
    } else {
      let granted = micPermission;
      if (granted === null) {
        granted = await requestMicPermission();
        setMicPermission(granted);
      }
      if (!granted) {
        Alert.alert(
          'Microphone Access Needed',
          'FieldPress needs microphone access to record audio notes. Please enable it in Settings.',
          [{ text: 'OK' }],
        );
        return;
      }
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await startRecording();
        setIsRecording(true);
      } catch (err) {
        Alert.alert('Error', 'Failed to start recording. Please try again.');
      }
    }
  }, [isRecording, micPermission, storyId]);

  const handlePlayToggle = useCallback(async (item: StoryItem) => {
    if (playingId === item.id) {
      await stopPlayback();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      try {
        await playRecording(item.content, () => setPlayingId(null));
      } catch {
        setPlayingId(null);
        Alert.alert('Error', 'Could not play this recording.');
      }
    }
  }, [playingId]);

  const handleAiProducer = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/producer/[storyId]', params: { storyId: storyId ?? '' } });
  };

  if (!story) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={32} color={Colors.textMuted} />
        <Text style={styles.errorText}>Story not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.container, { paddingBottom: webBottomPad }]}
      keyboardVerticalOffset={0}
    >
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + webTopPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {story.title}
        </Text>
        <Pressable
          onPress={handleAiProducer}
          style={({ pressed }) => [styles.aiBtn, pressed && { opacity: 0.75 }]}
        >
          <Feather name="cpu" size={14} color={Colors.accent} />
          <Text style={styles.aiBtnText}>AI</Text>
        </Pressable>
      </View>

      {/* Recording indicator banner */}
      {isRecording && (
        <Animated.View style={[styles.recordingBanner, { transform: [{ scale: recordPulse }] }]}>
          <View style={styles.recordDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </Animated.View>
      )}

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          if (item.type === 'text') {
            return <TextNoteItem item={item} />;
          }
          return (
            <AudioClipItem
              item={item}
              index={audioIndexMap.get(item.id) ?? 0}
              isPlaying={playingId === item.id}
              onPlayToggle={handlePlayToggle}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyItems}>
            <Feather name="inbox" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyItemsText}>
              Add text notes or record audio to start building your story.
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Composer */}
      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.composerInput}
          placeholder="Add a field note..."
          placeholderTextColor={Colors.textMuted}
          value={noteText}
          onChangeText={setNoteText}
          multiline
          maxLength={2000}
          returnKeyType="default"
          textAlignVertical="top"
        />
        <View style={styles.composerActions}>
          <Pressable
            onPress={handleAddNote}
            disabled={!noteText.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              !noteText.trim() && styles.sendBtnDisabled,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="send" size={18} color={noteText.trim() ? Colors.white : Colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={handleRecordToggle}
            style={({ pressed }) => [
              styles.recordBtn,
              isRecording && styles.recordBtnActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={20}
              color={Colors.white}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: Colors.text,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  aiBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentMuted,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  recordingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.accent,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  textCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  textCardDot: {
    width: 3,
    backgroundColor: Colors.textSecondary,
    alignSelf: 'stretch',
    opacity: 0.4,
  },
  textCardContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  noteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  itemTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.audioBlueBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    marginBottom: 10,
    gap: 10,
  },
  audioCardPlaying: {
    borderColor: 'rgba(59,130,246,0.4)',
    backgroundColor: Colors.audioBlueActive,
  },
  audioIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconActive: {
    backgroundColor: Colors.audioBlue,
  },
  audioInfo: {
    flex: 1,
    gap: 3,
  },
  audioLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  playBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyItems: {
    alignItems: 'center',
    paddingTop: 50,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyItemsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
    padding: 12,
    gap: 8,
  },
  composerInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 44,
    maxHeight: 120,
  },
  composerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.card,
  },
  recordBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.audioBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: Colors.accent,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.accent,
  },
});
