import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpiritualProgressService } from './spiritual-progress.service';
import { 
  ProgressComparisonRequestDto, 
  ProgressComparisonResponseDto,
  ProgressPeriodType 
} from './dto/progress-comparison.dto';

@ApiTags('spiritual-progress')
@Controller('spiritual-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpiritualProgressController {
  constructor(private readonly spiritualProgressService: SpiritualProgressService) {}

  @Get('my-progress')
  @ApiOperation({ summary: 'Get user\'s spiritual progress comparison' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user\'s spiritual progress comparison', 
    type: ProgressComparisonResponseDto 
  })
  async getMyProgress(
    @Request() req,
    @Query('periodType') periodType: ProgressPeriodType = ProgressPeriodType.WEEKLY,
    @Query('firstPeriodId') firstPeriodId?: string,
    @Query('secondPeriodId') secondPeriodId?: string,
    @Query('includeCurrentPeriod') includeCurrentPeriod: boolean = true,
  ): Promise<ProgressComparisonResponseDto> {
    const userId = req.user.userId;
    
    const dto: ProgressComparisonRequestDto = {
      periodType,
      firstPeriodId,
      secondPeriodId,
      includeCurrentPeriod,
    };
    
    return this.spiritualProgressService.getProgressComparison(userId, dto);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare spiritual progress between periods' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns comparison between specified periods', 
    type: ProgressComparisonResponseDto 
  })
  async compareProgress(
    @Request() req,
    @Body() dto: ProgressComparisonRequestDto
  ): Promise<ProgressComparisonResponseDto> {
    const userId = req.user.userId;
    return this.spiritualProgressService.getProgressComparison(userId, dto);
  }

  // For testing purposes - creates mock data
  @Post('record-completion')
  @ApiOperation({ summary: 'Record a new opportunity completion (for testing)' })
  @ApiResponse({ status: 200, description: 'Opportunity completion recorded' })
  async recordCompletion(
    @Request() req,
    @Body() data: {
      opportunityId: string;
      title: string;
      type: string;
      description?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.userId;
    
    await this.spiritualProgressService.recordOpportunityCompletion(
      userId,
      data.opportunityId,
      {
        title: data.title,
        type: data.type,
        description: data.description
      }
    );
    
    return { 
      success: true, 
      message: 'Opportunity completion recorded successfully' 
    };
  }
} 