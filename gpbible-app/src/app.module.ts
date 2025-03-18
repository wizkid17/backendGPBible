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
import { User } from './users/entities/user.entity';
import { Denomination } from './denominations/entities/denomination.entity';
import { BibleVersion } from './bible-versions/entities/bible-version.entity';
import { UserPreference } from './user-preferences/entities/user-preference.entity';
import { OnboardingResponse } from './onboarding/entities/onboarding-response.entity';
import { VerificationCode } from './auth/entities/verification-code.entity';

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
          OnboardingResponse,
          VerificationCode
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
