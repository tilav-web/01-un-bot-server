import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Emergency, EmergencySchema } from './schemas/emergency.schema';
import { UserModule } from '../user/user.module';
import { EmergencyController } from './emergency.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Emergency.name, schema: EmergencySchema },
    ]),
    UserModule,
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}
