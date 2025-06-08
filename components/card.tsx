import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
});
