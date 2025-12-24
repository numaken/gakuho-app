import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface DiagnosisResult {
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult | null;
  isLoading: boolean;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4A90D9" />
        <Text style={styles.loadingText}>診断中...</Text>
      </View>
    );
  }

  if (!diagnosis) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.comment}>{diagnosis.comment}</Text>

      {diagnosis.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>得意なところ</Text>
          {diagnosis.strengths.map((s, i) => (
            <Text key={i} style={styles.sectionText}>・{s}</Text>
          ))}
        </View>
      )}

      {diagnosis.weaknesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>もう少しがんばろう</Text>
          {diagnosis.weaknesses.map((w, i) => (
            <Text key={i} style={styles.sectionText}>・{w}</Text>
          ))}
        </View>
      )}

      <View style={styles.adviceBox}>
        <Text style={styles.adviceText}>{diagnosis.advice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  loadingText: {
    marginLeft: 12,
    color: '#666666',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  comment: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  adviceBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
});
