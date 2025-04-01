import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SpiritualGrowthTrack, GrowthTrackType } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn, MoodType } from './entities/spiritual-check-in.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SpiritualPathQuestion, SpiritualPathSuggestion, UserSpiritualPath, UserSpiritualQuestion } from './entities/spiritual-path.entity';
import { SpiritualPathTempSelection } from './entities/spiritual-path-selection.entity';
import { WeeklySpiritualObjective, WeeklySpiritualOpportunity } from './entities/weekly-path.entity';
import { 
  AskSpiritualQuestionDto, 
  SpiritualQuestionResponseDto, 
  SpiritualSuggestionDto, 
  SpiritualPathSelectionDto,
  MultipleSpiritualPathSelectionsDto,
  SpiritualPathSuggestionRequestDto,
  SpiritualPathSuggestionResponseDto,
  UserSpiritualPathDto,
  UpdateUserSpiritualPathDto,
  CancelSelectionsResponseDto,
  SpiritualPathCategoryDto,
  SpiritualPathCategoriesResponseDto,
  SpiritualPathCategorizedResponseDto,
  SpiritualPathCategorizedSuggestionsDto,
  CancelConfirmationRequestDto,
  CancelConfirmationResponseDto
} from './dto/spiritual-path.dto';
import {
  WeeklyObjectiveDto,
  UpdateWeeklyObjectiveDto,
  WeeklyOpportunityDto,
  UpdateWeeklyOpportunityDto,
  WeeklyPathDto,
  WeekRequestDto,
  WeeklyPathHistoryItemDto
} from './dto/weekly-path.dto';
import { v4 as uuidv4 } from 'uuid';

// Constantes para categorías predefinidas de sugerencias espirituales
const SPIRITUAL_CATEGORIES = [
  { id: 1, name: 'Prayer', description: 'Connect with God through prayer', icon: 'prayer' },
  { id: 2, name: 'Scripture', description: 'Engage with the Bible and sacred texts', icon: 'book' },
  { id: 3, name: 'Service', description: 'Serve others as an expression of faith', icon: 'hands-helping' },
  { id: 4, name: 'Reflection', description: 'Reflect on your spiritual journey', icon: 'meditation' },
  { id: 5, name: 'Community', description: 'Connect with your faith community', icon: 'users' }
];

