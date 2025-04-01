import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Query, Delete, Patch } from '@nestjs/common';
import { SpiritualGrowthService } from './spiritual-growth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpiritualGrowthTrack } from './entities/spiritual-growth-track.entity';
import { SpiritualCheckIn } from './entities/spiritual-check-in.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { 
  AskSpiritualQuestionDto, 
  SpiritualQuestionResponseDto, 
  SpiritualPathSelectionDto,
  MultipleSpiritualPathSelectionsDto,
  SpiritualPathSuggestionRequestDto,
  SpiritualPathSuggestionResponseDto,
  UserSpiritualPathDto,
  UpdateUserSpiritualPathDto,
  CancelSelectionsResponseDto,
  SpiritualPathCategoriesResponseDto,
  SpiritualPathCategorizedResponseDto,
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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('spiritual-growth')
@Controller('spiritual-growth')
@UseGuards(JwtAuthGuard)
export class SpiritualGrowthController {
  constructor(private readonly spiritualGrowthService: SpiritualGrowthService) {}

  @Get('tracks')
  async findAllTracks(@Request() req) {
    return this.spiritualGrowthService.findAllTracks(req.user.id);
  }

  @Get('tracks/:id')
  async findTrackById(@Request() req, @Param('id') id: string) {
    return this.spiritualGrowthService.findTrackById(id, req.user.id);
  }

  @Post('tracks')
  async createTrack(@Request() req, @Body() trackData: Partial<SpiritualGrowthTrack>) {
    return this.spiritualGrowthService.createTrack(req.user.id, trackData);
  }

  @Post('tracks/:id')
  async updateTrack(
    @Request() req,
    @Param('id') id: string,
    @Body() trackData: Partial<SpiritualGrowthTrack>
  ) {
    return this.spiritualGrowthService.updateTrack(id, req.user.id, trackData);
  }

  @Post('check-in')
  async createCheckIn(@Request() req, @Body() checkInData: Partial<SpiritualCheckIn>) {
    return this.spiritualGrowthService.createCheckIn(req.user.id, checkInData);
  }

  @Get('check-ins')
  async getCheckIns(@Request() req) {
    return this.spiritualGrowthService.getCheckInsForUser(req.user.id);
  }

  @Get('check-ins/track/:trackId')
  async getCheckInsForTrack(@Request() req, @Param('trackId') trackId: string) {
    return this.spiritualGrowthService.getCheckInsForTrack(trackId, req.user.id);
  }

  @Get('recent-check-ins')
  async getRecentCheckIns(@Request() req) {
    return this.spiritualGrowthService.getRecentCheckIns(req.user.id);
  }

  @Get('summary')
  async getSpiritualGrowthSummary(@Request() req) {
    return this.spiritualGrowthService.getSpiritualGrowthSummary(req.user.id);
  }

  // My Path endpoints
  @Get('my-path/categories')
  async getSpiritualPathCategories(): Promise<SpiritualPathCategoriesResponseDto> {
    return this.spiritualGrowthService.getSpiritualPathCategories();
  }

  @Get('my-path/categorized')
  async getCategorizedSuggestions(
    @CurrentUser() user: User,
    @Query('categoryId') categoryId?: number
  ): Promise<SpiritualPathCategorizedResponseDto> {
    return this.spiritualGrowthService.getCategorizedSpiritualPathSuggestions(user.id, categoryId);
  }

  @Get('my-path/progress')
  async getSpiritualPathProgress(@CurrentUser() user: User) {
    return this.spiritualGrowthService.getSpiritualPathProgress(user.id);
  }

  @Get('my-path/suggestions')
  async getSpiritualPathSuggestions(
    @CurrentUser() user: User,
    @Query() requestDto: SpiritualPathSuggestionRequestDto
  ): Promise<SpiritualPathSuggestionResponseDto> {
    return this.spiritualGrowthService.getSpiritualPathSuggestions(user.id, requestDto);
  }

  @Post('my-path/selections')
  async toggleSpiritualPathSelection(
    @CurrentUser() user: User,
    @Body() selectionDto: SpiritualPathSelectionDto
  ): Promise<UserSpiritualPathDto> {
    return this.spiritualGrowthService.toggleSpiritualPathSelection(user.id, selectionDto);
  }

  @Post('my-path/multiple-selections')
  async handleMultipleSelections(
    @CurrentUser() user: User,
    @Body() selectionsDto: MultipleSpiritualPathSelectionsDto
  ): Promise<UserSpiritualPathDto[]> {
    return this.spiritualGrowthService.handleMultipleSelections(user.id, selectionsDto);
  }

