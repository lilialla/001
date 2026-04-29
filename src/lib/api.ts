import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  timezone: string;
}

export interface Space {
  id: string;
  members: string[];
  createdAt: number;
}

export interface Event {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  userId: string;
  color: string;
}

// User Profile API
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const d = await getDoc(doc(db, path));
    if (d.exists()) return d.data() as UserProfile;
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfile(userId: string, profile: UserProfile) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, path), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Space API
export async function getSpacesForUser(userId: string): Promise<Space[]> {
  const path = `spaces`;
  try {
    const q = query(collection(db, path), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToUserSpaces(userId: string, cb: (spaces: Space[]) => void) {
  const path = `spaces`;
  try {
    const q = query(collection(db, path), where('members', 'array-contains', userId));
    return onSnapshot(q, (snapshot) => {
      const spaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
      cb(spaces);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function createSpace(members: string[]): Promise<string> {
  const path = `spaces`;
  try {
    const spaceRef = doc(collection(db, path));
    await setDoc(spaceRef, { members, createdAt: Date.now() });
    return spaceRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function joinSpace(spaceId: string, userId: string) {
  const path = `spaces/${spaceId}`;
  try {
    const d = await getDoc(doc(db, path));
    if (!d.exists()) throw new Error("Space not found");
    const space = d.data() as Space;
    if (!space.members.includes(userId) && space.members.length < 2) {
      await updateDoc(doc(db, path), { members: [...space.members, userId] });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Events API
export function subscribeToEvents(spaceId: string, cb: (events: Event[]) => void) {
  const path = `spaces/${spaceId}/events`;
  try {
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      const events: Event[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      cb(events);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addEvent(spaceId: string, event: Omit<Event, 'id'>) {
  const path = `spaces/${spaceId}/events`;
  try {
    const eventRef = doc(collection(db, path));
    await setDoc(eventRef, event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEvent(spaceId: string, eventId: string, data: Partial<Event>) {
  const path = `spaces/${spaceId}/events/${eventId}`;
  try {
    await updateDoc(doc(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEvent(spaceId: string, eventId: string) {
  const path = `spaces/${spaceId}/events/${eventId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
