import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useStories } from '@/state/store';
import { Story, StoryStatus } from '@/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StoryCard({
  story,
  itemCount,
  onArchiveToggle,
}: {
  story: Story;
  itemCount: number;
  onArchiveToggle: (story: Story) => void;
}) {
  const isArchived = story.status === 'archived';

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/story/[storyId]', params: { storyId: story.id } });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onArchiveToggle(story);
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        isArchived && styles.cardArchived,
      ]}
    >
      <View style={[styles.cardAccent, isArchived && styles.cardAccentArchived]} />
      <View style={styles.cardBody}>
        <Text
          style={[styles.cardTitle, isArchived && styles.cardTitleArchived]}
          numberOfLines={2}
        >
          {story.title}
        </Text>
        <View style={styles.cardMeta}>
          <Feather name="clock" size={12} color={isArchived ? Colors.textMuted : Colors.textMuted} />
          <Text style={styles.cardDate}>{formatDate(story.createdAt)}</Text>
          {itemCount > 0 && (
            <View style={[styles.itemBadge, isArchived && styles.itemBadgeArchived]}>
              <Text style={[styles.itemBadgeText, isArchived && styles.itemBadgeTextArchived]}>
                {itemCount}
              </Text>
            </View>
          )}
          {isArchived && (
            <View style={styles.archivedBadge}>
              <Feather name="archive" size={10} color={Colors.textMuted} />
              <Text style={styles.archivedBadgeText}>ARCHIVED</Text>
            </View>
          )}
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={18}
        color={isArchived ? Colors.textMuted : Colors.textMuted}
      />
    </Pressable>
  );
}

function EmptyState({ filter }: { filter: StoryStatus }) {
  if (filter === 'archived') {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Feather name="archive" size={36} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>NO ARCHIVED STORIES</Text>
        <Text style={styles.emptySubtitle}>
          Long-press any active story to move it to the archive.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather name="file-text" size={36} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>NO STORIES YET</Text>
      <Text style={styles.emptySubtitle}>
        Tap the green button to file your first story from the field.
      </Text>
    </View>
  );
}

