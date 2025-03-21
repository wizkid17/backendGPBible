import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus } from './entities/donation.entity';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(createDonationDto: CreateDonationDto, userId?: string): Promise<Donation> {
    const donation = this.donationRepository.create({
      ...createDonationDto,
      user: userId ? { id: userId } : null,
    });

    return this.donationRepository.save(donation);
  }

  async findAll(): Promise<Donation[]> {
    return this.donationRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUserId(userId: string): Promise<Donation[]> {
    return this.donationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Donation> {
    return this.donationRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  async updateStatus(id: string, status: DonationStatus, transactionId?: string): Promise<Donation> {
    const donation = await this.findOne(id);
    
    if (!donation) {
      throw new Error(`Donation with ID ${id} not found`);
    }
    
    donation.status = status;
    
    if (transactionId) {
      donation.transactionId = transactionId;
    }
    
    return this.donationRepository.save(donation);
  }

  async getTotalDonations(): Promise<number> {
    const result = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();
    
    return parseFloat(result.total) || 0;
  }
  
  async getDonationsCount(): Promise<number> {
    return this.donationRepository.count({
      where: { status: DonationStatus.COMPLETED }
    });
  }

  // Método para procesar el pago de la donación
  // Nota: Este es un método simulado. En una implementación real,
  // integrarías un proveedor de pagos como Stripe, PayPal, etc.
  async processDonation(donationId: string): Promise<Donation> {
    try {
      // Simular procesamiento de pago (en una implementación real, aquí se llamaría a la API del proveedor de pagos)
      const transactionId = `trans_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Actualizar el estado de la donación
      return this.updateStatus(donationId, DonationStatus.COMPLETED, transactionId);
    } catch (error) {
      await this.updateStatus(donationId, DonationStatus.FAILED);
      throw error;
    }
  }
} 