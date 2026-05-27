import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { PlayerState, Quest } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;
let isConfigured = false;

// Attempt to load configuration from API
export async function initializeFirebaseClient(): Promise<boolean> {
  if (isConfigured) return true;

  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      console.warn("⚠️ Firebase credentials not found (TOS / setup pending). Standalone mode active.");
      return false;
    }
    const config = await response.json();
    
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isConfigured = true;

    // Validate connection per strict constraint in skill
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration or network status.");
      }
    }

    console.log("🔥 Firebase Client successfully initialized!");
    return true;
  } catch (err) {
    console.warn("⚠️ Standalone mode: Connection to Firebase deferred (or Terms of Service pending).");
    return false;
  }
}

// Global helper for logging/throwing Firestore security rules error
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Object: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Login Pop-up
export async function loginWithGoogle(): Promise<User | null> {
  await initializeFirebaseClient();
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error("Cloud service database is still completing setup. Please accept terms first!");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error("Popup Sign-in cancelled or failed:", err.message);
    throw err;
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// Listen to Auth State
export function setupAuthListener(callback: (user: User | null) => void) {
  // Try initializing first
  initializeFirebaseClient().then(() => {
    if (auth) {
      onAuthStateChanged(auth, callback);
    } else {
      callback(null);
    }
  });
}

// Check database connection capability
export function isFirebaseReady(): boolean {
  return isConfigured && db !== null && auth !== null;
}

// Save User Profile & Quests to cloud
export async function savePlayerStateToCloud(
  uid: string, 
  playerState: PlayerState, 
  quests: Quest[]
): Promise<void> {
  if (!isFirebaseReady()) return;

  const pathStr = `users/${uid}`;
  try {
    // We store quests compiled inside questsJson to keep reads atomic and minimize document count
    const payload = {
      level: playerState.level,
      xp: playerState.xp,
      tokens: playerState.tokens,
      xpToNextLevel: playerState.xpToNextLevel,
      bossHp: playerState.bossHp,
      xpFreeze: playerState.xpFreeze,
      tokensSpent: playerState.tokensSpent,
      perfectDaysCount: playerState.perfectDaysCount,
      bestStreak: playerState.bestStreak,
      equippedCosmetics: playerState.equippedCosmetics,
      purchasedItemIds: playerState.purchasedItemIds,
      lastCheckedDate: playerState.lastCheckedDate || '',
      stretchingCount: playerState.stretchingCount,
      mealsCount: playerState.mealsCount,
      swimCount: playerState.swimCount,
      stretchingHistory: playerState.stretchingHistory,
      mealsHistory: playerState.mealsHistory,
      swimHistory: playerState.swimHistory,
      multiplier: playerState.multiplier,
      consecutiveDays: playerState.consecutiveDays,
      questsJson: JSON.stringify(quests)
    };

    await setDoc(doc(db, 'users', uid), payload);
    console.log("☁️ Successfully persisted statistics to the Cloud Database!");
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

// Fetch user profile & quests from cloud
export async function loadPlayerStateFromCloud(uid: string): Promise<{
  playerState: PlayerState;
  quests: Quest[];
} | null> {
  if (!isFirebaseReady()) return null;

  const pathStr = `users/${uid}`;
  try {
    const documentRef = doc(db, 'users', uid);
    const docSnap = await getDoc(documentRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const loadedPlayer: PlayerState = {
        level: data.level ?? 1,
        xp: data.xp ?? 0,
        tokens: data.tokens ?? 80,
        xpToNextLevel: data.xpToNextLevel ?? 100,
        bossHp: data.bossHp ?? 100,
        xpFreeze: data.xpFreeze ?? false,
        tokensSpent: data.tokensSpent ?? 0,
        perfectDaysCount: data.perfectDaysCount ?? 0,
        bestStreak: data.bestStreak ?? 1,
        equippedCosmetics: data.equippedCosmetics ?? [],
        purchasedItemIds: data.purchasedItemIds ?? [],
        lastCheckedDate: data.lastCheckedDate ?? '',
        stretchingCount: data.stretchingCount ?? 0,
        mealsCount: data.mealsCount ?? 0,
        swimCount: data.swimCount ?? 0,
        stretchingHistory: data.stretchingHistory ?? [0,0,0,0,0,0,0],
        mealsHistory: data.mealsHistory ?? [0,0,0,0,0,0,0],
        swimHistory: data.swimHistory ?? [0,0,0,0,0,0,0],
        multiplier: data.multiplier ?? 1.0,
        consecutiveDays: data.consecutiveDays ?? 0
      };

      let loadedQuests: Quest[] = [];
      if (data.questsJson) {
        try {
          loadedQuests = JSON.parse(data.questsJson);
        } catch (e) {
          console.warn("Could not load quests JSON - falling back to defaults");
        }
      }

      return {
        playerState: loadedPlayer,
        quests: loadedQuests.length > 0 ? loadedQuests : []
      };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, pathStr);
    return null;
  }
}