@Injectable()
export class SpiritualGrowthService {
  constructor(
    @InjectRepository(SpiritualGrowthTrack)
    private growthTrackRepository: Repository<SpiritualGrowthTrack>,
    @InjectRepository(SpiritualCheckIn)
    private checkInRepository: Repository<SpiritualCheckIn>,
    private subscriptionsService: SubscriptionsService,
    @InjectRepository(SpiritualPathQuestion)
    private spiritualPathQuestionRepository: Repository<SpiritualPathQuestion>,
    @InjectRepository(SpiritualPathSuggestion)
    private spiritualPathSuggestionRepository: Repository<SpiritualPathSuggestion>,
    @InjectRepository(UserSpiritualPath)
    private userSpiritualPathRepository: Repository<UserSpiritualPath>,
    @InjectRepository(UserSpiritualQuestion)
    private userSpiritualQuestionRepository: Repository<UserSpiritualQuestion>,
    @InjectRepository(SpiritualPathTempSelection)
    private tempSelectionRepository: Repository<SpiritualPathTempSelection>,
    @InjectRepository(WeeklySpiritualObjective)
    private weeklyObjectiveRepository: Repository<WeeklySpiritualObjective>,
    @InjectRepository(WeeklySpiritualOpportunity)
    private weeklyOpportunityRepository: Repository<WeeklySpiritualOpportunity>
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

  // Método para obtener sugerencias para el camino espiritual
  async getSpiritualPathSuggestions(
    userId: string,
    requestDto: SpiritualPathSuggestionRequestDto
  ): Promise<SpiritualPathSuggestionResponseDto> {
    const { query, category } = requestDto;
    
    // Construir la consulta base
    const queryBuilder = this.spiritualPathSuggestionRepository.createQueryBuilder('suggestion')
      .where('suggestion.isActive = :isActive', { isActive: true });
    
    // Filtrar por categoría si se especifica
    if (category !== undefined) {
      queryBuilder.andWhere('suggestion.category = :category', { category });
    }
    
    // Filtrar por término de búsqueda si se proporciona
    if (query && query.trim().length > 0) {
      queryBuilder.andWhere(
        '(suggestion.suggestionText LIKE :query OR suggestion.description LIKE :query)',
        { query: `%${query}%` }
      );
    }
    
    // Obtener las sugerencias
    const suggestions = await queryBuilder.getMany();
    
    // Obtener sugerencias seleccionadas por el usuario
    const userSelections = await this.userSpiritualPathRepository.find({
      where: { userId }
    });
    
    const selectedSuggestionIds = userSelections.map(selection => selection.suggestionId);
    
    // Mapear las sugerencias para incluir si están seleccionadas
    const mappedSuggestions = suggestions.map(suggestion => ({
      id: suggestion.id,
      text: suggestion.suggestionText,
      description: suggestion.description,
      category: suggestion.category,
      isSelected: selectedSuggestionIds.includes(suggestion.id)
    }));
    
    return {
      suggestions: mappedSuggestions,
      activeTab: category !== undefined ? `category-${category}` : undefined
    };
  }

  // Método para manejar la selección de sugerencias
  async toggleSpiritualPathSelection(
    userId: string,
    selectionDto: SpiritualPathSelectionDto
  ): Promise<UserSpiritualPathDto> {
    const { suggestionId, isSelected } = selectionDto;
    
    // Verificar que la sugerencia existe
    const suggestion = await this.spiritualPathSuggestionRepository.findOne({
      where: { id: suggestionId }
    });
    
    if (!suggestion) {
      throw new NotFoundException('Spiritual path suggestion not found');
    }
    
    // Verificar si ya existe una selección del usuario
    let userPath = await this.userSpiritualPathRepository.findOne({
      where: {
        userId,
        suggestionId
      }
    });
    
    if (isSelected) {
      // Si se está seleccionando y no existe, crear nueva entrada
      if (!userPath) {
        userPath = this.userSpiritualPathRepository.create({
          id: uuidv4(),
          userId,
          suggestionId,
          isCompleted: false,
          isFavorite: false
        });
        
        await this.userSpiritualPathRepository.save(userPath);
      }
      // Si ya existe pero estaba desactivada, se reactiva
    } else {
      // Si se está deseleccionando y existe, eliminar
      if (userPath) {
        await this.userSpiritualPathRepository.remove(userPath);
        
        // Crear un objeto vacío que represente la entrada eliminada
        userPath = {
          id: userPath.id,
          userId,
          suggestionId,
          isCompleted: false,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as UserSpiritualPath;
      }
    }
    
    // Devolver la entrada actualizada o eliminada
    return {
      id: userPath.id,
      suggestionId: userPath.suggestionId,
      suggestionText: suggestion.suggestionText,
      description: suggestion.description,
      isCompleted: userPath.isCompleted || false,
      isFavorite: userPath.isFavorite || false,
      completedAt: userPath.completedAt?.toISOString(),
      reminderTime: userPath.reminderTime?.toISOString(),
      createdAt: userPath.createdAt.toISOString()
    };
  }

  // Método para obtener las selecciones del usuario
  async getUserSpiritualPath(userId: string): Promise<UserSpiritualPathDto[]> {
    const userPaths = await this.userSpiritualPathRepository.find({
      where: { userId },
      relations: ['suggestion']
    });
    
    return userPaths.map(path => ({
      id: path.id,
      suggestionId: path.suggestionId,
      suggestionText: path.suggestion.suggestionText,
      description: path.suggestion.description,
      isCompleted: path.isCompleted,
      isFavorite: path.isFavorite,
      completedAt: path.completedAt?.toISOString(),
      reminderTime: path.reminderTime?.toISOString(),
      createdAt: path.createdAt.toISOString()
    }));
  }

  // Método para actualizar el estado de un elemento del camino espiritual
  async updateUserSpiritualPath(
    userId: string,
    updateDto: UpdateUserSpiritualPathDto
  ): Promise<UserSpiritualPathDto> {
    const { id, isCompleted, isFavorite, reminderTime } = updateDto;
    
    // Obtener la entrada existente
    const userPath = await this.userSpiritualPathRepository.findOne({
      where: { id, userId },
      relations: ['suggestion']
    });
    
    if (!userPath) {
      throw new NotFoundException('User spiritual path entry not found');
    }
    
    // Actualizar los campos proporcionados
    if (isCompleted !== undefined) {
      userPath.isCompleted = isCompleted;
      
      // Si se marca como completado, establecer la fecha de completado
      if (isCompleted && !userPath.completedAt) {
        userPath.completedAt = new Date();
      } else if (!isCompleted) {
        userPath.completedAt = null;
      }
    }
    
    if (isFavorite !== undefined) {
      userPath.isFavorite = isFavorite;
    }
    
    if (reminderTime !== undefined) {
      userPath.reminderTime = reminderTime ? new Date(reminderTime) : null;
    }
    
    // Guardar los cambios
    const updatedPath = await this.userSpiritualPathRepository.save(userPath);
    
    return {
      id: updatedPath.id,
      suggestionId: updatedPath.suggestionId,
      suggestionText: updatedPath.suggestion.suggestionText,
      description: updatedPath.suggestion.description,
      isCompleted: updatedPath.isCompleted,
      isFavorite: updatedPath.isFavorite,
      completedAt: updatedPath.completedAt?.toISOString(),
      reminderTime: updatedPath.reminderTime?.toISOString(),
      createdAt: updatedPath.createdAt.toISOString()
    };
  }

  // Método para hacer una pregunta espiritual
  async askSpiritualQuestion(
    userId: string,
    questionDto: AskSpiritualQuestionDto
  ): Promise<SpiritualQuestionResponseDto> {
    // Guardar la pregunta del usuario
    const userQuestion = this.userSpiritualQuestionRepository.create({
      id: uuidv4(),
      userId,
      questionText: questionDto.question,
      isAnswered: false
    });
    
    await this.userSpiritualQuestionRepository.save(userQuestion);
    
    // Generar una respuesta (simulada, en producción podría usar un servicio de IA)
    const response = await this.generateSpiritualResponse(questionDto.question);
    
    // Actualizar la pregunta con la respuesta
    userQuestion.responseText = response;
    userQuestion.isAnswered = true;
    
    await this.userSpiritualQuestionRepository.save(userQuestion);
    
    return {
      id: userQuestion.id,
      question: userQuestion.questionText,
      response: userQuestion.responseText,
      createdAt: userQuestion.createdAt.toISOString()
    };
  }

  // Método para obtener las preguntas y respuestas del usuario
  async getUserSpiritualQuestions(userId: string): Promise<SpiritualQuestionResponseDto[]> {
    const questions = await this.userSpiritualQuestionRepository.find({
      where: { userId, isAnswered: true },
      order: { createdAt: 'DESC' }
    });
    
    return questions.map(question => ({
      id: question.id,
      question: question.questionText,
      response: question.responseText,
      createdAt: question.createdAt.toISOString()
    }));
  }

  // Método auxiliar para generar respuestas espirituales (simulado)
  private async generateSpiritualResponse(question: string): Promise<string> {
    // En un escenario real, aquí se conectaría con un servicio de IA
    // para generar respuestas personalizadas
    
    const responses = [
      "Dedica 10 minutos diarios a la oración reflexiva, centrándote en la presencia de Dios.",
      "Comienza tu día con una breve lectura de las Escrituras y reflexiona sobre su significado.",
      "Practica el agradecimiento diario, anotando tres bendiciones que recibiste hoy.",
      "Busca oportunidades para servir a otros en tu comunidad como una forma de expresar tu fe.",
      "Incorpora momentos de silencio en tu rutina diaria para escuchar la guía divina.",
      "Asiste regularmente a servicios religiosos para fortalecer tu conexión comunitaria y espiritual.",
      "Comparte tus experiencias de fe con un amigo de confianza o mentor espiritual.",
      "Dedica un día a la semana para desconectar de la tecnología y reconectar con tu espiritualidad.",
      "Establece una rutina de estudio bíblico para profundizar en tu comprensión de las Escrituras.",
      "Practica el perdón como camino hacia la libertad espiritual y el crecimiento personal."
    ];
    
    // Seleccionar una respuesta aleatoria
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  // Método para manejar múltiples selecciones de sugerencias
  async handleMultipleSelections(
    userId: string, 
    selectionsDto: MultipleSpiritualPathSelectionsDto
  ): Promise<UserSpiritualPathDto[]> {
    const { selections, isFinal } = selectionsDto;
    const results: UserSpiritualPathDto[] = [];
    
    // Crear un ID de sesión único para agrupar estas selecciones
    const sessionId = uuidv4();
    
    // Si no es la selección final, almacenar temporalmente
    if (!isFinal) {
      // Primero, eliminar cualquier selección temporal previa
      await this.tempSelectionRepository.delete({ userId });
      
      // Almacenar las nuevas selecciones temporales
      for (const selection of selections) {
        const tempSelection = this.tempSelectionRepository.create({
          id: uuidv4(),
          userId,
          suggestionId: selection.suggestionId,
          isSelected: selection.isSelected,
          sessionId
        });
        await this.tempSelectionRepository.save(tempSelection);
      }
      
      // Devolver las sugerencias con la información actualizada
      return this.getUserSpiritualPathWithTemp(userId);
    }
    
    // Si es la selección final, aplicar los cambios permanentemente
    for (const selection of selections) {
      const result = await this.toggleSpiritualPathSelection(userId, selection);
      results.push(result);
    }
    
    // Limpiar las selecciones temporales
    await this.tempSelectionRepository.delete({ userId });
    
    return results;
  }

  // Método para obtener selecciones del usuario incluyendo las temporales
  async getUserSpiritualPathWithTemp(userId: string): Promise<UserSpiritualPathDto[]> {
    // Obtener selecciones permanentes
    const userPaths = await this.userSpiritualPathRepository.find({
      where: { userId },
      relations: ['suggestion']
    });
    
    // Obtener selecciones temporales
    const tempSelections = await this.tempSelectionRepository.find({
      where: { userId },
      relations: ['suggestion']
    });
    
    // Mapear selecciones permanentes a DTOs
    const result = userPaths.map(path => ({
      id: path.id,
      suggestionId: path.suggestionId,
      suggestionText: path.suggestion.suggestionText,
      description: path.suggestion.description,
      isCompleted: path.isCompleted,
      isFavorite: path.isFavorite,
      completedAt: path.completedAt?.toISOString(),
      reminderTime: path.reminderTime?.toISOString(),
      createdAt: path.createdAt.toISOString()
    }));
    
    // Añadir selecciones temporales que no estén ya en las permanentes
    for (const temp of tempSelections) {
      // Si ya existe una selección permanente para esta sugerencia, omitirla
      const existingIndex = result.findIndex(item => item.suggestionId === temp.suggestionId);
      if (existingIndex !== -1) continue;
      
      // Si la sugerencia está seleccionada temporalmente, añadirla al resultado
      if (temp.isSelected) {
        result.push({
          id: temp.id,
          suggestionId: temp.suggestionId,
          suggestionText: temp.suggestion.suggestionText,
          description: temp.suggestion.description,
          isCompleted: false,
          isFavorite: false,
          completedAt: undefined,
          reminderTime: undefined,
          createdAt: temp.createdAt.toISOString()
        });
      }
    }
    
    return result;
  }

  // Método para confirmar cancelación de selecciones
  async confirmCancelSelections(userId: string): Promise<CancelSelectionsResponseDto> {
    // Eliminar todas las selecciones temporales del usuario
    await this.tempSelectionRepository.delete({ userId });
    
    return {
      confirmed: true,
      message: 'Your selections have been discarded.'
    };
  }

  // Método para guardar las selecciones finales
  async saveSelections(userId: string): Promise<UserSpiritualPathDto[]> {
    // Obtener selecciones temporales
    const tempSelections = await this.tempSelectionRepository.find({
      where: { userId },
      relations: ['suggestion']
    });
    
    // Aplicar cada selección temporal permanentemente
    for (const temp of tempSelections) {
      if (temp.isSelected) {
        // Verificar si ya existe una selección permanente
        const existingPath = await this.userSpiritualPathRepository.findOne({
          where: { userId, suggestionId: temp.suggestionId }
        });
        
        if (!existingPath) {
          // Crear una nueva selección permanente
          const userPath = this.userSpiritualPathRepository.create({
            id: uuidv4(),
            userId,
            suggestionId: temp.suggestionId,
            isCompleted: false,
            isFavorite: false
          });
          await this.userSpiritualPathRepository.save(userPath);
        }
      } else {
        // Si la selección temporal es false, eliminar cualquier selección permanente
        await this.userSpiritualPathRepository.delete({
          userId,
          suggestionId: temp.suggestionId
        });
      }
    }
    
    // Limpiar selecciones temporales
    await this.tempSelectionRepository.delete({ userId });
    
    // Devolver las selecciones actualizadas
    return this.getUserSpiritualPath(userId);
  }

  // Método para obtener todas las categorías de sugerencias espirituales
  async getSpiritualPathCategories(): Promise<SpiritualPathCategoriesResponseDto> {
    // Devolver las categorías predefinidas
    return {
      categories: SPIRITUAL_CATEGORIES
    };
  }

  // Método para obtener sugerencias agrupadas por categoría
  async getCategorizedSpiritualPathSuggestions(
    userId: string,
    activeCategory?: number
  ): Promise<SpiritualPathCategorizedResponseDto> {
    // Obtener todas las sugerencias activas
    const allSuggestions = await this.spiritualPathSuggestionRepository.find({
      where: { isActive: true }
    });
    
    // Obtener selecciones del usuario
    const userSelections = await this.userSpiritualPathRepository.find({
      where: { userId }
    });
    
    // Obtener selecciones temporales si existen
    const tempSelections = await this.tempSelectionRepository.find({
      where: { userId }
    });
    
    // Combinar selecciones permanentes y temporales
    const selectedSuggestionIds = new Set(userSelections.map(selection => selection.suggestionId));
    tempSelections.forEach(temp => {
      if (temp.isSelected) {
        selectedSuggestionIds.add(temp.suggestionId);
      } else {
        selectedSuggestionIds.delete(temp.suggestionId);
      }
    });
    
    // Agrupar sugerencias por categoría
    const categorizedSuggestions: SpiritualPathCategorizedSuggestionsDto[] = [];
    const categoryMap = new Map<number, SpiritualSuggestionDto[]>();
    
    // Inicializar map con todas las categorías, incluso las vacías
    SPIRITUAL_CATEGORIES.forEach(category => {
      categoryMap.set(category.id, []);
    });
    
    // Clasificar sugerencias en categorías
    allSuggestions.forEach(suggestion => {
      const category = suggestion.category || 0;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      
      categoryMap.get(category).push({
        id: suggestion.id,
        text: suggestion.suggestionText,
        description: suggestion.description,
        category: suggestion.category,
        isSelected: selectedSuggestionIds.has(suggestion.id)
      });
    });
    
    // Convertir el mapa a un array para la respuesta
    SPIRITUAL_CATEGORIES.forEach(category => {
      const suggestions = categoryMap.get(category.id) || [];
      
      // Solo incluir categorías con sugerencias o la categoría activa
      if (suggestions.length > 0 || category.id === activeCategory) {
        categorizedSuggestions.push({
          categoryId: category.id,
          categoryName: category.name,
          categoryDescription: category.description,
          categoryIcon: category.icon,
          suggestions
        });
      }
    });
    
    // Ordenar categorías: primero la activa, luego por ID
    if (activeCategory) {
      categorizedSuggestions.sort((a, b) => {
        if (a.categoryId === activeCategory) return -1;
        if (b.categoryId === activeCategory) return 1;
        return a.categoryId - b.categoryId;
      });
    }
    
    return {
      categorizedSuggestions,
      activeTab: activeCategory ? `category-${activeCategory}` : undefined,
      hasSelections: selectedSuggestionIds.size > 0
    };
  }

  // Método para obtener información de progreso en el camino espiritual
  async getSpiritualPathProgress(userId: string): Promise<any> {
    // Obtener selecciones del usuario
    const userSelections = await this.userSpiritualPathRepository.find({
      where: { userId },
      relations: ['suggestion']
    });
    
    // Contar selecciones por categoría
    const categoryCount: Record<number, { total: number, completed: number }> = {};
    
    // Inicializar contadores para todas las categorías
    SPIRITUAL_CATEGORIES.forEach(category => {
      categoryCount[category.id] = { total: 0, completed: 0 };
    });
    
    // Contar selecciones y completadas por categoría
    userSelections.forEach(selection => {
      const category = selection.suggestion.category || 0;
      if (!categoryCount[category]) {
        categoryCount[category] = { total: 0, completed: 0 };
      }
      
      categoryCount[category].total++;
      if (selection.isCompleted) {
        categoryCount[category].completed++;
      }
    });
    
    // Calcular estadísticas generales
    const totalSelections = userSelections.length;
    const completedSelections = userSelections.filter(s => s.isCompleted).length;
    const completionPercentage = totalSelections > 0 ? Math.round((completedSelections / totalSelections) * 100) : 0;
    
    // Preparar datos de categorías para la respuesta
    const categoryProgress = SPIRITUAL_CATEGORIES.map(category => {
      const counts = categoryCount[category.id];
      const percentage = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
      
      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        total: counts.total,
        completed: counts.completed,
        percentage
      };
    });
    
    return {
      totalSelections,
      completedSelections,
      completionPercentage,
      categoryProgress
    };
  }

  // Método para manejar el diálogo de confirmación de cancelación
  async handleCancelConfirmation(
    userId: string,
    confirmationDto: CancelConfirmationRequestDto
  ): Promise<CancelConfirmationResponseDto> {
    const { confirmed, reason } = confirmationDto;
    
    // Si el usuario confirma la cancelación
    if (confirmed) {
      // Contar cuántas selecciones temporales hay para mostrar en la respuesta
      const tempSelections = await this.tempSelectionRepository.find({
        where: { userId }
      });
      
      const changedCount = tempSelections.length;
      
      // Eliminar todas las selecciones temporales
      await this.tempSelectionRepository.delete({ userId });
      
      return {
        success: true,
        message: 'Your selections have been discarded successfully.',
        changedSelectionCount: changedCount
      };
    } else {
      // Si el usuario cancela el diálogo, simplemente regresamos sin hacer nada
      return {
        success: false,
        message: 'Cancellation aborted. Your selections remain unchanged.'
      };
    }
  }

  // Método para obtener información sobre las selecciones actuales para el diálogo de confirmación
  async getSelectionChangeInfo(userId: string): Promise<any> {
    // Contar selecciones temporales
    const tempSelections = await this.tempSelectionRepository.find({
      where: { userId }
    });
    
    const addedCount = tempSelections.filter(s => s.isSelected).length;
    const removedCount = tempSelections.filter(s => !s.isSelected).length;
    
    // Obtener el total de selecciones permanentes
    const userSelections = await this.userSpiritualPathRepository.find({
      where: { userId }
    });
    
    return {
      currentSelectionCount: userSelections.length,
      pendingChanges: tempSelections.length > 0,
      addedCount,
      removedCount,
      totalPendingChanges: addedCount + removedCount
    };
  }

  // Método para finalizar y guardar el camino espiritual del usuario
  async finalizeSpiritualPath(userId: string): Promise<any> {
    // Obtener todas las selecciones temporales
    const tempSelections = await this.tempSelectionRepository.find({
      where: { userId }
    });
    
    // Aplicar todas las selecciones temporales de forma permanente
    await this.saveSelections(userId);
    
    // Obtener el camino espiritual finalizado del usuario, agrupado por categorías
    const userPath = await this.getCategorizedSpiritualPathSuggestions(userId);
    
    // Calcular algunas estadísticas para mostrar en la confirmación
    const activeSelections = userPath.categorizedSuggestions.reduce(
      (total, category) => total + category.suggestions.filter(s => s.isSelected).length, 
      0
    );
    
    const categoriesWithSelections = userPath.categorizedSuggestions.filter(
      category => category.suggestions.some(s => s.isSelected)
    ).length;
    
    return {
      success: true,
      message: 'Your spiritual path has been saved successfully.',
      activeSelections,
      categoriesWithSelections,
      summary: {
        categorizedSuggestions: userPath.categorizedSuggestions.map(category => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          selectedCount: category.suggestions.filter(s => s.isSelected).length
        }))
      }
    };
  }

