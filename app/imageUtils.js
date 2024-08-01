import axios from 'axios';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { firestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';



/**
 * Upload the image to Firebase Storage.
 * 
 * @param {string} dataUri - The image in data URI format.
 * @returns {Promise<string>} - The download URL of the uploaded image.
 */
export async function uploadImage(dataUri) {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    
    await uploadString(storageRef, dataUri, 'data_url');
    const imageUrl = await getDownloadURL(storageRef);

    console.log('Image uploaded successfully:', imageUrl);

    await addDoc(collection(firestore, 'uploadedImages'), {
      imageUrl,
      timestamp: new Date()
    });

    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

