import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BibleVersionsService } from './bible-versions.service';
import { CreateBibleVersionDto } from './dto/create-bible-version.dto';
import { UpdateBibleVersionDto } from './dto/update-bible-version.dto';
import { SelectVersionDto } from './dto/select-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('bible-versions')
@Controller('bible-versions')
export class BibleVersionsController {
  constructor(private readonly bibleVersionsService: BibleVersionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Bible versions' })
  findAll() {
    return this.bibleVersionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Bible version by ID' })
  findOne(@Param('id') id: string) {
    return this.bibleVersionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Bible version' })
  create(@Body() createBibleVersionDto: CreateBibleVersionDto) {
    return this.bibleVersionsService.create(createBibleVersionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Bible version' })
  update(@Param('id') id: string, @Body() updateBibleVersionDto: UpdateBibleVersionDto) {
    return this.bibleVersionsService.update(id, updateBibleVersionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Bible version' })
  remove(@Param('id') id: string) {
    return this.bibleVersionsService.remove(id);
  }

  @Get('books/all')
  @ApiOperation({ summary: 'Get all Bible books' })
  getAllBooks() {
    return this.bibleVersionsService.getAllBooks();
  }

  @Get('books/:id')
  @ApiOperation({ summary: 'Get a Bible book by ID' })
  getBookById(@Param('id') id: string) {
    return this.bibleVersionsService.getBookById(id);
  }

  @Get('chapters/:id')
  @ApiOperation({ summary: 'Get a Bible chapter by ID' })
  getChapterById(@Param('id') id: string) {
    return this.bibleVersionsService.getChapterById(id);
  }

  @Get('books/:bookId/chapters')
  @ApiOperation({ summary: 'Get all chapters of a Bible book' })
  getChaptersByBookId(@Param('bookId') bookId: string) {
    return this.bibleVersionsService.getChaptersByBookId(bookId);
  }

  @Get('chapters/:chapterId/verses')
  @ApiOperation({ summary: 'Get all verses of a Bible chapter' })
  getVersesByChapterId(@Param('chapterId') chapterId: string) {
    return this.bibleVersionsService.getVersesByChapterId(chapterId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available Bible versions' })
  getAvailableVersions() {
    return this.bibleVersionsService.getAvailableVersions();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('select-version')
  @ApiOperation({ summary: 'Select a Bible version for the user' })
  setDefaultVersion(@Request() req, @Body() versionDto: SelectVersionDto) {
    return this.bibleVersionsService.setDefaultVersion(req.user.id, versionDto);
  }
} 