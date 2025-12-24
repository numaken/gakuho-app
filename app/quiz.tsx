import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Timer } from '../components/Timer';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/Button';
import { useTimer } from '../hooks/useTimer';
import { useQuizLogic } from '../hooks/useQuizLogic';
import { QuizMode, Subject, TimeLimit } from '../types';
import { updateMultipleQuestionStats, updateHighScore } from '../utils/storage';
import { generateScoreKey } from '../utils/scoring';
import {
  playCorrectFeedback,
  playIncorrectFeedback,
  playTimeUpFeedback,
  playCompleteFeedback,
} from '../utils/feedback';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mode = (params.mode as QuizMode) || 'normal';
  const subjects = (params.subjects as string)?.split(',') as Subject[];
  const timeLimit = parseInt(params.timeLimit as string, 10) as TimeLimit;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackOpacity] = useState(new Animated.Value(0));
  const [isCorrect, setIsCorrect] = useState(false);

  const {
    currentQuestion,
    currentIndex,
    questions,
    isFinished,
    answer,
    nextQuestion,
    initQuiz,
    getResult,
  } = useQuizLogic();

  const handleTimeUp = useCallback(() => {
    if (selectedIndex === null && currentQuestion) {
      // 時間切れで不正解として処理
      answer(-1, timeLimit);
      setShowResult(true);
      setIsCorrect(false);
      showFeedback();
      playTimeUpFeedback();
    }
  }, [selectedIndex, currentQuestion, answer, timeLimit]);

  const { timeLeft, start, reset: resetTimer, getElapsed } = useTimer({
    initialTime: timeLimit,
    onTimeUp: handleTimeUp,
  });

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      initQuiz({
        mode,
        subjects,
        timeLimit,
        questionCount: 10,
      });
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isFinished) {
      setSelectedIndex(null);
      setShowResult(false);
      resetTimer(timeLimit);
      start();
    }
  }, [currentIndex, questions.length, isFinished]);

  useEffect(() => {
    if (isFinished && questions.length > 0) {
      saveAndNavigate();
    }
  }, [isFinished]);

  const showFeedback = () => {
    feedbackOpacity.setValue(1);
    Animated.timing(feedbackOpacity, {
      toValue: 0,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();
  };

  const saveAndNavigate = async () => {
    const result = getResult();

    // クイズ完了のフィードバック
    playCompleteFeedback();

    // 統計を保存
    const statsToUpdate = result.answeredQuestions.map((q) => ({
      questionId: q.question.id,
      isCorrect: q.isCorrect,
    }));
    await updateMultipleQuestionStats(statsToUpdate);

    // ハイスコアを更新
    const scoreKey = generateScoreKey(mode, subjects, timeLimit);
    await updateHighScore(scoreKey, result.score);

    // 結果画面へ遷移
    const resultParams = new URLSearchParams({
      score: result.score.toString(),
      correct: result.correctCount.toString(),
      total: result.totalQuestions.toString(),
      mode,
      subjects: subjects.join(','),
      timeLimit: timeLimit.toString(),
    });

    router.replace(`/result?${resultParams.toString()}`);
  };

  const handleSelectChoice = (index: number) => {
    if (showResult || selectedIndex !== null) return;

    setSelectedIndex(index);
    const elapsed = getElapsed();
    const correct = answer(index, elapsed);
    setIsCorrect(correct);
    setShowResult(true);
    showFeedback();

    // 触覚フィードバック
    if (correct) {
      playCorrectFeedback();
    } else {
      playIncorrectFeedback();
    }
  };

  const handleNext = () => {
    nextQuestion();
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>問題を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <Timer timeLeft={timeLeft} totalTime={timeLimit} />
      </View>

      <Animated.View
        style={[
          styles.feedbackContainer,
          {
            opacity: feedbackOpacity,
            backgroundColor: isCorrect ? '#4CAF50' : '#F44336',
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.feedbackText}>
          {isCorrect ? '正解!' : '不正解...'}
        </Text>
      </Animated.View>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={selectedIndex}
        showResult={showResult}
        onSelectChoice={handleSelectChoice}
        disabled={showResult}
      />

      {showResult && (
        <View style={styles.nextContainer}>
          <Button
            title={currentIndex + 1 >= questions.length ? '結果を見る' : '次の問題'}
            onPress={handleNext}
            variant="primary"
            size="large"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -75,
    width: 150,
    paddingVertical: 16,
    borderRadius: 16,
    zIndex: 100,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
