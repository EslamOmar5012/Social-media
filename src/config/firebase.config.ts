import admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'src', 'social-media-app-41d4a-firebase-adminsdk-fbsvc-3b74f461ca.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export default admin;
