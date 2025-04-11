import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';
import { UserSettings } from './entities/user-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings])],
  providers: [UserPreferencesService],
  controllers: [UserPreferencesController],
  exports: [UserPreferencesService]
})
export class UserPreferencesModule {} 