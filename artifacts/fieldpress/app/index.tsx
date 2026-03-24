// FieldPress — Story List Screen
// The newsroom home: all active stories. Tap to open, "+" to file a new story.
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  FlatList,
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
import { Story } from '@/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StoryCard({ story, itemCount }: { story: Story; itemCount: number }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/story/[storyId]', params: { storyId: story.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <View style={styles.cardMeta}>
          <Feather name="clock" size={12} color={Colors.textMuted} />
          <Text style={styles.cardDate}>{formatDate(story.createdAt)}</Text>
          {itemCount > 0 && (
            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather name="file-text" size={36} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No stories yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the red button to file your first story from the field.
      </Text>
    </View>
  );
}

export default function StoryListScreen() {
  const insets = useSafeAreaInsets();
  const { stories, getItemsForStory, createStory } = useStories();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<TextInput>(null);

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewTitle('');
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleCreate = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const story = createStory(trimmed);
    setModalVisible(false);
    router.push({ pathname: '/story/[storyId]', params: { storyId: story.id } });
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.wordmark}>
            <Text style={styles.wordmarkField}>FIELD</Text>
            <Text style={styles.wordmarkPress}>PRESS</Text>
          </View>
          <Text style={styles.tagline}>Pocket Newsroom</Text>
        </View>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>WIRE</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Stories</Text>
        <Text style={styles.sectionCount}>{stories.length}</Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            itemCount={getItemsForStory(item.id).length}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + webBottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={openModal}
        style={[
          styles.fab,
          { bottom: insets.bottom + webBottomPad + 24 },
        ]}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      {/* New Story Modal */}
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
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Feather name="edit-3" size={20} color={Colors.accent} />
              <Text style={styles.modalTitle}>New Story</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Give your story a headline to start reporting.
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
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createBtn,
                  !newTitle.trim() && styles.createBtnDisabled,
                ]}
                onPress={handleCreate}
                disabled={!newTitle.trim()}
              >
                <Feather name="send" size={15} color={Colors.white} />
                <Text style={styles.createBtnText}>Create Story</Text>
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
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 0,
  },
  wordmarkField: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 2,
  },
  wordmarkPress: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.accent,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
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
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: Colors.accent,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },
  itemBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  itemBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  createBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.white,
  },
});
