// Calendar Bar Component
// 7-day horizontal week selector with swipeable 3-week navigation

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { theme } from '../../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

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

export const CalendarBar: React.FC<CalendarBarProps> = ({
  selectedDate,
  onDateSelect,
  disabled = false,
}) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = last week, 2 = two weeks ago
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Calculate which week the selected date belongs to
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    const diffMs = today.getTime() - selected.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Calculate week offset
    const weekOffset = Math.floor(diffDays / 7);
    
    if (weekOffset !== currentWeekOffset && weekOffset >= 0 && weekOffset <= 2) {
      setCurrentWeekOffset(weekOffset);
      // Scroll to the correct week
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: weekOffset * screenWidth, animated: true });
      }, 100);
    }
  }, [selectedDate]);
  
  // Generate 3 weeks of data (current week + 2 past weeks)
  const generateThreeWeeks = (): DayItem[][] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weeks: DayItem[][] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate 3 weeks
    for (let weekOffset = 0; weekOffset <= 2; weekOffset++) {
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
        
        const dateString = formatDateYYYYMMDD(date);
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
  };
  
  const formatDateYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const threeWeeks = generateThreeWeeks();
  
  const handleDayPress = (dayItem: DayItem) => {
    if (dayItem.isFuture || disabled) return;
    onDateSelect(dayItem.fullDate);
  };
  
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newWeekOffset = Math.round(offsetX / screenWidth);
    
    if (newWeekOffset !== currentWeekOffset && newWeekOffset >= 0 && newWeekOffset <= 2) {
      setCurrentWeekOffset(newWeekOffset);
    }
  };
  
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
        snapToAlignment="center"
      >
        {threeWeeks.map((week, index) => renderWeek(week, index))}
      </ScrollView>
      
      {/* Week indicator dots */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map((index) => (
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  scrollContent: {
    alignItems: 'center',
  },
  weekContainer: {
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
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
