import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';
import serviceAccount from '../firebase-service-account.json';

export const FirebaseProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    if (!admin.apps.length) {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });

    }
    return admin.app();
  },
};
