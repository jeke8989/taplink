import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(@Request() req) {
    const profile = await this.profileService.findProfileByUserId(
      req.user.userId,
    );
    // Включаем username из User
    const user = await this.profileService.getUserById(req.user.userId);
    return {
      ...profile,
      username: user?.username || null,
    };
  }

  @Put('me')
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }
}

