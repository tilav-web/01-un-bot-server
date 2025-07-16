import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  UseGuards,
  Request,
  Res,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateAdminRequestDto } from './dto/create-admin-request.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AdminRole } from './schemas/admin-user.schema';
import { Response } from 'express';
import { BotService } from '../bot/bot.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly botService: BotService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, uid, role } = await this.authService.login(
      loginDto.uid,
      loginDto.password,
    );
    response.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    }); // 1 hour
    return { uid, role };
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  async createAdmin(@Body() createAdminRequestDto: CreateAdminRequestDto) {
    try {
      const adminUser = await this.authService.createAdminFromTelegramId(
        createAdminRequestDto.telegram_id,
        createAdminRequestDto.password,
      );
      return {
        message: 'Admin foydalanuvchi muvaffaqiyatli yaratildi',
        adminUser: { uid: adminUser.uid, role: adminUser.role },
      };
    } catch (error) {
      if (
        error.message.includes('allaqachon admin sifatida roʻyxatdan oʻtgan')
      ) {
        return { message: error.message, status: HttpStatus.CONFLICT };
      }
      throw error; // Re-throw other errors
    }
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMe(
    @Request() req,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    const currentAdminUid = req.user.uid; // Get UID from authenticated user

    try {
      const updatedAdmin = await this.authService.updateAdminUser(
        currentAdminUid,
        updateAdminUserDto,
      );
      if (!updatedAdmin) {
        return {
          message: 'Admin foydalanuvchi topilmadi',
          status: HttpStatus.NOT_FOUND,
        };
      }
      return { uid: updatedAdmin.uid, role: updatedAdmin.role };
    } catch (error) {
      if (error.message.includes('allaqachon mavjud')) {
        return { message: error.message, status: HttpStatus.CONFLICT };
      }
      throw error;
    }
  }

  @Patch('admin/:uid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAdminByUid(
    @Param('uid') uid: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    try {
      const updatedAdmin = await this.authService.updateAdminUser(
        uid,
        updateAdminUserDto,
      );
      if (!updatedAdmin) {
        return {
          message: 'Admin foydalanuvchi topilmadi',
          status: HttpStatus.NOT_FOUND,
        };
      }
      return {
        message: 'Admin foydalanuvchi maʼlumotlari muvaffaqiyatli yangilandi',
        adminUser: { uid: updatedAdmin.uid, role: updatedAdmin.role },
      };
    } catch (error) {
      if (error.message.includes('allaqachon mavjud')) {
        return { message: error.message, status: HttpStatus.CONFLICT };
      }
      throw error;
    }
  }

  @Post('register-temp-admin')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerTempAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    try {
      const adminUser =
        await this.authService.createAdminUser(createAdminUserDto);
      return {
        message: 'Vaqtinchalik admin foydalanuvchi muvaffaqiyatli yaratildi',
        adminUser: { uid: adminUser.uid, role: adminUser.role },
      };
    } catch (error) {
      if (error.message.includes('duplicate key error')) {
        return {
          message: 'Bu UID allaqachon mavjud',
          status: HttpStatus.CONFLICT,
        };
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { uid, role, sub } = req.user;
    const payload = { uid, role, sub };
    const access_token = this.authService.generateAccessToken(payload);
    response.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    }); // 1 hour
    return { uid, role };
  }

  @Get('admins')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  async getAdmins(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: AdminRole,
  ) {
    return this.authService.findAllAdmins(
      Number(page),
      Number(limit),
      search,
      role,
    );
  }

  @Delete('admins/:uid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeAdmin(@Param('uid') uid: string, @Request() req) {
    if (req.user.uid === uid) {
      return {
        message: 'O`zingizni o`chira olmaysiz',
        status: HttpStatus.BAD_REQUEST,
      };
    }
    const result = await this.authService.removeAdmin(uid);
    if (result.success && result.user) {
      try {
        await this.botService.sendMessage(
          result.user.telegram_id,
          'Siz adminlik huquqidan mahrum qilindingiz.',
        );
      } catch (error) {
        console.error('Failed to send message to user:', error);
      }
    }
    return { message: 'Admin muvaffaqiyatli oʻchirildi' };
  }

  @Patch('admins/:uid/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateAdminPassword(
    @Param('uid') uid: string,
    @Body('password') password: string,
  ) {
    if (!password) {
      return {
        message: 'Parol taqdim etilmagan',
        status: HttpStatus.BAD_REQUEST,
      };
    }
    await this.authService.updateAdminPassword(uid, password);
    return { message: 'Admin paroli muvaffaqiyatli yangilandi' };
  }
}
