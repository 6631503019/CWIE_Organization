const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/^['"]/, '')
    .replace(/[',\\]+$/, '')
    .replace(/\\n/g, '\n')
    .trim();

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase Admin environment variables are missing');
}

const firebaseApp = getApps().length === 0
    ? initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey
        })
    })
    : getApps()[0];

module.exports = getAuth(firebaseApp);