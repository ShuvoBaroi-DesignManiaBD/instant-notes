import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Reminder } from '../types';

class NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    this.configureNotifications();
  }

  private async configureNotifications() {
    // Configure how notifications appear when the app is in the foreground
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });

    // Request permission
    await this.requestPermissions();

    // Listen for notifications
    Notifications.addNotificationReceivedListener(this.handleNotification);
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';
      return finalStatus === 'granted';
    } else {
      console.log('Must use physical device for notifications');
      return false;
    }
  }

  private handleNotification = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
    // You can add custom handling here
  };

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
    // Handle user interaction with the notification
    // You could navigate to the specific note here
  };

  public async scheduleNotification(reminder: Reminder): Promise<string | null> {
    if (!this.hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        console.log('Notification permission not granted');
        return null;
      }
    }

    try {
      // Cancel any existing notification for this reminder
      await this.cancelNotification(reminder.id);

      // Only schedule if notification is enabled and due date is in the future
      if (reminder.notificationEnabled && reminder.dueDate > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.description || 'Reminder for your note',
            data: { noteId: reminder.noteId },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: reminder.dueDate,
          },
        });

        console.log(`Scheduled notification ${notificationId} for reminder ${reminder.id}`);
        return notificationId;
      }
      return null;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  public async cancelNotification(reminderId: string): Promise<void> {
    try {
      // In a real app, you would store the notification ID mapped to the reminder ID
      // For simplicity, we're using the reminder ID as the notification identifier
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      console.log(`Cancelled notification for reminder ${reminderId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();