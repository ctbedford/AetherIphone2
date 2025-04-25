import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { View, XStack, YStack, Text, Circle } from 'tamagui';
import { useColors } from '@/utils/colors';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from 'date-fns';

export interface StreakCalendarProps {
  /** Array of dates (ISO strings) when the habit was completed */
  completedDates: string[];
  /** Number of weeks to display (default: 4) */
  weekCount?: number;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component that displays a habit completion calendar with dots for each day
 */
export default function StreakCalendar({
  completedDates = [],
  weekCount = 4,
  style,
}: StreakCalendarProps) {
  const today = new Date();

  const completedDatesObjects = useMemo(() => {
    return completedDates.map(dateStr => new Date(dateStr));
  }, [completedDates]);

  // Generate weeks from the current week backwards
  const weeks = useMemo(() => {
    const result = [];
    const day = startOfWeek(today, { weekStartsOn: 0 }); // Sunday as first day

    // Get current week
    const currentWeek = Array(7)
      .fill(null)
      .map((_, i) => {
        const date = addDays(day, i);
        return {
          date,
          completed: completedDatesObjects.some((d) => isSameDay(d, date)),
          isToday: isSameDay(date, today),
          isPast: date < today,
          isFuture: date > today,
        };
      });
    result.push(currentWeek);

    // Get previous weeks
    for (let i = 1; i < weekCount; i++) {
      const startDay = subWeeks(day, i);
      const week = Array(7)
        .fill(null)
        .map((_, j) => {
          const date = addDays(startDay, j);
          return {
            date,
            completed: completedDatesObjects.some((d) => isSameDay(d, date)),
            isToday: false,
            isPast: date < today,
            isFuture: date > today,
          };
        });
      result.push(week);
    }

    // Reverse so most recent week is at the bottom
    return result.reverse();
  }, [completedDatesObjects, weekCount, today]);

  const dayNames = useMemo(() => {
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array(7)
      .fill(null)
      .map((_, i) => {
        return format(addDays(firstDayOfWeek, i), "EEE").charAt(0);
      });
  }, []);

  return (
    <YStack space="$3" style={style}>
      <Text fontSize="$3" fontWeight="$3" color="$content.primary">
        Activity
      </Text>
      
      <XStack justifyContent="space-between">
        {dayNames.map((day, index) => (
          <Text key={index} color="$gray11" textAlign="center" fontSize="$1">
            {day}
          </Text>
        ))}
      </XStack>
      
      <YStack space="$3">
        {weeks.map((week, weekIndex) => (
          <XStack key={`week-${weekIndex}`} justifyContent="space-between">
            {week.map((day, dayIndex) => (
              <YStack key={`day-${weekIndex}-${dayIndex}`} alignItems="center" space="$1">
                <Text 
                  fontSize="$1" 
                  color={day.isToday ? "$brand.primary" : "$content.subtle"}
                  fontWeight={day.isToday ? '$3' : '$2'}
                >
                  {day.date.getDate()}
                </Text>
                
                {/* Day circle */}
                <DayCircle 
                  completed={day.completed}
                  isToday={day.isToday}
                  isPast={day.isPast}
                  isFuture={day.isFuture}
                />
              </YStack>
            ))}
          </XStack>
        ))}
      </YStack>
      
      {/* Legend */}
      <XStack space="$4" justifyContent="center" marginTop="$2">
        <XStack space="$1" alignItems="center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "$gray6",
            }}
          />
          <Text fontSize="$2" color="$content.subtle">Not completed</Text>
        </XStack>
        
        <XStack space="$1" alignItems="center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "$primary9",
            }}
          />
          <Text fontSize="$2" color="$content.subtle">Completed</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

function DayCircle({ 
  completed, 
  isToday, 
  isPast, 
  isFuture 
}: { 
  completed: boolean; 
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}) {
  let backgroundColor = completed 
    ? "$primary9" 
    : "transparent";
  
  // Future dates should be more faded
  if (isFuture) {
    backgroundColor = "transparent";
  }
  
  return (
    <View style={[
      styles.dayCircle,
      {
        backgroundColor,
        borderWidth: isToday ? 1 : 0,
        borderColor: "$primary9",
      }
    ]} />
  );
}

const styles = StyleSheet.create({
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
}); 