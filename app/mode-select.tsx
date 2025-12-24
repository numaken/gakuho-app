import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { QuizMode, Subject, TimeLimit, SUBJECT_NAMES } from '../types';

const TIME_OPTIONS: TimeLimit[] = [5, 10, 30, 60];
const SUBJECTS: Subject[] = ['japanese', 'social', 'math', 'science', 'english'];

export default function ModeSelectScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>('normal');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(30);
  const [isMixMode, setIsMixMode] = useState(false);

  const handleSubjectToggle = (subject: Subject) => {
    if (isMixMode) return;
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleMixModeToggle = (mix: boolean) => {
    setIsMixMode(mix);
    if (mix) {
      setSelectedSubjects([...SUBJECTS]);
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleStart = () => {
    if (selectedSubjects.length === 0) return;

    const params = new URLSearchParams({
      mode,
      subjects: selectedSubjects.join(','),
      timeLimit: timeLimit.toString(),
    });

    router.push(`/quiz?${params.toString()}`);
  };

  const canStart = selectedSubjects.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>

        <Text style={styles.title}>モード選択</Text>

        {/* クイズモード選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイズモード</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'normal' && styles.modeButtonActive]}
              onPress={() => setMode('normal')}
            >
              <Text style={styles.modeIcon}>📚</Text>
              <Text
                style={[
                  styles.modeText,
                  mode === 'normal' && styles.modeTextActive,
                ]}
              >
                通常クイズ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'weak' && styles.modeButtonActive]}
              onPress={() => setMode('weak')}
            >
              <Text style={styles.modeIcon}>💪</Text>
              <Text
                style={[styles.modeText, mode === 'weak' && styles.modeTextActive]}
              >
                苦手克服モード
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 教科選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>教科選択</Text>
          <View style={styles.subjectTypeContainer}>
            <TouchableOpacity
              style={[
                styles.subjectTypeButton,
                !isMixMode && styles.subjectTypeButtonActive,
              ]}
              onPress={() => handleMixModeToggle(false)}
            >
              <Text style={styles.subjectTypeIcon}>📖</Text>
              <Text
                style={[
                  styles.subjectTypeText,
                  !isMixMode && styles.subjectTypeTextActive,
                ]}
              >
                1教科チャレンジ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subjectTypeButton,
                isMixMode && styles.subjectTypeButtonActive,
              ]}
              onPress={() => handleMixModeToggle(true)}
            >
              <Text style={styles.subjectTypeIcon}>🌈</Text>
              <Text
                style={[
                  styles.subjectTypeText,
                  isMixMode && styles.subjectTypeTextActive,
                ]}
              >
                5教科ミックス
              </Text>
            </TouchableOpacity>
          </View>

          {!isMixMode && (
            <View style={styles.subjectsContainer}>
              {SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectButton,
                    selectedSubjects.includes(subject) && styles.subjectButtonActive,
                  ]}
                  onPress={() => handleSubjectToggle(subject)}
                >
                  <Text
                    style={[
                      styles.subjectText,
                      selectedSubjects.includes(subject) && styles.subjectTextActive,
                    ]}
                  >
                    {SUBJECT_NAMES[subject]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 時間設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>時間設定</Text>
          <View style={styles.timeContainer}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  timeLimit === time && styles.timeButtonActive,
                ]}
                onPress={() => setTimeLimit(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    timeLimit === time && styles.timeTextActive,
                  ]}
                >
                  {time}秒
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.startContainer}>
          <Button
            title="スタート"
            onPress={handleStart}
            variant="primary"
            size="large"
            disabled={!canStart}
            style={styles.startButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#4A90D9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 12,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modeButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  modeTextActive: {
    color: '#FF6B35',
  },
  subjectTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  subjectTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  subjectTypeButtonActive: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  subjectTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  subjectTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
  },
  subjectTypeTextActive: {
    color: '#4A90D9',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timeButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  timeTextActive: {
    color: '#FF6B35',
  },
  startContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  startButton: {
    width: '100%',
  },
});