  // Método para obtener el objetivo semanal y oportunidades para una fecha específica
  async getWeeklyPath(userId: string, dateRequest?: WeekRequestDto): Promise<WeeklyPathDto> {
    // Determinar la fecha solicitada o usar la fecha actual
    const date = dateRequest?.date ? new Date(dateRequest.date) : new Date();
    
    // Obtener el lunes de la semana actual
    const weekStart = this.getWeekStartDate(date);
    const weekEnd = this.getWeekEndDate(weekStart);
    
    // Buscar si ya existe un objetivo para esta semana
    let weeklyObjective = await this.weeklyObjectiveRepository.findOne({
      where: {
        userId,
        weekStartDate: LessThanOrEqual(weekStart),
        weekEndDate: MoreThanOrEqual(weekEnd)
      },
      relations: ['opportunities']
    });
    
    // Si no existe, crear uno con recomendaciones predeterminadas
    if (!weeklyObjective) {
      weeklyObjective = await this.createDefaultWeeklyObjective(userId, weekStart);
    }
    
    // Calcular el porcentaje de completado
    const completionPercentage = this.calculateCompletionPercentage(weeklyObjective.opportunities);
    
    // Ordenar oportunidades por orden
    const sortedOpportunities = [...weeklyObjective.opportunities].sort((a, b) => a.order - b.order);
    
    // Mapear oportunidades a DTOs
    const opportunitiesDto = sortedOpportunities.map(opportunity => ({
      id: opportunity.id,
      text: opportunity.text,
      description: opportunity.description,
      isCompleted: opportunity.isCompleted,
      objectiveId: opportunity.objectiveId,
      order: opportunity.order
    }));
    
    return {
      objectiveId: weeklyObjective.id,
      objectiveText: weeklyObjective.text,
      weekStartDate: weeklyObjective.weekStartDate.toISOString(),
      weekEndDate: weeklyObjective.weekEndDate.toISOString(),
      opportunities: opportunitiesDto,
      completionPercentage
    };
  }

