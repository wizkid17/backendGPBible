import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FAQsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FAQ } from './entities/faq.entity';

@ApiTags('FAQs')
@Controller('faqs')
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'Return all active FAQs', type: [FAQ] })
  findAll(): Promise<FAQ[]> {
    return this.faqsService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get FAQs by category' })
  @ApiResponse({ status: 200, description: 'Return FAQs by category', type: [FAQ] })
  findByCategory(@Param('category') category: string): Promise<FAQ[]> {
    return this.faqsService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific FAQ' })
  @ApiResponse({ status: 200, description: 'Return the FAQ', type: FAQ })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  findOne(@Param('id') id: string): Promise<FAQ> {
    return this.faqsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({ status: 201, description: 'The FAQ has been created', type: FAQ })
  create(@Body() createFaqDto: CreateFaqDto): Promise<FAQ> {
    return this.faqsService.create(createFaqDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiResponse({ status: 200, description: 'The FAQ has been updated', type: FAQ })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto): Promise<FAQ> {
    return this.faqsService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiResponse({ status: 200, description: 'The FAQ has been deleted' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.faqsService.remove(id);
  }
} 