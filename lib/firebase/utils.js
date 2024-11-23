import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Fetch a document from Firestore using its path.
 *
 * @param {string} path - The full Firestore path to the document.
 * @returns {Promise<Object>} - The document's data.
 */
export const getDocFromFirestore = async (path) => {
  try {
    // Create a Firestore document reference
    const docRef = doc(db, path);

    // Fetch the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data(); // Return the document's data
    } else {
      console.error('Document does not exist at path:', path);
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};
