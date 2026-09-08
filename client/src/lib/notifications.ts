import { translate, type Language } from './i18n';

export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  canSendNotifications(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  showMedicationReminder(
    medicationName: string, 
    dosage: string, 
    instructions: string,
    language: Language = 'fr'
  ): void {
    if (!this.canSendNotifications()) {
      return;
    }

    const title = translate('notification.reminder_title', language);
    const body = `${medicationName} - ${dosage}\n${this.getInstructionText(instructions, language)}`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `medication-${medicationName}`,
      requireInteraction: true,
      data: {
        medicationName,
        dosage,
        instructions,
        timestamp: Date.now()
      }
    });

    // Auto-close after 30 seconds if not interacted with
    setTimeout(() => {
      notification.close();
    }, 30000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  showStatusNotification(message: string, language: Language = 'fr'): void {
    if (!this.canSendNotifications()) {
      return;
    }

    const notification = new Notification(translate('app.title', language), {
      body: message,
      icon: '/favicon.ico',
      tag: 'status-update'
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  private getInstructionText(instructions: string, language: Language): string {
    const instructionMap: Record<string, Record<Language, string>> = {
      'before': {
        fr: 'Avant le repas',
        en: 'Before meal'
      },
      'during': {
        fr: 'Pendant le repas',
        en: 'During meal'
      },
      'after': {
        fr: 'Après le repas',
        en: 'After meal'
      },
      'anytime': {
        fr: 'À tout moment',
        en: 'Anytime'
      }
    };

    return instructionMap[instructions]?.[language] || instructions;
  }

  scheduleReminders(medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
    times: string[];
  }>, language: Language = 'fr'): void {
    if (!this.canSendNotifications()) {
      return;
    }

    // Clear existing scheduled notifications
    this.clearScheduledReminders();

    medications.forEach(medication => {
      medication.times.forEach(time => {
        this.scheduleNotificationForTime(medication, time, language);
      });
    });
  }

  private scheduleNotificationForTime(
    medication: { name: string; dosage: string; instructions: string },
    time: string,
    language: Language
  ): void {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showMedicationReminder(
        medication.name,
        medication.dosage,
        medication.instructions,
        language
      );
    }, timeUntilNotification);
  }

  private clearScheduledReminders(): void {
    // This would be more sophisticated in a real app with a proper scheduler
    // For now, we rely on the browser's built-in timeout management
  }
}

export const notificationManager = NotificationManager.getInstance();
