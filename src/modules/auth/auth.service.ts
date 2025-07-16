import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  AdminUser,
  AdminUserDocument,
  AdminRole,
} from './schemas/admin-user.schema';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminUser.name)
    private adminUserModel: Model<AdminUserDocument>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async createAdminUser(
    createAdminUserDto: CreateAdminUserDto,
  ): Promise<AdminUserDocument> {
    const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);
    const createdAdminUser = new this.adminUserModel({
      ...createAdminUserDto,
      password: hashedPassword,
    });
    return createdAdminUser.save();
  }

  async findByUid(uid: string): Promise<AdminUserDocument | null> {
    return this.adminUserModel.findOne({ uid }).exec();
  }

  async validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, storedPasswordHash);
  }

  async createAdminFromTelegramId(
    telegram_id: number,
    password: string,
  ): Promise<AdminUserDocument> {
    const uid = telegram_id.toString();
    const role = AdminRole.ADMIN;

    const existingAdmin = await this.findByUid(uid);
    if (existingAdmin) {
      throw new Error(
        'Bu Telegram ID allaqachon admin sifatida roʻyxatdan oʻtgan.',
      );
    }

    const createAdminUserDto: CreateAdminUserDto = {
      uid,
      password,
      role,
    };

    return this.createAdminUser(createAdminUserDto);
  }

  async updateAdminUser(
    uid: string,
    updateDto: UpdateAdminUserDto,
  ): Promise<AdminUserDocument | null> {
    const adminUser = await this.findByUid(uid);
    if (!adminUser) {
      return null;
    }

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    // Update uid if provided and different from current uid
    if (updateDto.uid && updateDto.uid !== adminUser.uid) {
      const existingUserWithNewUid = await this.findByUid(updateDto.uid);
      if (existingUserWithNewUid) {
        throw new Error('Yangi UID allaqachon mavjud.');
      }
      adminUser.uid = updateDto.uid;
    }

    // Apply other updates (like password if hashed above)
    Object.assign(adminUser, updateDto);

    return adminUser.save();
  }

  async login(
    uid: string,
    password: string,
  ): Promise<{ access_token: string; uid: string; role: AdminRole }> {
    const adminUser = await this.findByUid(uid);
    if (!adminUser) {
      throw new UnauthorizedException(
        'Notoʻgʻri foydalanuvchi nomi yoki parol',
      );
    }

    const isPasswordValid = await this.validatePassword(
      password,
      adminUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Notoʻgʻri foydalanuvchi nomi yoki parol',
      );
    }

    const payload = {
      uid: adminUser.uid,
      role: adminUser.role,
      sub: adminUser._id.toString(),
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token, uid: adminUser.uid, role: adminUser.role };
  }

  generateAccessToken(payload: { uid: string; role: AdminRole; sub: string }): string {
    return this.jwtService.sign(payload);
  }

  async findAllAdmins(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: AdminRole,
  ): Promise<{ admins: any[]; total: number }> {
    const query: any = {};
    if (role) {
      query.role = role;
    }

    const adminUsers = await this.adminUserModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.adminUserModel.countDocuments(query).exec();

    const populatedAdmins = await Promise.all(
      adminUsers.map(async (admin) => {
        const user = await this.userService.findOne(+admin.uid);
        return {
          ...admin.toObject(),
          full_name: user ? user.full_name : "Noma'lum",
          username: user ? user.username : "Noma'lum",
        };
      }),
    );

    let filteredAdmins = populatedAdmins;
    if (search) {
      filteredAdmins = populatedAdmins.filter(
        (admin) =>
          admin.full_name.toLowerCase().includes(search.toLowerCase()) ||
          admin.username.toLowerCase().includes(search.toLowerCase()) ||
          admin.uid.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return { admins: filteredAdmins, total };
  }

  async removeAdmin(uid: string): Promise<{ success: boolean; user?: any }> {
    const admin = await this.adminUserModel.findOneAndDelete({ uid }).exec();
    if (!admin) {
      return { success: false };
    }
    const user = await this.userService.findOne(+uid);
    return { success: true, user };
  }

  async updateAdminPassword(
    uid: string,
    newPassword: string,
  ): Promise<AdminUserDocument> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.adminUserModel
      .findOneAndUpdate({ uid }, { password: hashedPassword }, { new: true })
      .exec();
  }
}
