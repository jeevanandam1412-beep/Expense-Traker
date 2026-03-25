import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SummaryCard({ title, value, icon, color, trend }) {
  const theme = useTheme();
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.info}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {title}
          </Text>
          <Text variant="titleLarge" style={[styles.value, { color }]}>
            {value}
          </Text>
          {trend != null && (
            <View style={styles.trendRow}>
              <MaterialCommunityIcons
                name={trend >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend >= 0 ? '#EF5350' : '#26A69A'}
              />
              <Text style={{ fontSize: 11, color: trend >= 0 ? '#EF5350' : '#26A69A', marginLeft: 2 }}>
                {Math.abs(trend)}% vs last week
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  value: { fontWeight: '700', marginTop: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
});
