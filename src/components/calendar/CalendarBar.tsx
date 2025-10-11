// Calendar Bar Component
// 7-day horizontal week selector for date navigation

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface DayItem {
  day: string;
  date: number;
  isActive?: boolean;
  isDisabled?: boolean;
}

interface CalendarBarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  disabled?: boolean;
}

export const CalendarBar: React.FC<CalendarBarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  disabled = false,
}) => {
  // Generate current week data
  const generateWeekData = (): DayItem[] => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1); // Start from Monday

    const week: DayItem[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isFuture = date > today;

      week.push({
        day: dayNames[i],
        date: date.getDate(),
        isActive: isSelected || (isToday && !isSelected),
        isDisabled: isFuture,
      });
    }

    return week;
  };

  const weekData = generateWeekData();

  const handleDayPress = (dayItem: DayItem) => {
    if (dayItem.isDisabled || disabled || !onDateSelect) return;

    // Calculate the actual date for this day
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1);
    
    const dayIndex = weekData.findIndex(item => item.date === dayItem.date);
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);
    
    onDateSelect(targetDate);
  };

  return (
    <View style={styles.container}>
      {weekData.map((dayItem, index) => (
        <TouchableOpacity
          key={`${dayItem.day}-${dayItem.date}`}
          style={[
            styles.dayButton,
            dayItem.isActive && styles.activeDayButton,
            dayItem.isDisabled && styles.disabledDayButton,
          ]}
          onPress={() => handleDayPress(dayItem)}
          disabled={dayItem.isDisabled || disabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayLabel,
              dayItem.isActive && styles.activeDayLabel,
              dayItem.isDisabled && styles.disabledDayLabel,
            ]}
          >
            {dayItem.day}
          </Text>
          
          <View
            style={[
              styles.dateCircle,
              dayItem.isActive && styles.activeDateCircle,
              dayItem.isDisabled && styles.disabledDateCircle,
            ]}
          >
            <Text
              style={[
                styles.dateText,
                dayItem.isActive && styles.activeDateText,
                dayItem.isDisabled && styles.disabledDateText,
              ]}
            >
              {dayItem.date}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs, // Reduced from theme.spacing.base to xs
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg, // Changed from base to lg for more curved edges
    marginHorizontal: 2,
    minHeight: 56,
    justifyContent: 'center',
  },
  activeDayButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg, // Ensure active state also has curved edges
    ...theme.shadows.subtle,
  },
  disabledDayButton: {
    opacity: 0.4,
  },
  dayLabel: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.light, // Changed from medium to light
    color: '#9E9E9E',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  activeDayLabel: {
    color: '#000000',
    fontWeight: theme.typography.weights.regular, // Changed from semibold to regular
  },
  disabledDayLabel: {
    color: '#CFCFCF',
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDateCircle: {
    borderColor: '#000000',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  disabledDateCircle: {
    borderColor: '#CFCFCF',
  },
  dateText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.light, // Changed from regular to light
    color: '#9E9E9E',
  },
  activeDateText: {
    color: '#000000',
    fontWeight: theme.typography.weights.regular, // Changed from semibold to regular
  },
  disabledDateText: {
    color: '#CFCFCF',
  },
});