  // Método para obtener el historial de caminos espirituales semanales
  async getWeeklyPathHistory(userId: string): Promise<WeeklyPathHistoryItemDto[]> {
    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Obtener el lunes de la semana actual
    const currentWeekStart = this.getWeekStartDate(currentDate);
    
    // Buscar objetivos semanales anteriores a la semana actual
    const previousObjectives = await this.weeklyObjectiveRepository.find({
      where: {
        userId,
        weekStartDate: LessThanOrEqual(currentWeekStart)
      },
      relations: ['opportunities'],
      order: {
        weekStartDate: 'DESC' // Ordenar por fecha de inicio en orden descendente
      },
      take: 10 // Limitar a los últimos 10 por razones de rendimiento
    });
    
    // Filtrar el objetivo de la semana actual si está incluido
    const historyObjectives = previousObjectives.filter(objective => {
      const objectiveWeekStart = new Date(objective.weekStartDate);
      return objectiveWeekStart.getTime() < currentWeekStart.getTime();
    });
    
    // Mapear objetivos a DTOs
    return historyObjectives.map(objective => {
      // Calcular el porcentaje de completado
      const completionPercentage = this.calculateCompletionPercentage(objective.opportunities);
      
      // Ordenar oportunidades por orden
      const sortedOpportunities = [...objective.opportunities].sort((a, b) => a.order - b.order);
      
      // Mapear oportunidades a DTOs
      const opportunitiesDto = sortedOpportunities.map(opportunity => ({
        id: opportunity.id,
        text: opportunity.text,
        description: opportunity.description,
        isCompleted: opportunity.isCompleted,
        objectiveId: opportunity.objectiveId,
        order: opportunity.order
      }));
      
      // Formatear rango de fechas (ejemplo: '18/11 - 24/11')
      const startDate = new Date(objective.weekStartDate);
      const endDate = new Date(objective.weekEndDate);
      const formattedDateRange = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      
      return {
        objectiveId: objective.id,
        objectiveText: objective.text,
        weekStartDate: objective.weekStartDate.toISOString(),
        weekEndDate: objective.weekEndDate.toISOString(),
        opportunities: opportunitiesDto,
        completionPercentage,
        formattedDateRange
      };
    });
  }

