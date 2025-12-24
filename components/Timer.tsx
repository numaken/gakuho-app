import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const progress = timeLeft / totalTime;
  const isUrgent = timeLeft <= 5;

  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress * 100}%`,
              backgroundColor: isUrgent ? '#FF4444' : '#4A90D9',
            },
          ]}
        />
      </View>
      <Text style={[styles.timeText, isUrgent && styles.urgentText]}>
        {timeLeft}秒
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  timeText: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  urgentText: {
    color: '#FF4444',
  },
});
