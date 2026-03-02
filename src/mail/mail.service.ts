import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInviteMail() {
    await this.mailerService.sendMail({
      to: 'abdulkadirshehu53.sa@gmail.com',
      subject: 'Welcome to Our App! Confirm your Email',
    });
  }
}
