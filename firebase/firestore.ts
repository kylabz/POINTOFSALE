// firebase/firestore.ts
import { db } from './Config';
import { collection, addDoc } from 'firebase/firestore';

export const addToCart = async (userId: string, item: any) => {
try {
    const docRef = await addDoc(collection(db, 'carts'), {
    userId: userId,
    item: item,
    createdAt: new Date()
    });
    console.log('Added to cart with ID: ', docRef.id);
} catch (e) {
    console.error('Error adding to cart: ', e);
}
};
