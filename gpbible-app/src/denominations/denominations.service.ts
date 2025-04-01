import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Denomination } from './entities/denomination.entity';

@Injectable()
export class DenominationsService {
  constructor(
    @InjectRepository(Denomination)
    private denominationsRepository: Repository<Denomination>,
  ) {}

  async findAll(): Promise<Denomination[]> {
    return this.denominationsRepository.find();
  }

  async findOne(id: string): Promise<Denomination> {
    return this.denominationsRepository.findOne({ where: { id } });
  }

  async create(denomination: Partial<Denomination>): Promise<Denomination> {
    const newDenomination = this.denominationsRepository.create(denomination);
    return this.denominationsRepository.save(newDenomination);
  }

  async update(id: string, denomination: Partial<Denomination>): Promise<Denomination> {
    await this.denominationsRepository.update(id, denomination);
    return this.denominationsRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.denominationsRepository.delete(id);
  }
} 