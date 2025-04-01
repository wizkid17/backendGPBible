import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { WeeklyProgress } from './entities/weekly-progress.entity';
import { MonthlyProgress } from './entities/monthly-progress.entity';
import { OpportunityCompletion } from './entities/opportunity-completion.entity';
import { 
  ProgressComparisonRequestDto, 
  ProgressComparisonResponseDto, 
  PeriodDetailDto,
  ProgressPeriodType 
} from './dto/progress-comparison.dto';

@Injectable()
export class SpiritualProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    
    @InjectRepository(WeeklyProgress)
    private weeklyProgressRepository: Repository<WeeklyProgress>,
    
    @InjectRepository(MonthlyProgress)
    private monthlyProgressRepository: Repository<MonthlyProgress>,
    
    @InjectRepository(OpportunityCompletion)
    private opportunityCompletionRepository: Repository<OpportunityCompletion>,
  ) {}

  async getUserProgress(userId: string): Promise<UserProgress> {
    let userProgress = await this.userProgressRepository.findOne({
      where: { userId },
      relations: ['weeklyProgress', 'monthlyProgress'],
    });

    if (!userProgress) {
      // If user progress doesn't exist, create a new one
      userProgress = this.userProgressRepository.create({
        userId,
        totalCompletedOpportunities: 0,
        totalAssignedOpportunities: 0,
        consecutiveDaysActive: 0,
        overallCompletionPercentage: 0,
      });
      await this.userProgressRepository.save(userProgress);
    }

    return userProgress;
  }

  async getProgressComparison(
    userId: string,
    dto: ProgressComparisonRequestDto
  ): Promise<ProgressComparisonResponseDto> {
    // First get the user progress record
    const userProgress = await this.getUserProgress(userId);
    
    if (dto.periodType === ProgressPeriodType.WEEKLY) {
      return this.getWeeklyProgressComparison(userProgress.id, dto);
    } else {
      return this.getMonthlyProgressComparison(userProgress.id, dto);
    }
  }

  private async getWeeklyProgressComparison(
    userProgressId: string,
    dto: ProgressComparisonRequestDto
  ): Promise<ProgressComparisonResponseDto> {
    // Get all available weekly periods for this user
    const availableWeeks = await this.weeklyProgressRepository.find({
      where: { userProgressId },
      order: { startDate: 'DESC' },
    });

    if (availableWeeks.length === 0) {
      throw new NotFoundException('No weekly progress data found for this user');
    }

    // Map to DTOs
    const availablePeriods = availableWeeks.map(week => ({
      id: week.id,
      label: week.weekLabel,
      startDate: week.startDate,
      endDate: week.endDate,
      completedOpportunities: week.completedOpportunities,
      assignedOpportunities: week.assignedOpportunities,
      completionPercentage: week.completionPercentage,
      isCurrentPeriod: week.isCurrentWeek,
    }));

    // Get the periods for comparison
    let firstPeriod: PeriodDetailDto | undefined;
    let secondPeriod: PeriodDetailDto | undefined;

    // If specific periods were requested, find them
    if (dto.firstPeriodId) {
      firstPeriod = availablePeriods.find(p => p.id === dto.firstPeriodId);
      if (!firstPeriod) {
        throw new NotFoundException(`Weekly period with ID ${dto.firstPeriodId} not found`);
      }
    } else if (dto.includeCurrentPeriod) {
      // Use current week as first period
      firstPeriod = availablePeriods.find(p => p.isCurrentPeriod);
    }

    if (dto.secondPeriodId) {
      secondPeriod = availablePeriods.find(p => p.id === dto.secondPeriodId);
      if (!secondPeriod) {
        throw new NotFoundException(`Weekly period with ID ${dto.secondPeriodId} not found`);
      }
    } else if (availablePeriods.length > 1 && firstPeriod) {
      // Use previous week as second period
      const firstPeriodIndex = availablePeriods.findIndex(p => p.id === firstPeriod?.id);
      if (firstPeriodIndex >= 0 && firstPeriodIndex < availablePeriods.length - 1) {
        secondPeriod = availablePeriods[firstPeriodIndex + 1];
      }
    }

    // Calculate comparison insights if both periods are available
    let comparisonInsights = undefined;
    if (firstPeriod && secondPeriod) {
      comparisonInsights = this.calculateComparisonInsights(firstPeriod, secondPeriod);
    }

    return {
      periodType: ProgressPeriodType.WEEKLY,
      availablePeriods,
      firstPeriod,
      secondPeriod,
      comparisonInsights,
    };
  }

  private async getMonthlyProgressComparison(
    userProgressId: string,
    dto: ProgressComparisonRequestDto
  ): Promise<ProgressComparisonResponseDto> {
    // Get all available monthly periods for this user
    const availableMonths = await this.monthlyProgressRepository.find({
      where: { userProgressId },
      order: {
        year: 'DESC',
        month: 'DESC'
      },
    });

    if (availableMonths.length === 0) {
      throw new NotFoundException('No monthly progress data found for this user');
    }

    // Map to DTOs
    const availablePeriods = availableMonths.map(month => ({
      id: month.id,
      label: month.monthLabel,
      month: month.month,
      year: month.year,
      completedOpportunities: month.completedOpportunities,
      assignedOpportunities: month.assignedOpportunities,
      completionPercentage: month.completionPercentage,
      isCurrentPeriod: month.isCurrentMonth,
    }));

    // Get the periods for comparison
    let firstPeriod: PeriodDetailDto | undefined;
    let secondPeriod: PeriodDetailDto | undefined;

    // If specific periods were requested, find them
    if (dto.firstPeriodId) {
      firstPeriod = availablePeriods.find(p => p.id === dto.firstPeriodId);
      if (!firstPeriod) {
        throw new NotFoundException(`Monthly period with ID ${dto.firstPeriodId} not found`);
      }
    } else if (dto.includeCurrentPeriod) {
      // Use current month as first period
      firstPeriod = availablePeriods.find(p => p.isCurrentPeriod);
    }

    if (dto.secondPeriodId) {
      secondPeriod = availablePeriods.find(p => p.id === dto.secondPeriodId);
      if (!secondPeriod) {
        throw new NotFoundException(`Monthly period with ID ${dto.secondPeriodId} not found`);
      }
    } else if (availablePeriods.length > 1 && firstPeriod) {
      // Use previous month as second period
      const firstPeriodIndex = availablePeriods.findIndex(p => p.id === firstPeriod?.id);
      if (firstPeriodIndex >= 0 && firstPeriodIndex < availablePeriods.length - 1) {
        secondPeriod = availablePeriods[firstPeriodIndex + 1];
      }
    }

    // Calculate comparison insights if both periods are available
    let comparisonInsights = undefined;
    if (firstPeriod && secondPeriod) {
      comparisonInsights = this.calculateComparisonInsights(firstPeriod, secondPeriod);
    }

    return {
      periodType: ProgressPeriodType.MONTHLY,
      availablePeriods,
      firstPeriod,
      secondPeriod,
      comparisonInsights,
    };
  }

  private calculateComparisonInsights(firstPeriod: PeriodDetailDto, secondPeriod: PeriodDetailDto) {
    // Calculate percentage change in completion percentage
    const percentageChange = firstPeriod.completionPercentage - secondPeriod.completionPercentage;
    
    // Calculate weekly average change (dummy value for now)
    const weeklyAverageChange = 10; // In a real implementation, this would be calculated based on actual data
    
    // Calculate active days change (dummy value for now)
    const activeDaysChange = 2; // In a real implementation, this would be calculated based on actual data
    
    // Calculate overall progress change (dummy value for now)
    const overallProgressChange = 5; // In a real implementation, this would be calculated based on actual data
    
    return {
      percentageChange,
      weeklyAverageChange,
      activeDaysChange,
      overallProgressChange,
    };
  }

  // Mock method to record a new opportunity completion
  async recordOpportunityCompletion(
    userId: string,
    opportunityId: string,
    details: any
  ): Promise<void> {
    // Get the user progress record
    const userProgress = await this.getUserProgress(userId);
    
    // Get or create the current week progress
    const currentWeek = await this.getCurrentWeekProgress(userProgress.id);
    
    // Get or create the current month progress
    const currentMonth = await this.getCurrentMonthProgress(userProgress.id);
    
    // Create the completion record
    const completion = this.opportunityCompletionRepository.create({
      userId,
      opportunityId,
      completionDate: new Date(),
      weekId: currentWeek.id,
      monthId: currentMonth.id,
      opportunityDetails: details,
    });
    
    await this.opportunityCompletionRepository.save(completion);
    
    // Update weekly progress
    currentWeek.completedOpportunities += 1;
    currentWeek.completionPercentage = 
      (currentWeek.completedOpportunities / currentWeek.assignedOpportunities) * 100;
    await this.weeklyProgressRepository.save(currentWeek);
    
    // Update monthly progress
    currentMonth.completedOpportunities += 1;
    currentMonth.completionPercentage = 
      (currentMonth.completedOpportunities / currentMonth.assignedOpportunities) * 100;
    await this.monthlyProgressRepository.save(currentMonth);
    
    // Update user progress
    userProgress.totalCompletedOpportunities += 1;
    userProgress.overallCompletionPercentage = 
      (userProgress.totalCompletedOpportunities / userProgress.totalAssignedOpportunities) * 100;
    userProgress.lastActiveDate = new Date();
    
    // Update consecutive days
    // This is a simplified implementation; in a real app, you'd check if the last activity was yesterday
    userProgress.consecutiveDaysActive += 1;
    if (userProgress.consecutiveDaysActive > userProgress.bestConsecutiveDays) {
      userProgress.bestConsecutiveDays = userProgress.consecutiveDaysActive;
    }
    
    await this.userProgressRepository.save(userProgress);
  }

  private async getCurrentWeekProgress(userProgressId: string): Promise<WeeklyProgress> {
    // Get the current date
    const now = new Date();
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Generate a label for the week
    const weekLabel = `Week of ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    
    // Find the current week's progress or create a new one
    let weekProgress = await this.weeklyProgressRepository.findOne({
      where: {
        userProgressId,
        startDate: startOfWeek,
        endDate: endOfWeek,
      },
    });
    
    if (!weekProgress) {
      weekProgress = this.weeklyProgressRepository.create({
        userProgressId,
        startDate: startOfWeek,
        endDate: endOfWeek,
        weekLabel,
        assignedOpportunities: 7, // Assuming 7 opportunities per week
        completedOpportunities: 0,
        completionPercentage: 0,
        activeDaysInWeek: 0,
        isCurrentWeek: true,
      });
      
      // Mark previous current week as not current
      await this.weeklyProgressRepository.update(
        { userProgressId, isCurrentWeek: true },
        { isCurrentWeek: false }
      );
      
      await this.weeklyProgressRepository.save(weekProgress);
    }
    
    return weekProgress;
  }

  private async getCurrentMonthProgress(userProgressId: string): Promise<MonthlyProgress> {
    // Get the current date
    const now = new Date();
    
    // Get the current month and year
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Generate a month label
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Find the current month's progress or create a new one
    let monthProgress = await this.monthlyProgressRepository.findOne({
      where: {
        userProgressId,
        month: currentMonth + 1, // 1-12 instead of 0-11
        year: currentYear,
      },
    });
    
    if (!monthProgress) {
      // Calculate days in month for assigned opportunities
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      monthProgress = this.monthlyProgressRepository.create({
        userProgressId,
        month: currentMonth + 1,
        year: currentYear,
        monthLabel,
        assignedOpportunities: daysInMonth, // One opportunity per day
        completedOpportunities: 0,
        completionPercentage: 0,
        activeDaysInMonth: 0,
        isCurrentMonth: true,
      });
      
      // Mark previous current month as not current
      await this.monthlyProgressRepository.update(
        { userProgressId, isCurrentMonth: true },
        { isCurrentMonth: false }
      );
      
      await this.monthlyProgressRepository.save(monthProgress);
    }
    
    return monthProgress;
  }
} 