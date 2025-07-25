import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Emergency,
  EmergencyDocument,
  EmergencyStatus,
  EmergencyType,
} from './schemas/emergency.schema';
import { CreateEmergencyDto } from './dto/create-emergency.dto';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectModel(Emergency.name)
    private emergencyModel: Model<EmergencyDocument>,
  ) {}

  async create(
    createEmergencyDto: CreateEmergencyDto,
  ): Promise<EmergencyDocument> {
    const createdEmergency = new this.emergencyModel(createEmergencyDto);
    return createdEmergency.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: EmergencyStatus,
    type?: EmergencyType,
  ): Promise<{ data: EmergencyDocument[]; total: number }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      const users = await this.emergencyModel.db
        .collection('users')
        .find({
          $or: [
            { full_name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { telegram_id: isNaN(Number(search)) ? undefined : Number(search) },
          ].filter(Boolean),
        })
        .toArray();

      const userIds = users.map((user) => user._id);

      query.$or = [
        { user: { $in: userIds } },
        { message_content: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.emergencyModel
        .find(query)
        .populate('user')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.emergencyModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async getStatistics(): Promise<any> {
    const totalEmergencies = await this.emergencyModel.countDocuments().exec();
    const confirmedEmergencies = await this.emergencyModel
      .countDocuments({ status: EmergencyStatus.CONFIRMED })
      .exec();
    const canceledEmergencies = await this.emergencyModel
      .countDocuments({ status: EmergencyStatus.CANCELED })
      .exec();
    const pendingEmergencies = await this.emergencyModel
      .countDocuments({ status: EmergencyStatus.PENDING })
      .exec();

    return {
      totalEmergencies,
      confirmedEmergencies,
      canceledEmergencies,
      pendingEmergencies,
    };
  }

  async findPendingEmergencyByUserId(
    userId: Types.ObjectId,
  ): Promise<EmergencyDocument | null> {
    return this.emergencyModel
      .findOne({ user: userId, status: EmergencyStatus.PENDING })
      .exec();
  }

  async updateEmergencyStatus(
    id: number,
    status: EmergencyStatus,
  ): Promise<EmergencyDocument | null> {
    return this.emergencyModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('user')
      .exec();
  }

  async updateEmergencyType(
    id: number,
    type: EmergencyType,
  ): Promise<EmergencyDocument | null> {
    console.log(id, type);

    return this.emergencyModel
      .findByIdAndUpdate(id, { type }, { new: true })
      .exec();
  }
}
