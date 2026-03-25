import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

export default function FilterBar({ options, selected, onSelect, style }) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((opt) => (
        <Chip
          key={opt.value}
          selected={selected === opt.value}
          onPress={() => onSelect(opt.value)}
          style={[
            styles.chip,
            selected === opt.value && { backgroundColor: theme.colors.primaryContainer },
          ]}
          textStyle={[
            styles.chipText,
            selected === opt.value && { color: theme.colors.onPrimaryContainer, fontWeight: '700' },
          ]}
          compact
        >
          {opt.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { borderRadius: 20 },
  chipText: { fontSize: 12 },
});
