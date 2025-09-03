import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as admin from 'firebase-admin';

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = headers().get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Vérifier le token avec Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();

    const userData = userDoc.data();

    // Vérifier si c'est un merchant
    let merchantData = null;
    if (userData?.role === 'merchant') {
      const merchantDoc = await admin
        .firestore()
        .collection('merchant_settings')
        .doc(decodedToken.uid)
        .get();
      
      merchantData = merchantDoc.data();
    }

    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role: userData?.role || 'user',
      displayName: userData?.displayName,
      photoURL: userData?.photoURL,
      merchantData: merchantData
    });

  } catch (error: any) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Token invalide' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}