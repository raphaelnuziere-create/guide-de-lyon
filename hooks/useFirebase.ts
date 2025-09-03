import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  QueryConstraint,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firebaseDb, firebaseStorage, firebaseFunctions } from '@/lib/firebase-client';

// Hook pour l'authentification Firebase
export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  const logout = async () => {
    return signOut(firebaseAuth);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout
  };
}

// Hook pour les données temps réel Firestore
export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(firebaseDb, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = async (item: Omit<T, 'id'>) => {
    return addDoc(collection(firebaseDb, collectionName), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  };

  const update = async (id: string, updates: Partial<T>) => {
    return updateDoc(doc(firebaseDb, collectionName, id), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  };

  const remove = async (id: string) => {
    return deleteDoc(doc(firebaseDb, collectionName, id));
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove
  };
}

// Hook pour upload de fichiers
export function useFirebaseStorage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (
    file: File,
    path: string
  ): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(firebaseStorage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploading(false);
      setUploadProgress(100);
      
      return downloadURL;
    } catch (error) {
      setUploading(false);
      throw error;
    }
  };

  const deleteFile = async (path: string) => {
    const storageRef = ref(firebaseStorage, path);
    return deleteObject(storageRef);
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadProgress
  };
}

// Hook pour les Firebase Functions
export function useFirebaseFunction<T = any, R = any>(functionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = async (data: T): Promise<R> => {
    setLoading(true);
    setError(null);

    try {
      const fn = httpsCallable<T, R>(firebaseFunctions, functionName);
      const result = await fn(data);
      setLoading(false);
      return result.data;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  return {
    call,
    loading,
    error
  };
}

// Hook pour les événements temps réel
export function useRealtimeEvents(merchantId?: string) {
  const constraints: QueryConstraint[] = [];
  
  if (merchantId) {
    constraints.push(where('merchantId', '==', merchantId));
  }
  
  constraints.push(where('status', '==', 'published'));
  
  return useFirestoreCollection<Event>('events_live', constraints);
}

// Hook pour le chat temps réel
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(firebaseDb, 'chat_rooms', roomId, 'messages');
    const q = query(messagesRef, where('timestamp', '!=', null));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort by timestamp
      msgs.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return a.timestamp.seconds - b.timestamp.seconds;
      });
      
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = useFirebaseFunction<{ roomId: string; message: string }, { success: boolean }>('sendChatMessage');

  return {
    messages,
    loading,
    sendMessage: (message: string) => sendMessage.call({ roomId, message })
  };
}

// Types
interface Event {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  category: string;
  location: any;
  status: string;
  attendees: string[];
  viewsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}