export default function StoryListScreen() {
  const insets = useSafeAreaInsets();
  const { stories, getItemsForStory, createStory, setStoryStatus } = useStories();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<StoryStatus>('active');
  const inputRef = useRef<TextInput>(null);

  const filteredStories = stories.filter((s) => s.status === filter);

  const handleArchiveToggle = (story: Story) => {
    const newStatus: StoryStatus = story.status === 'active' ? 'archived' : 'active';
    const action = newStatus === 'archived' ? 'Archive' : 'Restore';
    const message = newStatus === 'archived'
      ? 'This story will be moved to your archive. You can restore it anytime.'
      : 'This story will be moved back to your active stories.';

    Alert.alert(
      `${action} Story`,
      message,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: action.toUpperCase(),
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStoryStatus(story.id, newStatus);
          },
        },
      ],
    );
  };

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewTitle('');
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleCreate = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const story = createStory(trimmed);
    setModalVisible(false);
    router.push({ pathname: '/story/[storyId]', params: { storyId: story.id } });
  };

  const toggleFilter = () => {
    Haptics.selectionAsync();
    setFilter((prev) => (prev === 'active' ? 'archived' : 'active'));
  };

  const activeCount = stories.filter((s) => s.status === 'active').length;
  const archivedCount = stories.filter((s) => s.status === 'archived').length;

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <LinearGradient
        colors={['#003300', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <View style={styles.wordmark}>
              <Text style={styles.wordmarkField}>FIELD</Text>
              <Text style={styles.wordmarkPress}>PRESS</Text>
            </View>
            <Text style={styles.tagline}>// POCKET NEWSROOM</Text>
          </View>
        </View>
        <Pressable
          onPress={() => { Haptics.selectionAsync(); router.push('/travel'); }}
          style={({ pressed }) => [styles.travelTag, pressed && { opacity: 0.7 }]}
        >
          <Feather name="navigation" size={14} color={Colors.accent} />
          <Text style={styles.travelText}>NAV</Text>
        </Pressable>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>WIRE</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Pressable onPress={toggleFilter} style={styles.filterToggle}>
          <Feather
            name={filter === 'active' ? 'radio' : 'archive'}
            size={14}
            color={filter === 'active' ? Colors.accent : Colors.textMuted}
          />
          <Text style={[
            styles.sectionTitle,
            filter === 'archived' && styles.sectionTitleArchived,
          ]}>
            {filter === 'active' ? 'ACTIVE STORIES' : 'ARCHIVED'}
          </Text>
        </Pressable>
        <View style={styles.filterRight}>
          <Text style={styles.sectionCount}>
            {filter === 'active' ? activeCount : archivedCount}
          </Text>
          {archivedCount > 0 && filter === 'active' && (
            <Pressable onPress={toggleFilter} style={styles.archiveToggleBtn}>
              <Feather name="archive" size={12} color={Colors.textMuted} />
              <Text style={styles.archiveToggleText}>{archivedCount}</Text>
            </Pressable>
          )}
          {filter === 'archived' && (
            <Pressable onPress={toggleFilter} style={styles.archiveToggleBtn}>
              <Feather name="radio" size={12} color={Colors.accent} />
              <Text style={[styles.archiveToggleText, { color: Colors.accent }]}>ACTIVE</Text>
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            itemCount={getItemsForStory(item.id).length}
            onArchiveToggle={handleArchiveToggle}
          />
        )}
        ListEmptyComponent={<EmptyState filter={filter} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + webBottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      />

      {filter === 'active' && (
        <Pressable
          onPress={openModal}
          style={[
            styles.fabWrapper,
            { bottom: insets.bottom + webBottomPad + 24 },
          ]}
        >
          <LinearGradient
            colors={[Colors.accent, '#009900']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color={Colors.background} />
          </LinearGradient>
        </Pressable>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Feather name="edit-3" size={20} color={Colors.accent} />
              <Text style={styles.modalTitle}>NEW STORY</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              {'> '}Enter headline to begin filing your story.
            </Text>
            <TextInput
              ref={inputRef}
              style={styles.modalInput}
              placeholder="Story headline..."
              placeholderTextColor={Colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              maxLength={120}
              multiline={false}
              autoCapitalize="sentences"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createBtn,
                  !newTitle.trim() && styles.createBtnDisabled,
                ]}
                onPress={handleCreate}
                disabled={!newTitle.trim()}
              >
                <Feather name="send" size={15} color={Colors.background} />
                <Text style={styles.createBtnText}>CREATE STORY</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 2,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 0,
  },
  wordmarkField: {
    fontFamily: 'VT323_400Regular',
    fontSize: 34,
    color: Colors.text,
    letterSpacing: 4,
  },
  wordmarkPress: {
    fontFamily: 'VT323_400Regular',
    fontSize: 34,
    color: Colors.accent,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginTop: 2,
  },
  travelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    marginRight: 6,
  },
  travelText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.accent,
    letterSpacing: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accent,
  },
  liveText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.accent,
    letterSpacing: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionTitleArchived: {
    color: Colors.textMuted,
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionCount: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  archiveToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  archiveToggleText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardArchived: {
    opacity: 0.6,
  },
  cardAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.accent,
  },
  cardAccentArchived: {
    backgroundColor: Colors.textMuted,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.text,
    lineHeight: 28,
  },
  cardTitleArchived: {
    color: Colors.textMuted,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardDate: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  itemBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  itemBadgeArchived: {
    backgroundColor: Colors.surface,
    borderColor: Colors.cardBorder,
  },
  itemBadgeText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.accent,
    letterSpacing: 1,
  },
  itemBadgeTextArchived: {
    color: Colors.textMuted,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  archivedBadgeText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 3,
  },
  emptySubtitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  fabWrapper: {
    position: 'absolute',
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 4,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    borderLeftWidth: 1,
    borderLeftColor: Colors.cardBorder,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 0,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 3,
  },
  modalSubtitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'VT323_400Regular',
    fontSize: 17,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    letterSpacing: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  createBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnDisabled: {
    opacity: 0.3,
  },
  createBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 15,
    color: Colors.background,
    letterSpacing: 2,
  },
});
