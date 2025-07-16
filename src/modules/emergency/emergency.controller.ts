import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { EmergencyStatus, EmergencyType } from './schemas/emergency.schema';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  create(@Body() createEmergencyDto: CreateEmergencyDto) {
    return this.emergencyService.create(createEmergencyDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: EmergencyStatus,
    @Query('type') type?: EmergencyType,
  ) {
    return this.emergencyService.findAll(page, limit, search, status, type);
  }

  @Get('statistics')
  getStatistics() {
    return this.emergencyService.getStatistics();
  }

  @Patch(':group_message_id')
  updateEmergencyStatus(
    @Param('group_message_id') group_message_id: number,
    @Body('status') status: EmergencyStatus,
  ) {
    return this.emergencyService.updateEmergencyStatus(group_message_id, status);
  }

  @Patch('type/:group_message_id')
  updateEmergencyType(
    @Param('group_message_id') group_message_id: number,
    @Body('type') type: EmergencyType,
  ) {
    return this.emergencyService.updateEmergencyType(group_message_id, type);
  }
}
