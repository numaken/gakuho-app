import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Question, Subject, SUBJECT_NAMES } from '../../types';
import {
  getAllQuestions,
  deleteQuestion,
  isCustomQuestion,
} from '../../utils/storage';

export default function AdminScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');

  const loadQuestions = async () => {
    const allQuestions = await getAllQuestions();
    setQuestions(allQuestions);
  };

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [])
  );

  const filteredQuestions =
    filterSubject === 'all'
      ? questions
      : questions.filter((q) => q.subject === filterSubject);

  const handleDelete = (question: Question) => {
    if (!isCustomQuestion(question.id)) {
      Alert.alert('削除不可', 'デフォルト問題は削除できません');
      return;
    }

    Alert.alert('確認', 'この問題を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteQuestion(question.id);
          loadQuestions();
        },
      },
    ]);
  };

  const handleEdit = (question: Question) => {
    if (!isCustomQuestion(question.id)) {
      Alert.alert('編集不可', 'デフォルト問題は編集できません');
      return;
    }
    router.push(`/admin/edit?id=${question.id}`);
  };

  const renderQuestion = ({ item }: { item: Question }) => {
    const isCustom = isCustomQuestion(item.id);

    return (
      <TouchableOpacity
        style={styles.questionCard}
        onPress={() => handleEdit(item)}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.subjectBadge}>{SUBJECT_NAMES[item.subject]}</Text>
          {isCustom && <Text style={styles.customBadge}>カスタム</Text>}
          <Text style={styles.difficultyText}>
            {'★'.repeat(item.difficulty)}
          </Text>
        </View>
        <Text style={styles.questionText} numberOfLines={2}>
          {item.question}
        </Text>
        <View style={styles.questionFooter}>
          <Text style={styles.answerText}>
            正解: {item.choices[item.correctIndex]}
          </Text>
          {isCustom && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteButtonText}>削除</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const subjects: (Subject | 'all')[] = [
    'all',
    'japanese',
    'social',
    'math',
    'science',
    'english',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>問題管理</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.filterContainer}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.filterButton,
              filterSubject === subject && styles.filterButtonActive,
            ]}
            onPress={() => setFilterSubject(subject)}
          >
            <Text
              style={[
                styles.filterText,
                filterSubject === subject && styles.filterTextActive,
              ]}
            >
              {subject === 'all' ? '全て' : SUBJECT_NAMES[subject]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.countText}>{filteredQuestions.length}問</Text>

      <FlatList
        data={filteredQuestions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.addButtonContainer}>
        <Button
          title="+ 問題を追加"
          onPress={() => router.push('/admin/edit')}
          variant="primary"
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#4A90D9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  filterText: {
    fontSize: 12,
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  countText: {
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  subjectBadge: {
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  customBadge: {
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFB800',
    marginLeft: 'auto',
  },
  questionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#F44336',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});
