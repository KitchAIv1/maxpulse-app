// KPI Card Component for TriHabit
// Displays individual metric cards with progress and actions

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from '../ui/Badge';
import { Bar } from '../ui/Bar';

interface KPICardProps {
  title: string;
  value: string;
  sub: string;
  percent: number;
  onAdd?: () => void;
  addLabel?: string;
  onLog?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  sub,
  percent,
  onAdd,
  addLabel = '+ Add',
  onLog,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Badge label={`${Math.round(percent * 100)}%`} />
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
      
      <View style={styles.progressContainer}>
        <Bar percent={percent} />
      </View>
      
      {/* Removed redundant action buttons as requested */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4, // Small horizontal margin for spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden', // Prevent overflow
  },
  title: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flex: 1, // Allow title to take available space
    marginRight: 8, // Add space between title and badge
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
    width: '100%', // Ensure container takes full width
    overflow: 'hidden', // Prevent any overflow
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937', // gray-800
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});
