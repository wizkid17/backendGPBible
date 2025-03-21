import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {}

  async getUserNotifications(userId: string): Promise<any> {
    // En una implementación real, estas notificaciones se obtendrían de la base de datos
    // Para este ejemplo, devolveremos datos estáticos que coinciden con la imagen mostrada
    return {
      thisWeek: [
        {
          id: '1',
          type: 'dailyVerse',
          icon: '📖',
          title: 'Start your day with faith!',
          message: 'Read today\'s Bible verse and reflect with Grace.',
          minutesAgo: 5,
          isRead: false,
          hasAlert: true,
        },
        {
          id: '2',
          type: 'reminder',
          icon: '✅',
          title: 'Don\'t forget your weekly checklist!',
          message: 'Stay on track with your spiritual journey.',
          date: 'Yesterday',
          isRead: true,
          hasAlert: false,
        }
      ],
      previous: [
        {
          id: '3',
          type: 'achievement',
          icon: '🎯',
          title: 'Your monthly progress is ready!',
          message: 'Celebrate your achievements and keep growing.',
          minutesAgo: 5,
          isRead: false,
          hasAlert: true,
        },
        {
          id: '4',
          type: 'help',
          icon: '❓',
          title: 'Have questions or need advice?',
          message: 'Grace is here for you.',
          date: 'Yesterday',
          isRead: true,
          hasAlert: false,
        },
        {
          id: '5',
          type: 'social',
          icon: '👥',
          title: 'Camila invited you to a new group.',
          message: 'Connect and grow together.',
          minutesAgo: 15,
          isRead: false,
          hasAlert: true,
        },
        {
          id: '6',
          type: 'content',
          icon: '📺',
          title: 'A new video reflection is available: Luke 5:4',
          message: 'Tap to watch it',
          date: 'Yesterday',
          isRead: true,
          hasAlert: false,
        }
      ]
    };
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreference> {
    const preferences = await this.notificationPreferenceRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!preferences) {
      // Si no existen preferencias, las creamos con valores predeterminados
      return this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    const newPreferences = this.notificationPreferenceRepository.create({
      user: { id: userId },
      enabled: false, // Por defecto, las notificaciones están desactivadas hasta que el usuario las active
      dailyVersesEnabled: true,
      prayerRemindersEnabled: true,
      studyRemindersEnabled: true,
      eventNotificationsEnabled: true,
    });

    return this.notificationPreferenceRepository.save(newPreferences);
  }

  async updateNotificationPreferences(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preferences = await this.getNotificationPreferences(userId);
    
    const updatedPreferences = {
      ...preferences,
      ...updateDto,
    };

    return this.notificationPreferenceRepository.save(updatedPreferences);
  }

  async enableNotifications(userId: string): Promise<NotificationPreference> {
    return this.updateNotificationPreferences(userId, { enabled: true });
  }

  async disableNotifications(userId: string): Promise<NotificationPreference> {
    return this.updateNotificationPreferences(userId, { enabled: false });
  }

  // En una implementación real, aquí tendríamos métodos para enviar diferentes tipos de notificaciones
  // Por ejemplo:
  
  async sendDailyVerseNotification(userId: string, verse: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    
    if (preferences.enabled && preferences.dailyVersesEnabled) {
      // Lógica para enviar la notificación, por ejemplo:
      // - Usar Firebase Cloud Messaging
      // - Enviar un email
      // - Guardar en la base de datos para mostrar en la app
      console.log(`Enviando notificación de versículo diario a ${userId}: ${verse}`);
    }
  }

  async sendPrayerReminder(userId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    
    if (preferences.enabled && preferences.prayerRemindersEnabled) {
      console.log(`Enviando recordatorio de oración a ${userId}`);
    }
  }

  async sendStudyReminder(userId: string, studyName: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    
    if (preferences.enabled && preferences.studyRemindersEnabled) {
      console.log(`Enviando recordatorio de estudio a ${userId}: ${studyName}`);
    }
  }
} 