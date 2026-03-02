import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { ReadingVocab } from '../types';

// Firebase configuration - replace with your own config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION_NAME = 'reading_vocabulary';

/**
 * Thêm từ vựng vào Firestore
 */
export async function addVocabulary(vocab: ReadingVocab): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        term: vocab.term,
        meaning: vocab.meaning,
        relatedStructure: vocab.relatedStructure,
        explanation: vocab.explanation,
        examples: vocab.examples,
        source: vocab.source || '',
        tags: vocab.tags || [],
        createdAt: Date.now(),
    });
    return docRef.id;
}

/**
 * Thêm nhiều từ vựng cùng lúc
 */
export async function addMultipleVocabulary(vocabs: ReadingVocab[]): Promise<string[]> {
    const ids: string[] = [];
    for (const vocab of vocabs) {
        const id = await addVocabulary(vocab);
        ids.push(id);
    }
    return ids;
}

/**
 * Lấy tất cả từ vựng
 */
export async function getAllVocabulary(): Promise<ReadingVocab[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as ReadingVocab[];
}

/**
 * Xóa từ vựng theo ID
 */
export async function deleteVocabulary(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export { db };
