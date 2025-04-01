import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingResponse } from './entities/onboarding-response.entity';
import { CreateOnboardingResponseDto } from './dto/create-onboarding-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingResponse)
    private onboardingRepository: Repository<OnboardingResponse>,
  ) {}

  async create(userId: string, createOnboardingDto: CreateOnboardingResponseDto): Promise<OnboardingResponse> {
    const onboarding = this.onboardingRepository.create({
      user: { id: userId },
      ...createOnboardingDto,
      onboardingCompleted: true
    });
    return this.onboardingRepository.save(onboarding);
  }

  async findByUserId(userId: string): Promise<OnboardingResponse> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding response for user ${userId} not found`);
    }

    return onboarding;
  }

  async update(userId: string, updateOnboardingDto: Partial<CreateOnboardingResponseDto>): Promise<OnboardingResponse> {
    const onboarding = await this.findByUserId(userId);
    const updated = Object.assign(onboarding, updateOnboardingDto);
    return this.onboardingRepository.save(updated);
  }

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { user: { id: userId } }
    });
    return !!onboarding?.onboardingCompleted;
  }
} 