import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { About } from './entities/about.entity';

@ApiTags('About')
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @ApiOperation({ summary: 'Get about information' })
  @ApiResponse({ status: 200, description: 'Return about information', type: About })
  getAboutInfo(): Promise<About> {
    return this.aboutService.getAboutInfo();
  }

  @Get('core-values')
  @ApiOperation({ summary: 'Get core values' })
  @ApiResponse({ status: 200, description: 'Return core values' })
  getCoreValues(): Promise<Record<string, string>> {
    return this.aboutService.getCoreValues();
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get timeline' })
  @ApiResponse({ status: 200, description: 'Return timeline' })
  getTimeline(): Promise<Array<{ year: number; description: string }>> {
    return this.aboutService.getTimeline();
  }

  @Get('team')
  @ApiOperation({ summary: 'Get team information' })
  @ApiResponse({ status: 200, description: 'Return team information' })
  getTeam(): Promise<Array<{ name: string; role: string; imageUrl: string }>> {
    return this.aboutService.getTeam();
  }
} 