import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Material } from '../data/materials';
import { SUBJECT_NAMES, Subject } from '../types';

interface MaterialListProps {
  materials: Material[];
}

export const MaterialList: React.FC<MaterialListProps> = ({ materials }) => {
  if (materials.length === 0) {
    return null;
  }

  const handlePress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {materials.map((material) => (
        <TouchableOpacity
          key={material.id}
          style={styles.card}
          onPress={() => handlePress(material.url)}
          activeOpacity={0.7}
        >
          <View style={styles.content}>
            <Text style={styles.name}>{material.name}</Text>
            <Text style={styles.description}>{material.description}</Text>
            <View style={styles.footer}>
              <Text style={styles.subject}>
                {SUBJECT_NAMES[material.subject as Subject]}
              </Text>
              <Text style={styles.price}>
                {material.price.toLocaleString()}円
              </Text>
            </View>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.hint}>
        タップで学宝社オンラインストアへ
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subject: {
    fontSize: 12,
    color: '#4A90D9',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  arrow: {
    fontSize: 20,
    color: '#4A90D9',
    marginLeft: 12,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});
