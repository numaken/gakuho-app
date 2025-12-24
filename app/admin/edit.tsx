import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Question, Subject, SUBJECT_NAMES } from '../../types';
import {
  addQuestion,
  updateQuestion,
  getCustomQuestions,
  generateQuestionId,
} from '../../utils/storage';

const SUBJECTS: Subject[] = ['japanese', 'social', 'math', 'science', 'english'];
const DIFFICULTIES = [1, 2, 3] as const;

export default function EditQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id as string | undefined;
  const isEdit = !!editId;

  const [subject, setSubject] = useState<Subject>('japanese');
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (editId) {
      loadQuestion(editId);
    }
  }, [editId]);

  const loadQuestion = async (id: string) => {
    const customQuestions = await getCustomQuestions();
    const question = customQuestions.find((q) => q.id === id);
    if (question) {
      setSubject(question.subject);
      setQuestionText(question.question);
      setChoices(question.choices);
      setCorrectIndex(question.correctIndex);
      setDifficulty(question.difficulty);
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const validate = (): boolean => {
    if (!questionText.trim()) {
      Alert.alert('エラー', '問題文を入力してください');
      return false;
    }

    const filledChoices = choices.filter((c) => c.trim());
    if (filledChoices.length < 2) {
      Alert.alert('エラー', '選択肢を2つ以上入力してください');
      return false;
    }

    if (!choices[correctIndex].trim()) {
      Alert.alert('エラー', '正解の選択肢が空です');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const filteredChoices = choices.map((c) => c.trim() || '　');

    const question: Question = {
      id: editId || generateQuestionId(subject),
      subject,
      question: questionText.trim(),
      choices: filteredChoices,
      correctIndex,
      difficulty,
    };

    if (isEdit) {
      await updateQuestion(question);
      Alert.alert('完了', '問題を更新しました', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      await addQuestion(question);
      Alert.alert('完了', '問題を追加しました', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? '問題を編集' : '問題を追加'}</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 教科選択 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教科</Text>
            <View style={styles.subjectContainer}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.subjectButton,
                    subject === s && styles.subjectButtonActive,
                  ]}
                  onPress={() => setSubject(s)}
                >
                  <Text
                    style={[
                      styles.subjectText,
                      subject === s && styles.subjectTextActive,
                    ]}
                  >
                    {SUBJECT_NAMES[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 難易度選択 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>難易度</Text>
            <View style={styles.difficultyContainer}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.difficultyButton,
                    difficulty === d && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={styles.difficultyText}>{'★'.repeat(d)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 問題文 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>問題文</Text>
            <TextInput
              style={styles.questionInput}
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="問題文を入力"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* 選択肢 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>選択肢（正解をタップで選択）</Text>
            {choices.map((choice, index) => (
              <View key={index} style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.correctButton,
                    correctIndex === index && styles.correctButtonActive,
                  ]}
                  onPress={() => setCorrectIndex(index)}
                >
                  <Text
                    style={[
                      styles.correctButtonText,
                      correctIndex === index && styles.correctButtonTextActive,
                    ]}
                  >
                    {correctIndex === index ? '正解' : index + 1}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.choiceInput}
                  value={choice}
                  onChangeText={(value) => handleChoiceChange(index, value)}
                  placeholder={`選択肢${index + 1}`}
                />
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isEdit ? '更新する' : '追加する'}
              onPress={handleSave}
              variant="primary"
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  subjectButtonActive: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  subjectTextActive: {
    color: '#4A90D9',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  difficultyButtonActive: {
    borderColor: '#FFB800',
    backgroundColor: '#FFFBF0',
  },
  difficultyText: {
    fontSize: 16,
    color: '#FFB800',
  },
  questionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  correctButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  correctButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  correctButtonTextActive: {
    color: '#4CAF50',
  },
  choiceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
});
