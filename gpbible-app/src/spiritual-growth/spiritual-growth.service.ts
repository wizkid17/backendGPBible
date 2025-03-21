import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SpiritualGrowthTrack, GrowthTrackType } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn, MoodType } from './entities/spiritual-check-in.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class SpiritualGrowthService {
  constructor(
    @InjectRepository(SpiritualGrowthTrack)
    private growthTrackRepository: Repository<SpiritualGrowthTrack>,
    @InjectRepository(SpiritualCheckIn)
    private checkInRepository: Repository<SpiritualCheckIn>,
    private subscriptionsService: SubscriptionsService
  ) {
    // Inicializar tracks predeterminados
    this.initializeDefaultTracks();
  }

  async findAllTracks(userId: string): Promise<SpiritualGrowthTrack[]> {
    return this.growthTrackRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findTrackById(id: string, userId: string): Promise<SpiritualGrowthTrack> {
    return this.growthTrackRepository.findOne({
      where: { id, user: { id: userId } }
    });
  }

  async createTrack(userId: string, trackData: Partial<SpiritualGrowthTrack>): Promise<SpiritualGrowthTrack> {
    const track = this.growthTrackRepository.create({
      ...trackData,
      user: { id: userId }
    });
    
    return this.growthTrackRepository.save(track);
  }

  async updateTrack(id: string, userId: string, trackData: Partial<SpiritualGrowthTrack>): Promise<SpiritualGrowthTrack> {
    const track = await this.findTrackById(id, userId);
    
    if (!track) {
      throw new Error('Track not found');
    }
    
    Object.assign(track, trackData);
    return this.growthTrackRepository.save(track);
  }

  async createCheckIn(userId: string, checkInData: Partial<SpiritualCheckIn>): Promise<SpiritualCheckIn> {
    const checkIn = this.checkInRepository.create({
      ...checkInData,
      user: { id: userId },
      checkInDate: new Date()
    });
    
    // Si se proporciona trackId, relacionamos con el track
    if (checkInData.growthTrack && checkInData.growthTrack.id) {
      const track = await this.findTrackById(checkInData.growthTrack.id, userId);
      if (track) {
        checkIn.growthTrack = track;
        
        // Actualizar el track con los nuevos datos
        await this.updateTrackAfterCheckIn(track, checkIn);
      }
    }
    
    return this.checkInRepository.save(checkIn);
  }

  async getCheckInsForUser(userId: string, limit: number = 10): Promise<SpiritualCheckIn[]> {
    return this.checkInRepository.find({
      where: { user: { id: userId } },
      order: { checkInDate: 'DESC' },
      take: limit,
      relations: ['growthTrack']
    });
  }

  async getCheckInsForTrack(trackId: string, userId: string): Promise<SpiritualCheckIn[]> {
    return this.checkInRepository.find({
      where: { growthTrack: { id: trackId }, user: { id: userId } },
      order: { checkInDate: 'DESC' }
    });
  }

  async getRecentCheckIns(userId: string, days: number = 7): Promise<SpiritualCheckIn[]> {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - days);
    
    return this.checkInRepository.find({
      where: {
        user: { id: userId },
        checkInDate: Between(pastDate, today)
      },
      order: { checkInDate: 'DESC' },
      relations: ['growthTrack']
    });
  }

  async getSpiritualGrowthSummary(userId: string): Promise<any> {
    const tracks = await this.findAllTracks(userId);
    const recentCheckIns = await this.getRecentCheckIns(userId, 30);
    
    const totalPrayerMinutes = recentCheckIns.reduce((sum, checkIn) => sum + checkIn.prayerMinutes, 0);
    const totalBibleReadingMinutes = recentCheckIns.reduce((sum, checkIn) => sum + checkIn.bibleReadingMinutes, 0);
    const totalMeditationMinutes = recentCheckIns.reduce((sum, checkIn) => sum + checkIn.meditationMinutes, 0);
    
    // Obtener el estado de ánimo más frecuente
    const moodCounts: Record<string, number> = {};
    recentCheckIns.forEach(checkIn => {
      const mood = checkIn.mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    let mostFrequentMood: MoodType = MoodType.NEUTRAL;
    let maxCount = 0;
    
    Object.keys(moodCounts).forEach(mood => {
      if (moodCounts[mood] > maxCount) {
        maxCount = moodCounts[mood];
        mostFrequentMood = mood as MoodType;
      }
    });
    
    // Calcular la consistencia (porcentaje de días con check-in)
    const uniqueDates = new Set(recentCheckIns.map(checkIn => checkIn.checkInDate.toISOString().split('T')[0]));
    const consistencyPercentage = (uniqueDates.size / 30) * 100;
    
    return {
      tracks: tracks.map(track => ({
        id: track.id,
        name: track.name,
        type: track.type,
        currentStreak: track.currentStreak,
        bestStreak: track.bestStreak,
        totalCompletions: track.totalCompletions
      })),
      summary: {
        totalTracks: tracks.length,
        totalCheckIns: recentCheckIns.length,
        totalPrayerMinutes,
        totalBibleReadingMinutes,
        totalMeditationMinutes,
        mostFrequentMood,
        consistencyPercentage: Math.round(consistencyPercentage)
      }
    };
  }

  private async updateTrackAfterCheckIn(track: SpiritualGrowthTrack, checkIn: SpiritualCheckIn): Promise<void> {
    // Actualizar fecha de último check-in
    track.lastCompletionDate = checkIn.checkInDate;
    track.totalCompletions += 1;
    
    // Verificar si hay que actualizar la racha (streak)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const lastCompletionStr = track.lastCompletionDate ? 
      track.lastCompletionDate.toISOString().split('T')[0] : null;
      
    if (lastCompletionStr === yesterdayStr) {
      // Si el último check-in fue ayer, incrementamos la racha
      track.currentStreak += 1;
      if (track.currentStreak > track.bestStreak) {
        track.bestStreak = track.currentStreak;
      }
    } else if (lastCompletionStr !== new Date().toISOString().split('T')[0]) {
      // Si no fue ayer ni hoy, se rompe la racha
      track.currentStreak = 1;
    }
    
    await this.growthTrackRepository.save(track);
  }

  // Método para inicializar tracks predeterminados
  private async initializeDefaultTracks(): Promise<void> {
    // Implementación simulada - en un entorno real se crearían tracks por usuario
    const defaultTracks = [
      {
        type: GrowthTrackType.PRAYER,
        name: 'Oración diaria',
        description: 'Dedica tiempo diariamente a la oración para fortalecer tu relación con Dios.',
        targetDailyMinutes: 10
      },
      {
        type: GrowthTrackType.BIBLE_READING,
        name: 'Lectura bíblica',
        description: 'Lee la Biblia regularmente para conocer más de la palabra de Dios.',
        targetDailyMinutes: 15
      },
      {
        type: GrowthTrackType.MEDITATION,
        name: 'Meditación espiritual',
        description: 'Dedica tiempo a meditar en las escrituras para profundizar tu entendimiento.',
        targetDailyMinutes: 5
      }
    ];
    
    // Este código solo es para ilustrar - no se ejecutará realmente ya que necesitaríamos un userId
    /*
    for (const trackData of defaultTracks) {
      const track = this.growthTrackRepository.create({
        ...trackData,
        user: { id: userId }
      });
      await this.growthTrackRepository.save(track);
    }
    */
  }
} 