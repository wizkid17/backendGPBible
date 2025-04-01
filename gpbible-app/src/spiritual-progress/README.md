# Spiritual Progress Module

This module provides functionality to track and compare a user's spiritual progress over time, showing statistics for both weekly and monthly periods.

## Features

- Track user's spiritual progress on a weekly and monthly basis
- Compare progress between different periods (weekly or monthly)
- View completion statistics for spiritual opportunities
- Display consecutive active days and activity streaks
- Visualize progress through completion percentages

## Data Structure

### Entities

1. **UserProgress**
   - Tracks overall user progress data
   - Stores total completed and assigned opportunities
   - Tracks consecutive active days and best streaks

2. **WeeklyProgress**
   - Tracks progress for a specific week
   - Stores completion data and percentages

3. **MonthlyProgress**
   - Tracks progress for a specific month
   - Aggregates weekly data into monthly summaries

4. **OpportunityCompletion**
   - Records each individual completion of a spiritual opportunity
   - References both week and month for proper aggregation

## API Endpoints

- `GET /spiritual-progress/my-progress` - Get user's spiritual progress data with comparison
- `POST /spiritual-progress/compare` - Compare progress between specific periods
- `POST /spiritual-progress/record-completion` - Record a new opportunity completion (for testing)

## User Interface

The UI for this feature allows users to:

1. Toggle between weekly and monthly views
2. Select different periods to compare
3. View a circular progress indicator showing completion percentage
4. See statistics about opportunities realized
5. View insights about their progress between periods, including:
   - Percentage change in completion rate
   - Weekly average improvement
   - Active days streak
   - Overall progress improvement

## Implementation Details

- Progress is automatically calculated when opportunities are completed
- Current week and month are tracked for easy comparison
- Consecutive days tracking helps motivate consistent engagement
- Progress comparison provides insights on improvement over time 