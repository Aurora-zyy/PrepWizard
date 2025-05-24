'use server';

import { db } from '@/firebase/admin';
import type { Interview, GetLatestInterviewsParams } from '@/types';

/**
 * Get interviews created by a specific user
 * @param userId The ID of the user
 * @returns An array of interviews
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  if (!userId) {
    return [];
  }

  try {
    const interviews = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (interviews.empty) {
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error('Error fetching interviews by user ID:', error);
    return [];
  }
}

/**
 * Get latest interviews available for a user
 * @param params Object containing userId and optional limit
 * @returns An array of interviews
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[]> {
  const { userId, limit = 10 } = params;

  if (!userId) {
    return [];
  }

  try {
    // Get all available interviews that are not created by this user
    const interviews = await db
      .collection('interviews')
      .where('userId', '!=', userId)
      .orderBy('userId')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    if (interviews.empty) {
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error('Error fetching latest interviews:', error);
    return [];
  }
}
