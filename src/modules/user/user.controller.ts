import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '../auth/schemas/admin-user.schema';
import { UserStatus } from './schemas/user.schema';
import { BotService } from '../bot/bot.service';
import { AuthService } from '../auth/auth.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly botService: BotService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Roles(AdminRole.SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
  ) {
    return this.userService.findAll(Number(page), Number(limit), search, status);
  }

  @Get(':telegram_id')
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  findOne(@Param('telegram_id') telegram_id: string) {
    return this.userService.findOne(+telegram_id);
  }

  @Patch(':telegram_id/status')
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('telegram_id') telegram_id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = await this.userService.update(+telegram_id, { status });
    if (user && status === UserStatus.ACTIVE) {
      try {
        await this.botService.sendMessage(
          +telegram_id,
          'Siz blokdan chiqarildingiz va botdan foydalanishingiz mumkin.',
        );
      } catch (error) {
        if (error.message.includes('bot was blocked by the user')) {
          await this.userService.update(+telegram_id, { status: UserStatus.NOT_ACTIVE });
          return { message: 'User blocked the bot, status set to NOT_ACTIVE' };
        }
        throw error;
      }
    }
    return user;
  }

  @Post(':telegram_id/make-admin')
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async makeAdmin(
    @Param('telegram_id') telegram_id: string,
    @Body('password') password: string,
  ) {
    try {
      const adminUser = await this.authService.createAdminFromTelegramId(
        +telegram_id,
        password,
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
}
