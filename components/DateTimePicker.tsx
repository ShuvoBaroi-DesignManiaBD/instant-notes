import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Button,
  Text,
  useTheme,
  IconButton,
  Surface,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DateTimePickerComponentProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  showClearButton?: boolean;
}

export default function DateTimePickerComponent({
  value,
  onChange,
  label = 'Select Date & Time',
  placeholder = 'No date selected',
  showClearButton = true,
}: DateTimePickerComponentProps) {
  const theme = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(tempDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setTempDate(newDate);
      onChange(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(tempDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setTempDate(newDate);
      onChange(newDate);
    }
  };

  const clearDate = () => {
    onChange(undefined);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.content}>
          {value ? (
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.icon}
                />
                <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>
                  {formatDate(value)}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setShowDatePicker(true)}
                  style={styles.changeButton}
                >
                  Change
                </Button>
              </View>
              
              <View style={styles.dateTimeRow}>
                <MaterialCommunityIcons
                  name="clock"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.icon}
                />
                <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                  {formatTime(value)}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setShowTimePicker(true)}
                  style={styles.changeButton}
                >
                  Change
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={theme.colors.onSurfaceVariant}
                style={styles.placeholderIcon}
              />
              <Text style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}>
                {placeholder}
              </Text>
            </View>
          )}
          
          <View style={styles.actions}>
            {!value && (
              <Button
                mode="contained"
                onPress={() => setShowDatePicker(true)}
                icon="calendar-plus"
                style={styles.selectButton}
              >
                Select Date
              </Button>
            )}
            
            {value && showClearButton && (
              <IconButton
                icon="close"
                size={20}
                onPress={clearDate}
                style={styles.clearButton}
              />
            )}
          </View>
        </View>
      </Surface>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  surface: {
    borderRadius: 12,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  dateTimeContainer: {
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    flex: 1,
  },
  changeButton: {
    minWidth: 80,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  placeholderIcon: {
    marginRight: 8,
  },
  placeholder: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  selectButton: {
    flex: 1,
  },
  clearButton: {
    margin: 0,
  },
});