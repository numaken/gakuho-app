import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Question, SUBJECT_NAMES } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedIndex: number | null;
  showResult: boolean;
  onSelectChoice: (index: number) => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedIndex,
  showResult,
  onSelectChoice,
  disabled = false,
}) => {
  const getChoiceStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index ? styles.selectedChoice : styles.choice;
    }

    if (index === question.correctIndex) {
      return styles.correctChoice;
    }

    if (selectedIndex === index && index !== question.correctIndex) {
      return styles.wrongChoice;
    }

    return styles.choice;
  };

  const getChoiceTextStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index
        ? styles.selectedChoiceText
        : styles.choiceText;
    }

    if (index === question.correctIndex) {
      return styles.correctChoiceText;
    }

    if (selectedIndex === index && index !== question.correctIndex) {
      return styles.wrongChoiceText;
    }

    return styles.choiceText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subjectBadge}>
          {SUBJECT_NAMES[question.subject]}
        </Text>
        <Text style={styles.difficultyText}>
          {'★'.repeat(question.difficulty)}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.choicesContainer}>
        {question.choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => onSelectChoice(index)}
            disabled={disabled || showResult}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceNumber}>{index + 1}</Text>
            <Text style={getChoiceTextStyle(index)}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectBadge: {
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  difficultyText: {
    fontSize: 16,
    color: '#FFB800',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333333',
    textAlign: 'center',
  },
  choicesContainer: {
    gap: 12,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  correctChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  wrongChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  choiceNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#666666',
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  selectedChoiceText: {
    flex: 1,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  correctChoiceText: {
    flex: 1,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  wrongChoiceText: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
});
