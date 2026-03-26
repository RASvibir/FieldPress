// FieldPress — Story Detail Screen
// The reporter's desk: write text notes, record audio clips, open AI Producer.
// Workflow: collect raw material here → AI Producer turns it into a publishable draft.
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

const GLITCH_CHARS = '█▓▒░▄▀▐▌┤┐└┴┬├─┼╞╟╚╔╩╦╠═╬▲►▼◄■○●◘◙';

function useGlitchText(length: number, active: boolean) {
  const [noise, setNoise] = useState('');
  useEffect(() => {
    if (!active) { setNoise(''); return; }
    const id = setInterval(() => {
      let s = '';
      for (let i = 0; i < length; i++) {
        s += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setNoise(s);
    }, 80);
    return () => clearInterval(id);
  }, [active, length]);
  return noise;
}

function GlitchRecordingBanner() {
  const noise1 = useGlitchText(14, true);
  const noise2 = useGlitchText(14, true);
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const [labelGlitch, setLabelGlitch] = useState(false);

  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.15, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.delay(Math.random() * 600 + 200),
        Animated.timing(flickerAnim, { toValue: 0.3, duration: 30, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.delay(Math.random() * 1000 + 400),
      ]),
    );
    flicker.start();
    return () => flicker.stop();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLabelGlitch(true);
      setTimeout(() => setLabelGlitch(false), 120);
    }, 1500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <Animated.View style={[glitchStyles.container, { opacity: flickerAnim }]}>
      <View style={glitchStyles.scanline} />
      <View style={glitchStyles.scanline2} />
      <Text style={glitchStyles.noise}>{noise1}</Text>
      <View style={glitchStyles.centerRow}>
        <View style={glitchStyles.recDot} />
        <Text style={[glitchStyles.recLabel, labelGlitch && glitchStyles.recLabelGlitch]}>
          {labelGlitch ? '▓▒R░E▒C▓' : '● REC'}
        </Text>
        <Text style={glitchStyles.recTime}>
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </Text>
      </View>
      <Text style={glitchStyles.noise}>{noise2}</Text>
    </Animated.View>
  );
}

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
        <Feather name="mic" size={16} color={isPlaying ? Colors.background : Colors.audioBlue} />
      </Animated.View>
      <View style={styles.audioInfo}>
        <Text style={styles.audioLabel}>FIELD REC #{index + 1}</Text>
        <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
      </View>
      <Pressable
        onPress={() => onPlayToggle(item)}
        style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.7 }]}
      >
        <Ionicons
          name={isPlaying ? 'stop-circle' : 'play-circle'}
          size={30}
          color={isPlaying ? Colors.danger : Colors.audioBlue}
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/producer/[storyId]', params: { storyId: storyId ?? '' } });
  };

  if (!story) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={32} color={Colors.textMuted} />
        <Text style={styles.errorText}>Story not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>{'< GO BACK'}</Text>
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
      {/* Custom Header with scan-line gradient */}
      <LinearGradient
        colors={['#003300', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + webTopPad + 8 }]}
      >
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
          <Feather name="cpu" size={14} color={Colors.cyan} />
          <Text style={styles.aiBtnText}>AI</Text>
        </Pressable>
      </LinearGradient>

      {/* Glitchy static recording indicator */}
      {isRecording && <GlitchRecordingBanner />}

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
          placeholder="> add a field note..."
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
            <Feather name="send" size={18} color={noteText.trim() ? Colors.background : Colors.textMuted} />
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
              color={Colors.background}
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
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 0.8,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.25)',
  },
  aiBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 12,
    color: Colors.cyan,
    letterSpacing: 2,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  textCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  textCardDot: {
    width: 3,
    backgroundColor: Colors.accent,
    alignSelf: 'stretch',
    opacity: 0.5,
  },
  textCardContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  noteText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 19,
    color: Colors.text,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  itemTime: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.audioBlueBg,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
    gap: 10,
  },
  audioCardPlaying: {
    borderColor: Colors.text,
    backgroundColor: Colors.audioBlueActive,
  },
  audioIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 2,
    backgroundColor: Colors.audioBlueBg,
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
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
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
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
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
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'VT323_400Regular',
    fontSize: 19,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 44,
    maxHeight: 120,
    letterSpacing: 0.5,
  },
  composerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 4,
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
    borderRadius: 4,
    backgroundColor: Colors.audioBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: Colors.danger,
  },
  errorText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backLinkText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 19,
    color: Colors.accent,
    letterSpacing: 2,
  },
});

const glitchStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 49, 49, 0.15)',
  },
  scanline2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  noise: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 16,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  recLabel: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.accent,
    letterSpacing: 4,
  },
  recLabelGlitch: {
    color: Colors.textSecondary,
  },
  recTime: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 2,
  },
});
