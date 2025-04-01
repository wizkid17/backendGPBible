import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SpiritualAssessmentService } from './spiritual-assessment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssessmentSectionType } from './enums/assessment-section-type.enum';
import { FrequencyResponse } from './entities/spiritual-assessment-response.entity';
import { SpiritualAssessmentSeedService } from './spiritual-assessment-seed.service';
import { dashboardConstants } from './data/feedback-templates';

interface ResponseSubmitDto {
  questionId: string;
  score: number;
  frequencyResponse?: string;
  notes?: string;
}

@Controller('spiritual-assessment')
export class SpiritualAssessmentController {
  constructor(
    private readonly assessmentService: SpiritualAssessmentService,
    private readonly seedService: SpiritualAssessmentSeedService
  ) {}

  // Endpoint para obtener la evaluación activa completa
  @Get()
  async getActiveAssessment() {
    return this.assessmentService.getActiveAssessment();
  }

  // Endpoint para obtener preguntas por sección
  @Get('sections/:section')
  async getQuestionsBySection(@Param('section') section: AssessmentSectionType) {
    return this.assessmentService.getQuestionsBySection(section);
  }

  // Endpoint para obtener preguntas formateadas para la UI
  @Get('ui/sections/:section')
  async getFormattedSectionQuestions(@Param('section') section: AssessmentSectionType) {
    return this.assessmentService.getFormattedSectionQuestions(section);
  }

  // Endpoint para obtener preguntas con opciones de frecuencia
  @UseGuards(JwtAuthGuard)
  @Get('frequency-questions/:section')
  async getQuestionsWithFrequencyOptions(
    @Request() req,
    @Param('section') section: AssessmentSectionType
  ) {
    return this.assessmentService.getQuestionsWithFrequencyOptions(section, req.user.id);
  }

  // Endpoint para guardar una respuesta
  @UseGuards(JwtAuthGuard)
  @Post('responses')
  async saveResponse(
    @Request() req,
    @Body() responseData: ResponseSubmitDto
  ) {
    return this.assessmentService.saveResponse(
      req.user.id,
      responseData.questionId,
      responseData.score,
      responseData.frequencyResponse,
      responseData.notes
    );
  }

  // Endpoint para guardar varias respuestas a la vez
  @UseGuards(JwtAuthGuard)
  @Post('responses/bulk')
  async saveBulkResponses(
    @Request() req,
    @Body() responsesData: ResponseSubmitDto[]
  ) {
    const results = [];
    for (const response of responsesData) {
      const result = await this.assessmentService.saveResponse(
        req.user.id,
        response.questionId,
        response.score,
        response.frequencyResponse,
        response.notes
      );
      results.push(result);
    }
    return results;
  }

  // Endpoint para obtener las respuestas del usuario
  @UseGuards(JwtAuthGuard)
  @Get('responses')
  async getUserResponses(@Request() req) {
    return this.assessmentService.getUserResponses(req.user.id);
  }

  // Endpoint para obtener las respuestas del usuario por sección
  @UseGuards(JwtAuthGuard)
  @Get('responses/section/:section')
  async getUserResponsesBySection(
    @Request() req,
    @Param('section') section: AssessmentSectionType
  ) {
    return this.assessmentService.getUserResponsesBySection(req.user.id, section);
  }

  // Endpoint para obtener un resumen de la evaluación del usuario
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getAssessmentSummary(@Request() req) {
    return this.assessmentService.getAssessmentSummary(req.user.id);
  }

  // Endpoint para obtener un resumen personalizado con recomendaciones
  @UseGuards(JwtAuthGuard)
  @Get('personalized-feedback')
  async getPersonalizedFeedback(@Request() req) {
    return this.assessmentService.getPersonalizedAssessmentFeedback(req.user.id);
  }

  // Endpoint para obtener resumen formateado para la UI como se muestra en la imagen
  @UseGuards(JwtAuthGuard)
  @Get('dashboard-summary')
  async getDashboardSummary(@Request() req) {
    const summary = await this.assessmentService.getAssessmentSummary(req.user.id);
    
    // Convertir a formato para el dashboard como se muestra en la imagen
    return {
      connection: Math.round(summary.sectionAverages[AssessmentSectionType.CONNECTION] * dashboardConstants.percentageMultiplier),
      guidance: Math.round(summary.sectionAverages[AssessmentSectionType.GUIDANCE] * dashboardConstants.percentageMultiplier),
      gratitude: Math.round(summary.sectionAverages[AssessmentSectionType.GRATITUDE] * dashboardConstants.percentageMultiplier),
      compassion: dashboardConstants.compassionBaseValue, 
      closeness: dashboardConstants.closenessBaseValue,
      completionPercentage: summary.completionPercentage,
      pillars: [
        {
          name: 'Connection',
          value: Math.round(summary.sectionAverages[AssessmentSectionType.CONNECTION] * dashboardConstants.percentageMultiplier),
          description: 'Your relationship with God'
        },
        {
          name: 'Guidance',
          value: Math.round(summary.sectionAverages[AssessmentSectionType.GUIDANCE] * dashboardConstants.percentageMultiplier),
          description: 'Following God\'s direction'
        },
        {
          name: 'Gratitude',
          value: Math.round(summary.sectionAverages[AssessmentSectionType.GRATITUDE] * dashboardConstants.percentageMultiplier),
          description: 'Thankfulness for blessings'
        },
        {
          name: 'Compassion',
          value: dashboardConstants.compassionBaseValue,
          description: 'Love for others'
        },
        {
          name: 'Closeness',
          value: dashboardConstants.closenessBaseValue,
          description: 'Intimacy with God'
        }
      ]
    };
  }

  // Endpoint para obtener todas las secciones de la evaluación
  @Get('sections')
  async getAssessmentSections() {
    return Object.values(AssessmentSectionType).map(section => ({
      type: section,
      name: this.getSectionName(section),
      description: this.getSectionDescription(section)
    }));
  }

  // Helper methods
  private getSectionName(section: AssessmentSectionType): string {
    const names = this.seedService.getSectionNames();
    return names[section] || section;
  }

  private getSectionDescription(section: AssessmentSectionType): string {
    const descriptions = this.seedService.getSectionDescriptions();
    return descriptions[section] || '';
  }

  // Endpoint para obtener las opciones de frecuencia
  @Get('frequency-options')
  getFrequencyOptions() {
    return this.seedService.getFrequencyOptions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary-url')
  getSummaryUrl() {
    return {
      title: 'Spiritual Alignment Assessment',
      description: 'See how you connected with the 5 pillars',
      summaryUrl: '/spiritual-assessment/summary',
      assessmentUrl: '/spiritual-assessment'
    };
  }

  // Endpoint para regenerar los datos de prueba (solo para desarrollo)
  @Post('regenerate-test-data')
  async regenerateTestData() {
    return this.seedService.regenerateTestData();
  }
} 