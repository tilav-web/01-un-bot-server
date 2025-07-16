import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  async findAll(search?: string, status?: string): Promise<GroupDocument[]> {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { group: isNaN(Number(search)) ? undefined : Number(search) },
        { telegram_id: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean); // Remove undefined entries
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    return this.groupModel.find(query).exec();
  }

  async findOne(group_id: number): Promise<GroupDocument> {
    return this.groupModel.findOne({ group: group_id }).exec();
  }

  async findByIds(ids: string[]): Promise<GroupDocument[]> {
    return this.groupModel.find({ _id: { $in: ids } }).exec();
  }

  async update(
    group_id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDocument> {
    return this.groupModel
      .findOneAndUpdate({ group: group_id }, updateGroupDto, { new: true })
      .exec();
  }

  async remove(group_id: number): Promise<any> {
    return this.groupModel.findOneAndDelete({ group: group_id }).exec();
  }
}