  // Método para actualizar el objetivo semanal
  async updateWeeklyObjective(userId: string, updateDto: UpdateWeeklyObjectiveDto): Promise<WeeklyObjectiveDto> {
    const objective = await this.weeklyObjectiveRepository.findOne({
      where: { id: updateDto.id, userId }
    });
    
    if (!objective) {
      throw new NotFoundException('Weekly objective not found');
    }
    
    if (updateDto.text) {
      objective.text = updateDto.text;
    }
    
    const updatedObjective = await this.weeklyObjectiveRepository.save(objective);
    
    return {
      id: updatedObjective.id,
      text: updatedObjective.text,
      weekStartDate: updatedObjective.weekStartDate.toISOString(),
      weekEndDate: updatedObjective.weekEndDate.toISOString(),
      userId: updatedObjective.userId
    };
  }

  // Método para actualizar una oportunidad espiritual
  async updateWeeklyOpportunity(userId: string, updateDto: UpdateWeeklyOpportunityDto): Promise<WeeklyOpportunityDto> {
    // Primero verificar que la oportunidad pertenece a un objetivo del usuario
    const opportunity = await this.weeklyOpportunityRepository.findOne({
      where: { id: updateDto.id },
      relations: ['objective']
    });
    
    if (!opportunity || opportunity.objective.userId !== userId) {
      throw new NotFoundException('Weekly opportunity not found or does not belong to user');
    }
    
    // Actualizar los campos proporcionados
    if (updateDto.isCompleted !== undefined) {
      opportunity.isCompleted = updateDto.isCompleted;
      opportunity.completedAt = updateDto.isCompleted ? new Date() : null;
    }
    
    if (updateDto.text) {
      opportunity.text = updateDto.text;
    }
    
    if (updateDto.description) {
      opportunity.description = updateDto.description;
    }
    
    const updatedOpportunity = await this.weeklyOpportunityRepository.save(opportunity);
    
    return {
      id: updatedOpportunity.id,
      text: updatedOpportunity.text,
      description: updatedOpportunity.description,
      isCompleted: updatedOpportunity.isCompleted,
      objectiveId: updatedOpportunity.objectiveId,
      order: updatedOpportunity.order
    };
  }

