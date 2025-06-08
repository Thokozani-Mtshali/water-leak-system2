// app/debug.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function DebugScreen() {
  // Manually list your expected routes here to check
  const routes = ['index', 'report', 'map', 'profile'];

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
        Expected Routes:
      </Text>
      {routes.map((route) => (
        <Text key={route} style={{ fontSize: 16, marginVertical: 5 }}>
          {route}
        </Text>
      ))}
      <Text style={{ marginTop: 20, fontSize: 14, color: 'gray' }}>
        Check if these files exist in your `(tabs)` folder and are named exactly.
      </Text>
    </ScrollView>
  );
}