  @Post('my-path/save-selections')
  async saveSelections(
    @CurrentUser() user: User
  ): Promise<UserSpiritualPathDto[]> {
    return this.spiritualGrowthService.saveSelections(user.id);
  }

  @Post('my-path/cancel')
  async cancelSelections(
    @CurrentUser() user: User
  ): Promise<CancelSelectionsResponseDto> {
    // Obtenemos información sobre cambios pendientes
    const changeInfo = await this.spiritualGrowthService.getSelectionChangeInfo(user.id);
    
    // Si hay cambios pendientes, devolvemos un mensaje para mostrar el diálogo de confirmación
    if (changeInfo.pendingChanges) {
      return {
        confirmed: false,
        message: `You have ${changeInfo.totalPendingChanges} unsaved changes. Are you sure you want to discard them?`
      };
    } 
    // Si no hay cambios pendientes, simplemente confirmamos
    else {
      return {
        confirmed: true,
        message: 'No changes to discard.'
      };
    }
  }

  @Get('my-path')
  async getUserSpiritualPath(@CurrentUser() user: User): Promise<UserSpiritualPathDto[]> {
    return this.spiritualGrowthService.getUserSpiritualPath(user.id);
  }

  @Put('my-path')
  async updateUserSpiritualPath(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateUserSpiritualPathDto
  ): Promise<UserSpiritualPathDto> {
    return this.spiritualGrowthService.updateUserSpiritualPath(user.id, updateDto);
  }

  @Post('my-path/ask')
  async askSpiritualQuestion(
    @CurrentUser() user: User,
    @Body() questionDto: AskSpiritualQuestionDto
  ): Promise<SpiritualQuestionResponseDto> {
    return this.spiritualGrowthService.askSpiritualQuestion(user.id, questionDto);
  }

  @Get('my-path/questions')
  async getUserSpiritualQuestions(@CurrentUser() user: User): Promise<SpiritualQuestionResponseDto[]> {
    return this.spiritualGrowthService.getUserSpiritualQuestions(user.id);
  }

  @Post('my-path/confirm-cancel')
  async confirmCancel(
    @CurrentUser() user: User,
    @Body() confirmationDto: CancelConfirmationRequestDto
  ): Promise<CancelConfirmationResponseDto> {
    return this.spiritualGrowthService.handleCancelConfirmation(user.id, confirmationDto);
  }

  @Get('my-path/selection-changes')
  async getSelectionChanges(@CurrentUser() user: User) {
    return this.spiritualGrowthService.getSelectionChangeInfo(user.id);
  }

  @Post('my-path/finalize')
  async finalizeSpiritualPath(@CurrentUser() user: User) {
    return this.spiritualGrowthService.finalizeSpiritualPath(user.id);
  }

  @Get('weekly-path')
  @ApiOperation({ summary: 'Get weekly spiritual path' })
  @ApiResponse({ status: 200, description: 'Returns the weekly spiritual path with objective and opportunities' })
  async getWeeklyPath(
    @CurrentUser() user: User,
    @Query() dateQuery?: WeekRequestDto
  ): Promise<WeeklyPathDto> {
    return this.spiritualGrowthService.getWeeklyPath(user.id, dateQuery);
  }

  @Get('weekly-path/history')
  @ApiOperation({ summary: 'Get weekly spiritual path history' })
  @ApiResponse({ status: 200, description: 'Returns the history of weekly spiritual paths with formatted date ranges', type: [WeeklyPathHistoryItemDto] })
  async getWeeklyPathHistory(
    @CurrentUser() user: User
  ): Promise<WeeklyPathHistoryItemDto[]> {
    return this.spiritualGrowthService.getWeeklyPathHistory(user.id);
  }

  @Patch('weekly-objective')
  @ApiOperation({ summary: 'Update weekly spiritual objective' })
  @ApiResponse({ status: 200, description: 'Returns the updated weekly objective' })
  @ApiBody({ type: UpdateWeeklyObjectiveDto })
  async updateWeeklyObjective(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateWeeklyObjectiveDto
  ): Promise<WeeklyObjectiveDto> {
    return this.spiritualGrowthService.updateWeeklyObjective(user.id, updateDto);
  }

  @Patch('weekly-opportunity')
  @ApiOperation({ summary: 'Update weekly spiritual opportunity' })
  @ApiResponse({ status: 200, description: 'Returns the updated weekly opportunity' })
  @ApiBody({ type: UpdateWeeklyOpportunityDto })
  async updateWeeklyOpportunity(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateWeeklyOpportunityDto
  ): Promise<WeeklyOpportunityDto> {
    return this.spiritualGrowthService.updateWeeklyOpportunity(user.id, updateDto);
  }
} 