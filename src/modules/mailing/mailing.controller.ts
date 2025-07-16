import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MailingService } from './mailing.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('mailing')
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post('send-message')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // 'files' is the field name, 10 is maxCount
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async sendMessage(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const sendMessageDto: SendMessageDto = {
      userIds: JSON.parse(body.userIds),
      text: body.text,
    };
    return this.mailingService.sendMessage(sendMessageDto, files);
  }

  @Post('group')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async sendGroupMessage(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const sendGroupMessageDto: SendGroupMessageDto = {
      groupIds: JSON.parse(body.groupIds),
      text: body.message,
    };
    return this.mailingService.sendGroupMessage(sendGroupMessageDto, files);
  }
}
