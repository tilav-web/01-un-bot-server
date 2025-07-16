import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument, UserStatus } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, status?: UserStatus): Promise<{ users: UserDocument[]; total: number }> {
    const query: any = {};
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const users = await this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments(query).exec();
    return { users, total };
  }

  async findOne(telegram_id: number): Promise<UserDocument> {
    return this.userModel.findOne({ telegram_id }).exec();
  }

  async update(telegram_id: number, updateData: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate({ telegram_id }, updateData, { new: true }).exec();
  }

  async isUserBlocked(telegram_id: number): Promise<boolean> {
    const user = await this.findOne(telegram_id);
    return user && user.status === UserStatus.BLOCK;
  }

  async findAllActiveUsers(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.ACTIVE }).exec();
  }

  async findActiveUsersByIds(ids: string[]): Promise<UserDocument[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return this.userModel.find({ _id: { $in: objectIds }, status: UserStatus.ACTIVE }).exec();
  }
}
