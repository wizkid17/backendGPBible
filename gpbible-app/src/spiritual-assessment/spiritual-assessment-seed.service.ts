import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpiritualAssessment } from './entities/spiritual-assessment.entity';
import { SpiritualAssessmentQuestion } from './entities/spiritual-assessment-question.entity';
import { FrequencyResponse } from './entities/spiritual-assessment-response.entity';
import { AssessmentSectionType } from './enums/assessment-section-type.enum';

/**
 * Servicio para inicializar y gestionar datos semilla (seed) para la evaluación espiritual
 */
@Injectable()
export class SpiritualAssessmentSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(SpiritualAssessment)
    private assessmentRepository: Repository<SpiritualAssessment>,
    @InjectRepository(SpiritualAssessmentQuestion)
    private questionRepository: Repository<SpiritualAssessmentQuestion>
  ) {}

  /**
   * Se ejecuta automáticamente cuando el módulo se inicializa
   */
  async onModuleInit() {
    await this.initializeDefaultData();
  }

  /**
   * Inicializa los datos por defecto si no existen
   */
  async initializeDefaultData() {
    // Verificar si ya hay evaluaciones
    const assessmentCount = await this.assessmentRepository.count();
    
    if (assessmentCount === 0) {
      await this.seedAssessmentData();
    }
  }

  /**
   * Crea los datos de la evaluación espiritual en la base de datos
   */
  private async seedAssessmentData() {
    // 1. Crear la evaluación principal
    const assessment = await this.createMainAssessment();
    
    // 2. Crear las secciones con sus preguntas
    await this.createConnectionQuestions(assessment);
    await this.createPeaceQuestions(assessment);
    await this.createCompassionQuestions(assessment);
    
    console.log('Datos de evaluación espiritual inicializados correctamente');
  }

  /**
   * Crea la evaluación principal
   */
  private async createMainAssessment(): Promise<SpiritualAssessment> {
    const assessment = this.assessmentRepository.create({
      title: 'Spiritual Alignment Assessment',
      description: 'This assessment will help you identify areas of growth in your spiritual life.',
      version: 1,
      sectionCount: 3,
      questionCount: 9,
      isActive: true
    });
    
    return this.assessmentRepository.save(assessment);
  }

  /**
   * Crea las preguntas para la sección Connection
   */
  private async createConnectionQuestions(assessment: SpiritualAssessment) {
    const questions = [
      {
        questionNumber: 1,
        text: 'I often feel a sense of closeness to a higher power, the universe, or divine presence.',
        section: AssessmentSectionType.CONNECTION,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 2,
        text: 'In my daily life, I experience moments when I feel spiritually connected.',
        section: AssessmentSectionType.CONNECTION,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 3,
        text: 'I find comfort in my belief in something greater than myself.',
        section: AssessmentSectionType.CONNECTION,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      }
    ];

    for (const questionData of questions) {
      await this.questionRepository.save(this.questionRepository.create(questionData));
    }
  }

  /**
   * Crea las preguntas para la sección Peace (Gratitude)
   */
  private async createPeaceQuestions(assessment: SpiritualAssessment) {
    const questions = [
      {
        questionNumber: 4,
        text: 'I experience a deep sense of peace or calm through spiritual practices like prayer or meditation.',
        section: AssessmentSectionType.GRATITUDE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 5,
        text: 'I take time to reflect on the meaning and purpose of my life.',
        section: AssessmentSectionType.GRATITUDE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 6,
        text: 'My spirituality helps me feel at peace with myself and the world around me.',
        section: AssessmentSectionType.GRATITUDE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      }
    ];

    for (const questionData of questions) {
      await this.questionRepository.save(this.questionRepository.create(questionData));
    }
  }

  /**
   * Crea las preguntas para la sección Compassion (Guidance)
   */
  private async createCompassionQuestions(assessment: SpiritualAssessment) {
    const questions = [
      {
        questionNumber: 7,
        text: 'I regularly set aside time for spiritual practices such as prayer, meditation, or reading sacred texts.',
        section: AssessmentSectionType.GUIDANCE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 8,
        text: 'I look for spiritual meaning in the challenges I face.',
        section: AssessmentSectionType.GUIDANCE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      },
      {
        questionNumber: 9,
        text: 'My faith provides me with guidance for making important decisions.',
        section: AssessmentSectionType.GUIDANCE,
        maxScore: 5,
        minScore: 1,
        isActive: true,
        assessment
      }
    ];

    for (const questionData of questions) {
      await this.questionRepository.save(this.questionRepository.create(questionData));
    }
  }

  /**
   * Método para regenerar los datos de prueba (útil para desarrollo/tests)
   */
  async regenerateTestData() {
    // Eliminar todas las preguntas
    await this.questionRepository.delete({});
    
    // Eliminar todas las evaluaciones
    await this.assessmentRepository.delete({});
    
    // Recrear todos los datos
    await this.seedAssessmentData();
    
    return { success: true, message: 'Datos de prueba regenerados correctamente' };
  }

  /**
   * Método para obtener las opciones de frecuencia (que estaban en duro)
   */
  getFrequencyOptions() {
    return Object.values(FrequencyResponse);
  }

  /**
   * Obtiene los nombres de las secciones
   */
  getSectionNames() {
    return {
      [AssessmentSectionType.CONNECTION]: 'Connection',
      [AssessmentSectionType.GRATITUDE]: 'Peace',
      [AssessmentSectionType.GUIDANCE]: 'Compassion'
    };
  }

  /**
   * Obtiene las descripciones de las secciones
   */
  getSectionDescriptions() {
    return {
      [AssessmentSectionType.CONNECTION]: 'Exploring your relationship with the Divine or Higher Power.',
      [AssessmentSectionType.GRATITUDE]: 'Discovering inner peace and moments of reflection.',
      [AssessmentSectionType.GUIDANCE]: 'Finding spiritual guidance and connecting with a higher purpose.'
    };
  }
} 