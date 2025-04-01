import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SpiritualAssessment } from './entities/spiritual-assessment.entity';
import { SpiritualAssessmentQuestion } from './entities/spiritual-assessment-question.entity';
import { SpiritualAssessmentResponse, FrequencyResponse } from './entities/spiritual-assessment-response.entity';
import { SpiritualAssessmentSeedService } from './spiritual-assessment-seed.service';
import { feedbackTemplates, dashboardConstants } from './data/feedback-templates';
import { AssessmentSectionType } from './enums/assessment-section-type.enum';

@Injectable()
export class SpiritualAssessmentService {
  constructor(
    @InjectRepository(SpiritualAssessment)
    private assessmentRepository: Repository<SpiritualAssessment>,
    @InjectRepository(SpiritualAssessmentQuestion)
    private questionRepository: Repository<SpiritualAssessmentQuestion>,
    @InjectRepository(SpiritualAssessmentResponse)
    private responseRepository: Repository<SpiritualAssessmentResponse>,
    private seedService: SpiritualAssessmentSeedService
  ) {}

  async getActiveAssessment(): Promise<SpiritualAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { isActive: true },
      order: { version: 'DESC' },
      relations: ['questions']
    });

    if (!assessment) {
      throw new Error('No hay evaluación espiritual activa');
    }

    // Ordenar las preguntas por número
    assessment.questions.sort((a, b) => a.questionNumber - b.questionNumber);

    return assessment;
  }

  async getQuestionsBySection(sectionType: AssessmentSectionType): Promise<SpiritualAssessmentQuestion[]> {
    const assessment = await this.getActiveAssessment();
    
    return this.questionRepository.find({
      where: {
        assessment: { id: assessment.id },
        section: sectionType,
        isActive: true
      },
      order: { questionNumber: 'ASC' }
    });
  }

  // Método para obtener preguntas formateadas para la UI como se muestra en la imagen
  async getFormattedSectionQuestions(sectionType: AssessmentSectionType): Promise<any[]> {
    const questions = await this.getQuestionsBySection(sectionType);
    const sectionNames = this.seedService.getSectionNames();
    const sectionDescriptions = this.seedService.getSectionDescriptions();
    
    // Formatear las preguntas como se ve en la UI de la imagen
    return questions.map(question => {
      return {
        id: question.id,
        questionNumber: question.questionNumber,
        text: question.text,
        sectionName: sectionNames[question.section] || question.section,
        sectionDescription: sectionDescriptions[question.section] || '',
        minScore: question.minScore,
        maxScore: question.maxScore
      };
    });
  }

  async saveResponse(
    userId: string, 
    questionId: string, 
    score: number, 
    frequencyResponse?: string, 
    notes?: string
  ): Promise<SpiritualAssessmentResponse> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['assessment']
    });

    if (!question) {
      throw new Error('Pregunta no encontrada');
    }

    // Si se proporciona frequencyResponse pero no score, convertir la frecuencia a un puntaje
    if (frequencyResponse && !score) {
      score = this.convertFrequencyToScore(frequencyResponse);
    }

    // Verificar si ya existe una respuesta para esta pregunta y usuario
    const existingResponse = await this.responseRepository.findOne({
      where: {
        user: { id: userId },
        question: { id: questionId }
      }
    });

    if (existingResponse) {
      // Actualizar la respuesta existente
      existingResponse.score = score;
      if (frequencyResponse) {
        existingResponse.frequencyResponse = frequencyResponse as any;
      }
      if (notes) {
        existingResponse.notes = notes;
      }
      return this.responseRepository.save(existingResponse);
    }

    // Crear una nueva respuesta
    const response = this.responseRepository.create({
      user: { id: userId },
      question: { id: questionId },
      assessment: { id: question.assessment.id },
      score,
      frequencyResponse: frequencyResponse as any,
      notes,
      assessmentDate: new Date()
    });

    return this.responseRepository.save(response);
  }

  // Método para convertir la respuesta de frecuencia a un puntaje numérico
  private convertFrequencyToScore(frequencyResponse: string): number {
    switch (frequencyResponse) {
      case FrequencyResponse.EVERY_DAY:
        return 5;
      case FrequencyResponse.MOST_DAYS:
        return 4;
      case FrequencyResponse.EVERY_NOW_AND_THEN:
        return 3;
      case FrequencyResponse.RARELY:
        return 2;
      case FrequencyResponse.NEVER:
        return 1;
      default:
        return 3; // Valor medio por defecto
    }
  }

  async getUserResponses(userId: string, assessmentId?: string): Promise<SpiritualAssessmentResponse[]> {
    const whereClause: any = { user: { id: userId } };
    
    if (assessmentId) {
      whereClause.assessment = { id: assessmentId };
    }
    
    return this.responseRepository.find({
      where: whereClause,
      relations: ['question', 'assessment'],
      order: { createdAt: 'DESC' }
    });
  }

  async getUserResponsesBySection(userId: string, section: AssessmentSectionType): Promise<any> {
    const assessment = await this.getActiveAssessment();
    const questions = await this.getQuestionsBySection(section);
    
    const responses = await this.responseRepository.find({
      where: {
        user: { id: userId },
        assessment: { id: assessment.id },
        question: { section }
      },
      relations: ['question']
    });

    // Agrupar preguntas y respuestas
    return questions.map(question => {
      const response = responses.find(r => r.question.id === question.id);
      return {
        questionId: question.id,
        questionNumber: question.questionNumber,
        text: question.text,
        section: question.section,
        score: response?.score || null,
        notes: response?.notes || null,
        answered: !!response
      };
    });
  }

  async getAssessmentSummary(userId: string): Promise<any> {
    const assessment = await this.getActiveAssessment();
    const responses = await this.getUserResponses(userId, assessment.id);

    // Agrupar respuestas por sección
    const sectionScores = {
      [AssessmentSectionType.CONNECTION]: { total: 0, count: 0 },
      [AssessmentSectionType.GRATITUDE]: { total: 0, count: 0 },
      [AssessmentSectionType.GUIDANCE]: { total: 0, count: 0 }
    };

    responses.forEach(response => {
      const section = response.question.section;
      sectionScores[section].total += response.score;
      sectionScores[section].count++;
    });

    // Calcular promedios por sección
    const summary = {
      totalQuestions: assessment.questionCount,
      answeredQuestions: responses.length,
      completionPercentage: (responses.length / assessment.questionCount) * 100,
      sectionAverages: {
        [AssessmentSectionType.CONNECTION]: sectionScores[AssessmentSectionType.CONNECTION].count > 0 
          ? sectionScores[AssessmentSectionType.CONNECTION].total / sectionScores[AssessmentSectionType.CONNECTION].count 
          : 0,
        [AssessmentSectionType.GRATITUDE]: sectionScores[AssessmentSectionType.GRATITUDE].count > 0 
          ? sectionScores[AssessmentSectionType.GRATITUDE].total / sectionScores[AssessmentSectionType.GRATITUDE].count 
          : 0,
        [AssessmentSectionType.GUIDANCE]: sectionScores[AssessmentSectionType.GUIDANCE].count > 0 
          ? sectionScores[AssessmentSectionType.GUIDANCE].total / sectionScores[AssessmentSectionType.GUIDANCE].count 
          : 0
      },
      overallAverage: responses.length > 0 
        ? responses.reduce((sum, response) => sum + response.score, 0) / responses.length 
        : 0
    };

    return summary;
  }

  // Método para generar un mensaje personalizado basado en los resultados
  async getPersonalizedAssessmentFeedback(userId: string): Promise<any> {
    const summary = await this.getAssessmentSummary(userId);
    const overallScore = summary.overallAverage;
    
    // Buscar la plantilla de feedback correspondiente a la puntuación
    const feedback = feedbackTemplates.find(
      template => overallScore >= template.minScore && overallScore <= template.maxScore
    ) || feedbackTemplates[feedbackTemplates.length - 1]; // Usar la última como fallback

    return {
      summary: {
        connection: Math.round(summary.sectionAverages[AssessmentSectionType.CONNECTION] * dashboardConstants.percentageMultiplier),
        guidance: Math.round(summary.sectionAverages[AssessmentSectionType.GUIDANCE] * dashboardConstants.percentageMultiplier),
        gratitude: Math.round(summary.sectionAverages[AssessmentSectionType.GRATITUDE] * dashboardConstants.percentageMultiplier),
        compassion: dashboardConstants.compassionBaseValue,
        closeness: dashboardConstants.closenessBaseValue,
      },
      message: feedback.message,
      recommendations: feedback.recommendations,
      completionDate: new Date(),
      completionPercentage: summary.completionPercentage
    };
  }

  // Método para obtener preguntas con opciones de frecuencia como se muestra en la imagen
  async getQuestionsWithFrequencyOptions(sectionType: AssessmentSectionType, userId: string): Promise<any[]> {
    const questions = await this.getQuestionsBySection(sectionType);
    const responses = await this.responseRepository.find({
      where: {
        user: { id: userId },
        question: { section: sectionType }
      },
      relations: ['question']
    });
    
    // Obtener el nombre y descripción de la sección
    const sectionNames = this.seedService.getSectionNames();
    const sectionDescriptions = this.seedService.getSectionDescriptions();
    
    // Formatear las preguntas con opciones de frecuencia
    return questions.map(question => {
      const response = responses.find(r => r.question.id === question.id);
      
      return {
        id: question.id,
        questionNumber: question.questionNumber,
        text: question.text,
        selectedFrequency: response?.frequencyResponse || null,
        score: response?.score || null,
        frequencyOptions: Object.values(FrequencyResponse),
        sectionName: sectionNames[question.section],
        sectionDescription: sectionDescriptions[question.section]
      };
    });
  }
} 