import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { About } from './entities/about.entity';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private readonly aboutRepository: Repository<About>,
  ) {}

  async getAboutInfo(): Promise<About> {
    const about = await this.aboutRepository.findOne({
      order: { updatedAt: 'DESC' }
    });

    if (!about) {
      throw new NotFoundException('About information not found');
    }

    return about;
  }

  async getCoreValues(): Promise<Record<string, string>> {
    const about = await this.getAboutInfo();
    return about.coreValues;
  }

  async getTimeline(): Promise<Array<{ year: number; description: string }>> {
    const about = await this.getAboutInfo();
    return about.timeline;
  }

  async getTeam(): Promise<Array<{ name: string; role: string; imageUrl: string }>> {
    const about = await this.getAboutInfo();
    return about.team;
  }
} 