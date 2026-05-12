import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App,
  ) {}

  async send(tokens: string[], title: string, message: string, data: any) {
    // return this.firebaseApp.messaging().sendEachForMulticast({
    //   notification: {
    //     title: title,
    //     body: message,
    //   },
    //   data: data,
    //   tokens: tokens,
    // });
  }
}
