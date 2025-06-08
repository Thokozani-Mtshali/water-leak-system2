import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeProps = {
  children: React.ReactNode;
  style?: object;
};

export function Badge({ children, style }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#6b7280', // gray-500
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginRight: 4,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