  // Método para obtener la fecha de inicio de la semana (lunes)
  private getWeekStartDate(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Método para obtener la fecha de fin de la semana (domingo)
  private getWeekEndDate(weekStart: Date): Date {
    const sunday = new Date(weekStart);
    sunday.setDate(weekStart.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }

  // Método para crear un objetivo semanal predeterminado
  private async createDefaultWeeklyObjective(userId: string, weekStart: Date): Promise<WeeklySpiritualObjective> {
    const weekEnd = this.getWeekEndDate(weekStart);
    
    // Crear el objetivo
    const objective = this.weeklyObjectiveRepository.create({
      id: uuidv4(),
      userId,
      text: 'Make some great actions with my family',
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      theme: 'Anchoring'
    });
    
    const savedObjective = await this.weeklyObjectiveRepository.save(objective);
    
    // Crear oportunidades predeterminadas
    const defaultOpportunities = [
      {
        text: 'Set aside 10 minutes each day to pray specifically about feeling God\'s presence',
        description: 'Focus on moments when you\'re felt connected to the divine or the holy.',
        order: 1
      },
      {
        text: 'Attend one spiritual retreat or spend half a day in nature',
        description: 'Use this opportunity to deepen your connection to God and creation.',
        order: 2
      },
      {
        text: 'Write a weekly journal entry about one moment where you felt joy or harmony in worship or connection',
        description: 'Describe the circumstances and your feelings in detail.',
        order: 3
      },
      {
        text: 'Commit to noticing and reflecting on three moments of connection to creation or others daily',
        description: 'Capture these moments in a journal or share them with a friend.',
        order: 4
      }
    ];
    
    const opportunities = defaultOpportunities.map((opp, index) => 
      this.weeklyOpportunityRepository.create({
        id: uuidv4(),
        objectiveId: savedObjective.id,
        text: opp.text,
        description: opp.description,
        isCompleted: false,
        order: opp.order
      })
    );
    
    savedObjective.opportunities = await this.weeklyOpportunityRepository.save(opportunities);
    
    // Generar datos de prueba para historial
    await this.generateHistoricalDataIfNeeded(userId);
    
    return savedObjective;
  }

  // Método para generar datos históricos de prueba si no existen registros
  private async generateHistoricalDataIfNeeded(userId: string): Promise<void> {
    // Verificar si ya hay datos históricos
    const historyCount = await this.weeklyObjectiveRepository.count({
      where: {
        userId,
        weekStartDate: LessThanOrEqual(new Date()) // Cualquier fecha hasta hoy
      }
    });
    
    // Si ya hay al menos 3 registros históricos, no generar más
    if (historyCount >= 3) {
      return;
    }
    
    // Generar datos para 3 semanas anteriores
    for (let i = 1; i <= 3; i++) {
      // Calcular fecha de inicio para i semanas atrás
      const pastWeekStart = new Date();
      pastWeekStart.setDate(pastWeekStart.getDate() - (i * 7));
      const startDate = this.getWeekStartDate(pastWeekStart);
      const endDate = this.getWeekEndDate(startDate);
      
      // Crear objetivo para la semana pasada
      const pastObjective = this.weeklyObjectiveRepository.create({
        id: uuidv4(),
        userId,
        text: `Spiritual focus for ${i} ${i === 1 ? 'week' : 'weeks'} ago`,
        weekStartDate: startDate,
        weekEndDate: endDate,
        theme: ['Faith', 'Prayer', 'Community'][i % 3]
      });
      
      const savedPastObjective = await this.weeklyObjectiveRepository.save(pastObjective);
      
      // Crear oportunidades con algunos marcados como completados
      const pastOpportunities = [
        {
          text: 'Set aside 10 minutes each day to pray specifically about feeling God\'s presence',
          description: 'Focus on moments when you\'re felt connected to the divine or the holy.',
          order: 1,
          isCompleted: Math.random() > 0.4 // 60% probabilidad de estar completado
        },
        {
          text: 'Attend one spiritual retreat or spend half a day in nature',
          description: 'Use this opportunity to deepen your connection to God and creation.',
          order: 2,
          isCompleted: Math.random() > 0.4
        },
        {
          text: 'Write a weekly journal entry about one moment where you felt joy or harmony in worship or connection',
          description: 'Describe the circumstances and your feelings in detail.',
          order: 3,
          isCompleted: Math.random() > 0.4
        },
        {
          text: 'Commit to noticing and reflecting on three moments of connection to creation or others daily',
          description: 'Capture these moments in a journal or share them with a friend.',
          order: 4,
          isCompleted: Math.random() > 0.4
        }
      ];
      
      const opportunitiesEntities = pastOpportunities.map((opp) => 
        this.weeklyOpportunityRepository.create({
          id: uuidv4(),
          objectiveId: savedPastObjective.id,
          text: opp.text,
          description: opp.description,
          isCompleted: opp.isCompleted,
          completedAt: opp.isCompleted ? new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())) : null,
          order: opp.order
        })
      );
      
      await this.weeklyOpportunityRepository.save(opportunitiesEntities);
    }
  }

  // Método para calcular el porcentaje de completado de las oportunidades
  private calculateCompletionPercentage(opportunities: WeeklySpiritualOpportunity[]): number {
    if (!opportunities.length) return 0;
    
    const completedCount = opportunities.filter(opp => opp.isCompleted).length;
    return Math.round((completedCount / opportunities.length) * 100);
  }
} 