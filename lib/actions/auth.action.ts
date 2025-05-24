'use server';
import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    //check if users already exists
    const userRecord = await db.collection('users').doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: 'User already exists. Please sign in instead.',
      };
    }

    // create new user--> add user to db
    await db.collection('users').doc(uid).set({
      name,
      email,
      // createdAt: new Date(),
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: 'Account created successfully. You casn sign in now!',
    };
  } catch (e) {
    console.error('Error creating a user', e);

    if (e.code === 'auth/email-already-ecxists') {
      return {
        success: false,
        message: 'Email already in use. Please use a different email.',
      };
    }
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: 'User does not exist. Create an account.',
      };
    }

    await setSessionCookie(idToken);
    return {
      success: true,
      message: 'Successfully signed in.',
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return {
      success: false,
      message: 'Failed to log into account. Please try again.',
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // 7 days
  });

  //set cookie in the browser

  cookieStore.set('session', sessionCookie, {
    maxAge: ONE_WEEK * 1000, // 7 days; Need to be equal to expiesIn
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
}
