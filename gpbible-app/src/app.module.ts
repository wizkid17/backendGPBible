import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DenominationsModule } from './denominations/denominations.module';
import { BibleVersionsModule } from './bible-versions/bible-versions.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DonationsModule } from './donations/donations.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { ImmersiveStoriesModule } from './immersive-stories/immersive-stories.module';
import { AiAvatarsModule } from './ai-avatars/ai-avatars.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MeditationModule } from './meditation/meditation.module';
import { TourModule } from './tour/tour.module';
import { SpiritualGrowthModule } from './spiritual-growth/spiritual-growth.module';
import { SpiritualAssessmentModule } from './spiritual-assessment/spiritual-assessment.module';
import { AppRatingsModule } from './app-ratings/app-ratings.module';
import { MessagingModule } from './messaging/messaging.module';
import { FAQsModule } from './faqs/faqs.module';
import { User } from './users/entities/user.entity';
import { Denomination } from './denominations/entities/denomination.entity';
import { BibleVersion } from './bible-versions/entities/bible-version.entity';
import { UserPreference } from './user-preferences/entities/user-preference.entity';
import { UserSettings } from './user-preferences/entities/user-settings.entity';
import { OnboardingResponse } from './onboarding/entities/onboarding-response.entity';
import { NotificationPreference } from './notifications/entities/notification-preference.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { Donation } from './donations/entities/donation.entity';
import { VerificationCode } from './auth/entities/verification-code.entity';
import { AiAvatar } from './ai-avatars/entities/ai-avatar.entity';
import { Meditation } from './meditation/entities/meditation.entity';
import { TourStep } from './tour/entities/tour-step.entity';
import { SpiritualGrowthTrack } from './spiritual-growth/entities/spiritual-growth-track.entity';
import { SpiritualCheckIn } from './spiritual-growth/entities/spiritual-check-in.entity';
import { SpiritualPathQuestion, SpiritualPathSuggestion, UserSpiritualPath, UserSpiritualQuestion } from './spiritual-growth/entities/spiritual-path.entity';
import { SpiritualPathTempSelection } from './spiritual-growth/entities/spiritual-path-selection.entity';
import { SpiritualAssessment } from './spiritual-assessment/entities/spiritual-assessment.entity';
import { SpiritualAssessmentQuestion } from './spiritual-assessment/entities/spiritual-assessment-question.entity';
import { SpiritualAssessmentResponse } from './spiritual-assessment/entities/spiritual-assessment-response.entity';
import { AppRating } from './app-ratings/entities/app-rating.entity';
import { ChatMessage } from './messaging/entities/chat-message.entity';
import { ChatGroup } from './messaging/entities/chat-group.entity';
import { ChatGroupMember } from './messaging/entities/chat-group-member.entity';
import { ChatConversation } from './messaging/entities/chat-conversation.entity';
import { AiChatMessage } from './ai-chat/entities/ai-chat-message.entity';
import { FAQ } from './faqs/entities/faq.entity';
import { SpiritualProgressModule } from './spiritual-progress/spiritual-progress.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AboutModule } from './about/about.module';
import { Feedback } from './feedback/entities/feedback.entity';
import { About } from './about/entities/about.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          Denomination,
          BibleVersion,
          UserPreference,
          UserSettings,
          OnboardingResponse,
          NotificationPreference,
          Subscription,
          Donation,
          VerificationCode,
          AiAvatar,
          Meditation,
          TourStep,
          SpiritualGrowthTrack,
          SpiritualCheckIn,
          SpiritualPathQuestion,
          SpiritualPathSuggestion,
          UserSpiritualPath,
          UserSpiritualQuestion,
          SpiritualPathTempSelection,
          SpiritualAssessment,
          SpiritualAssessmentQuestion,
          SpiritualAssessmentResponse,
          AppRating,
          ChatMessage,
          ChatGroup,
          ChatGroupMember,
          ChatConversation,
          AiChatMessage,
          FAQ,
          Feedback,
          About
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DenominationsModule,
    BibleVersionsModule,
    UserPreferencesModule,
    OnboardingModule,
    NotificationsModule,
    SubscriptionsModule,
    DonationsModule,
    AiChatModule,
    ImmersiveStoriesModule,
    AiAvatarsModule,
    DashboardModule,
    MeditationModule,
    TourModule,
    SpiritualGrowthModule,
    SpiritualAssessmentModule,
    AppRatingsModule,
    MessagingModule,
    FAQsModule,
    FeedbackModule,
    AboutModule,
    SpiritualProgressModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
