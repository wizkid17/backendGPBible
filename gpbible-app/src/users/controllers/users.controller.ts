import { Controller, Get, Put, UseGuards, Request, Body } from '@nestjs/common';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePictureDto } from '../dto/update-picture.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: UpdateProfileDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.update(req.user.id, updateProfileDto);
  }

  @Put('profile/picture')
  @ApiOperation({ summary: 'Update profile picture' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile picture updated successfully',
    type: UpdatePictureDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfilePicture(
    @Request() req,
    @Body() pictureDto: UpdatePictureDto,
  ) {
    return this.usersService.updatePicture(req.user.id, pictureDto.pictureUrl);
  }
} 