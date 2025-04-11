import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(userId: string, createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      userId,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async markAsResolved(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    feedback.isResolved = true;
    return this.feedbackRepository.save(feedback);
  }
} 