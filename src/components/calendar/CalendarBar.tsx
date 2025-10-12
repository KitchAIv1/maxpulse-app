// Calendar Bar Component
// 7-day horizontal week selector with swipeable 3-week navigation

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { theme } from '../../utils/theme';

const { width: screenWidth} = Dimensions.get('window');

interface DayItem {
  day: string; // Mon, Tue, etc.
  date: number; // Day of month
  fullDate: string; // YYYY-MM-DD
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
}

interface CalendarBarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  disabled?: boolean;
}

const CalendarBarComponent: React.FC<CalendarBarProps> = ({
  selectedDate,
  onDateSelect,
  disabled = false,
}) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(2); // Array index: 0 = 2 weeks ago, 1 = last week, 2 = current week
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Initial scroll to current week on mount
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 2 * screenWidth, animated: false });
    }, 100);
  }, []);
  
  // Calculate which week the selected date belongs to
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    const diffMs = today.getTime() - selected.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Calculate week offset from today
    const weeksAgo = Math.floor(diffDays / 7);
    
    // Map to array index: current week (0 weeks ago) = index 2, last week (1 week ago) = index 1, etc.
    const arrayIndex = 2 - weeksAgo;
    
    if (arrayIndex !== currentWeekOffset && arrayIndex >= 0 && arrayIndex <= 2) {
      setCurrentWeekOffset(arrayIndex);
      // Scroll to the correct week
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: arrayIndex * screenWidth, animated: true });
      }, 100);
    }
  }, [selectedDate]);
  
  // Memoize generated weeks data to avoid unnecessary recalculations
  const threeWeeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const weeks: DayItem[][] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate 3 weeks in reverse order (oldest first)
    for (let weekOffset = 2; weekOffset >= 0; weekOffset--) {
      const week: DayItem[] = [];
      
      // Calculate start of this week (Monday)
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since last Monday
      weekStart.setDate(today.getDate() - daysToMonday - (weekOffset * 7));
      
      // Generate 7 days for this week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        
        const dateString = formatDate(date);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = dateString === selectedDate;
        const isFuture = date > today;
        
        week.push({
          day: dayNames[dayIndex],
          date: date.getDate(),
          fullDate: dateString,
          isToday,
          isSelected,
          isFuture,
        });
      }
      
      weeks.push(week);
    }
    
    return weeks;
  }, [selectedDate]);
  
  const handleDayPress = useCallback((dayItem: DayItem) => {
    if (dayItem.isFuture || disabled) return;
    onDateSelect(dayItem.fullDate);
  }, [disabled, onDateSelect]);
  
  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newWeekOffset = Math.round(offsetX / screenWidth);
    
    if (newWeekOffset !== currentWeekOffset && newWeekOffset >= 0 && newWeekOffset <= 2) {
      setCurrentWeekOffset(newWeekOffset);
    }
  }, [currentWeekOffset]);
  
  const renderWeek = (week: DayItem[], weekIndex: number) => (
    <View key={`week-${weekIndex}`} style={styles.weekContainer}>
      {week.map((dayItem, dayIndex) => (
        <TouchableOpacity
          key={`${dayItem.fullDate}-${dayIndex}`}
          style={[
            styles.dayButton,
            dayItem.isSelected && styles.activeDayButton,
            dayItem.isFuture && styles.disabledDayButton,
          ]}
          onPress={() => handleDayPress(dayItem)}
          disabled={dayItem.isFuture || disabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayLabel,
              dayItem.isSelected && styles.activeDayLabel,
              dayItem.isFuture && styles.disabledDayLabel,
              dayItem.isToday && !dayItem.isSelected && styles.todayDayLabel,
            ]}
          >
            {dayItem.day}
          </Text>
          
          <View
            style={[
              styles.dateCircle,
              dayItem.isSelected && styles.activeDateCircle,
              dayItem.isFuture && styles.disabledDateCircle,
              dayItem.isToday && !dayItem.isSelected && styles.todayDateCircle,
            ]}
          >
            <Text
              style={[
                styles.dateText,
                dayItem.isSelected && styles.activeDateText,
                dayItem.isFuture && styles.disabledDateText,
                dayItem.isToday && !dayItem.isSelected && styles.todayDateText,
              ]}
            >
              {dayItem.date}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.calendarWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="start"
        >
          {threeWeeks.map((week, index) => renderWeek(week, index))}
        </ScrollView>
      </View>
      
      {/* Week indicator dots */}
      <View style={styles.indicatorContainer}>
        {[2, 1, 0].map((index) => (
          <View
            key={`indicator-${index}`}
            style={[
              styles.indicator,
              currentWeekOffset === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// Memoize component to prevent unnecessary re-renders
export const CalendarBar = React.memo(CalendarBarComponent, (prevProps, nextProps) => {
  return (
    prevProps.selectedDate === nextProps.selectedDate &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onDateSelect === nextProps.onDateSelect
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  calendarWrapper: {
    marginLeft: -(screenWidth / 7) * 0.25, // Shift left by 0.25 day width (was 0.5, moved right by 0.25)
  },
  scrollContent: {
    // Empty but required for proper alignment
  },
  weekContainer: {
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base, // Match App.tsx scrollContent padding (16px)
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: 2,
    minHeight: 56,
    justifyContent: 'center',
  },
  activeDayButton: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.subtle,
  },
  disabledDayButton: {
    opacity: 0.4,
  },
  dayLabel: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.light,
    color: '#9E9E9E',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  activeDayLabel: {
    color: '#000000',
    fontWeight: theme.typography.weights.regular,
  },
  todayDayLabel: {
    color: '#6B7280',
    fontWeight: theme.typography.weights.medium,
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
  todayDateCircle: {
    borderColor: '#6B7280',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  disabledDateCircle: {
    borderColor: '#CFCFCF',
  },
  dateText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.light,
    color: '#9E9E9E',
  },
  activeDateText: {
    color: '#000000',
    fontWeight: theme.typography.weights.regular,
  },
  todayDateText: {
    color: '#6B7280',
    fontWeight: theme.typography.weights.medium,
  },
  disabledDateText: {
    color: '#CFCFCF',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  activeIndicator: {
    backgroundColor: '#6B7280',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
