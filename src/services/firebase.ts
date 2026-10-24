import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Workspace Calendar Scope configured via set_up_oauth
export const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string | null;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Sanitize strings to adhere strictly to firebase-blueprint.json maxLength
function sanitizeString(val: string, minLen: number, maxLen: number, fallback: string): string {
  const trimmed = (val || '').trim();
  if (trimmed.length < minLen) return fallback;
  return trimmed.slice(0, maxLen);
}

export async function syncUserProgressToCloud(params: {
  user: User;
  targetExamDate: string;
  weeklyTargetHours: number;
  weeklyCompletedHours: number;
  streakDays: number;
  xpPoints: number;
  completedTopicsCount: number;
  strictLockEnabled: boolean;
  syllabusPercent: number;
  targetTier: string;
}) {
  const {
    user,
    targetExamDate,
    weeklyTargetHours,
    weeklyCompletedHours,
    streakDays,
    xpPoints,
    completedTopicsCount,
    strictLockEnabled,
    syllabusPercent,
    targetTier,
  } = params;

  const uid = user.uid;
  const displayName = sanitizeString(user.displayName || 'SSC CGL Aspirant', 1, 80, 'SSC CGL Aspirant');
  const safeExamDate = sanitizeString(targetExamDate, 4, 32, '2026-12-15');
  const safeTier = sanitizeString(targetTier, 1, 40, 'Inspector (Income Tax / MEA)');

  const progressPath = `user_progress/${uid}`;
  try {
    await setDoc(doc(db, 'user_progress', uid), {
      uid,
      displayName,
      targetExamDate: safeExamDate,
      weeklyTargetHours: Math.min(120, Math.max(1, Number(weeklyTargetHours) || 35)),
      weeklyCompletedHours: Math.min(168, Math.max(0, Number(weeklyCompletedHours) || 0)),
      streakDays: Math.min(3650, Math.max(0, Math.round(streakDays))),
      xpPoints: Math.min(10000000, Math.max(0, Math.round(xpPoints))),
      completedTopicsCount: Math.min(500, Math.max(0, Math.round(completedTopicsCount))),
      strictLockEnabled: Boolean(strictLockEnabled),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, progressPath);
  }

  const leaderboardPath = `leaderboard/${uid}`;
  try {
    await setDoc(doc(db, 'leaderboard', uid), {
      uid,
      displayName,
      xpPoints: Math.min(10000000, Math.max(0, Math.round(xpPoints))),
      streakDays: Math.min(3650, Math.max(0, Math.round(streakDays))),
      weeklyHours: Math.min(168, Math.max(0, Number(weeklyCompletedHours) || 0)),
      syllabusPercent: Math.min(100, Math.max(0, Math.round(syllabusPercent))),
      targetTier: safeTier,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, leaderboardPath);
  }
}

export async function createStudyGroupPost(params: {
  user: User;
  groupTag: string;
  title: string;
  body: string;
}) {
  const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `forum_posts/${postId}`;
  const authorName = sanitizeString(params.user.displayName || 'Aspirant', 1, 80, 'Aspirant');
  const groupTag = sanitizeString(params.groupTag, 1, 50, 'Quant & Geometry');
  const title = sanitizeString(params.title, 3, 160, 'SSC CGL Strategy Discussion');
  const body = sanitizeString(params.body, 3, 2000, 'Sharing preparation notes.');

  try {
    await setDoc(doc(db, 'forum_posts', postId), {
      authorUid: params.user.uid,
      authorName,
      groupTag,
      title,
      body,
      upvotes: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function upvoteStudyGroupPost(postId: string, currentUpvotes: number) {
  const path = `forum_posts/${postId}`;
  try {
    await updateDoc(doc(db, 'forum_posts', postId), {
      upvotes: currentUpvotes + 1,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export { collection, query, orderBy, limit, onSnapshot, getDocs, doc };
