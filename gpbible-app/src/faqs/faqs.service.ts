import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQ } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FAQsService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) {}

  async findAll(): Promise<FAQ[]> {
    return this.faqRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqRepository.findOne({
      where: { id, isActive: true }
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID "${id}" not found`);
    }

    return faq;
  }

  async findByCategory(category: string): Promise<FAQ[]> {
    return this.faqRepository.find({
      where: { category, isActive: true },
      order: { order: 'ASC' }
    });
  }

  async create(createFaqDto: CreateFaqDto): Promise<FAQ> {
    const faq = this.faqRepository.create(createFaqDto);
    return this.faqRepository.save(faq);
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<FAQ> {
    const faq = await this.findOne(id);
    Object.assign(faq, updateFaqDto);
    return this.faqRepository.save(faq);
  }

  async remove(id: string): Promise<void> {
    const faq = await this.findOne(id);
    faq.isActive = false;
    await this.faqRepository.save(faq);
  }
} 