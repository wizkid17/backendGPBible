import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './entities/feedback.entity';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully', type: Feedback })
  create(@Request() req, @Body() createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    return this.feedbackService.create(req.user.id, createFeedbackDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'Return all feedback', type: [Feedback] })
  findAll(): Promise<Feedback[]> {
    return this.feedbackService.findAll();
  }

  @Get('my-feedback')
  @ApiOperation({ summary: 'Get user\'s feedback' })
  @ApiResponse({ status: 200, description: 'Return user\'s feedback', type: [Feedback] })
  findMine(@Request() req): Promise<Feedback[]> {
    return this.feedbackService.findByUser(req.user.id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark feedback as resolved' })
  @ApiResponse({ status: 200, description: 'Feedback marked as resolved', type: Feedback })
  resolve(@Param('id') id: string): Promise<Feedback> {
    return this.feedbackService.markAsResolved(id);
  }
} 