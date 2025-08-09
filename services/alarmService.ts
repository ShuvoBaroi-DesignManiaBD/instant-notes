import { Reminder } from '../types';
import { notificationService } from './notifications';

type AlarmCallback = (reminder: Reminder) => void;
type SnoozeCallback = (reminder: Reminder, minutes: number) => void;
type DismissCallback = (reminder: Reminder) => void;

class AlarmService {
  private alarmCallback: AlarmCallback | null = null;
  private snoozeCallback: SnoozeCallback | null = null;
  private dismissCallback: DismissCallback | null = null;
  private activeAlarms: Map<string, Reminder> = new Map();
  private snoozeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupNotificationListener();
  }

  private setupNotificationListener() {
    // Override the notification handler to show alarm screen instead
    const originalHandleNotification = notificationService['handleNotification'];
    const originalHandleNotificationResponse = notificationService['handleNotificationResponse'];

    // Replace notification handlers with alarm handlers
    notificationService['handleNotification'] = (notification: any) => {
      console.log('Notification received, showing alarm screen:', notification);
      this.handleAlarmTrigger(notification);
    };

    notificationService['handleNotificationResponse'] = (response: any) => {
      console.log('Notification response received, showing alarm screen:', response);
      this.handleAlarmTrigger(response.notification);
    };
  }

  private handleAlarmTrigger(notification: any) {
    const noteId = notification.request?.content?.data?.noteId || notification.content?.data?.noteId;
    
    if (noteId && this.alarmCallback) {
      // Check if this alarm is already active to prevent duplicates
      if (this.activeAlarms.has(noteId)) {
        console.log(`Alarm for ${noteId} is already active, skipping duplicate`);
        return;
      }
      
      // Create a reminder object from notification data
      const reminder: Reminder = {
        id: noteId,
        noteId: noteId,
        title: notification.request?.content?.title || notification.content?.title || 'Reminder',
        description: notification.request?.content?.body || notification.content?.body || '',
        dueDate: new Date(),
        isCompleted: false,
        priority: 'medium',
        notificationEnabled: true,
      };
      
      // Add to active alarms
      this.activeAlarms.set(noteId, reminder);
      
      // Trigger the alarm callback
      this.alarmCallback(reminder);
    }
  }

  public setAlarmCallback(callback: AlarmCallback) {
    this.alarmCallback = callback;
  }

  public setSnoozeCallback(callback: SnoozeCallback) {
    this.snoozeCallback = callback;
  }

  public setDismissCallback(callback: DismissCallback) {
    this.dismissCallback = callback;
  }

  public async scheduleAlarm(reminder: Reminder): Promise<string | null> {
    // Don't schedule if reminder is completed or already active
    if (reminder.isCompleted || this.activeAlarms.has(reminder.id)) {
      console.log(`Skipping alarm scheduling for ${reminder.title} - already completed or active`);
      return null;
    }
    
    // Cancel any existing alarm for this reminder first
    await this.cancelAlarm(reminder.id);
    
    // Use the existing notification service to schedule the alarm
    const notificationId = await notificationService.scheduleNotification(reminder);
    
    if (notificationId) {
      // Track this alarm as scheduled
      this.activeAlarms.set(reminder.id, reminder);
    }
    
    return notificationId;
  }

  public async cancelAlarm(reminderId: string): Promise<void> {
    // Cancel the scheduled notification
    await notificationService.cancelNotification(reminderId);
    
    // Remove from active alarms
    this.activeAlarms.delete(reminderId);
    
    // Clear any snooze timer
    const snoozeTimer = this.snoozeTimers.get(reminderId);
    if (snoozeTimer) {
      clearTimeout(snoozeTimer);
      this.snoozeTimers.delete(reminderId);
    }
  }

  public async snoozeAlarm(reminder: Reminder, minutes: number): Promise<void> {
    console.log(`Snoozing alarm for ${reminder.title} for ${minutes} minutes`);
    
    // Remove from active alarms
    this.activeAlarms.delete(reminder.id);
    
    // Calculate new due date
    const newDueDate = new Date(Date.now() + minutes * 60 * 1000);
    const snoozedReminder: Reminder = {
      ...reminder,
      dueDate: newDueDate,
    };

    // Schedule new alarm for snoozed time
    await this.scheduleAlarm(snoozedReminder);
    
    // Call snooze callback if set
    if (this.snoozeCallback) {
      this.snoozeCallback(reminder, minutes);
    }
  }

  public async dismissAlarm(reminder: Reminder): Promise<void> {
    console.log(`Dismissing alarm for ${reminder.title}`);
    
    // Remove from active alarms
    this.activeAlarms.delete(reminder.id);
    
    // Cancel any future notifications for this reminder
    await notificationService.cancelNotification(reminder.id);
    
    // Clear any snooze timer
    const snoozeTimer = this.snoozeTimers.get(reminder.id);
    if (snoozeTimer) {
      clearTimeout(snoozeTimer);
      this.snoozeTimers.delete(reminder.id);
    }
    
    // Call dismiss callback if set
    if (this.dismissCallback) {
      this.dismissCallback(reminder);
    }
  }

  public getActiveAlarms(): Reminder[] {
    return Array.from(this.activeAlarms.values());
  }

  public isAlarmActive(reminderId: string): boolean {
    return this.activeAlarms.has(reminderId);
  }

  public async cancelAllAlarms(): Promise<void> {
    // Cancel all scheduled notifications
    await notificationService.cancelAllNotifications();
    
    // Clear all active alarms
    this.activeAlarms.clear();
    
    // Clear all snooze timers
    this.snoozeTimers.forEach(timer => clearTimeout(timer));
    this.snoozeTimers.clear();
  }

  // Method to manually trigger an alarm (for testing)
  public triggerAlarm(reminder: Reminder): void {
    if (this.alarmCallback) {
      this.activeAlarms.set(reminder.id, reminder);
      this.alarmCallback(reminder);
    }
  }
}

export const alarmService = new AlarmService();