import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRating } from './entities/app-rating.entity';
import { CreateAppRatingDto } from './dto/create-app-rating.dto';

@Injectable()
export class AppRatingsService {
  constructor(
    @InjectRepository(AppRating)
    private appRatingRepository: Repository<AppRating>,
  ) {}

  async create(createAppRatingDto: CreateAppRatingDto): Promise<AppRating> {
    const appRating = this.appRatingRepository.create(createAppRatingDto);
    return this.appRatingRepository.save(appRating);
  }

  async findByUserId(userId: string): Promise<AppRating[]> {
    return this.appRatingRepository.find({ where: { userId } });
  }

  async getUserHasRated(userId: string): Promise<boolean> {
    const count = await this.appRatingRepository.count({ where: { userId } });
    return count > 0;
  }

  async getUserDontShowAgain(userId: string): Promise<boolean> {
    const userRating = await this.appRatingRepository.findOne({
      where: { userId, dontShowAgain: true },
    });
    return !!userRating;
  }
} 