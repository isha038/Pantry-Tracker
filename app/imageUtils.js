
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { firestore,auth } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';



/**
 * Upload the image to Firebase Storage.
 * 
 * @param {string} dataUri - The image in data URI format.
 * @returns {Promise<string>} - The download URL of the uploaded image.
 */
export async function uploadImage(dataUri) {

  const user = auth.currentUser;

  if (!user) {
    console.error('User is not authenticated.');
    return null;
  }

  const userId = user.uid;

  try {


    const storage = getStorage();
    const storageRef = ref(storage, `users/${userId}/images/${Date.now()}.jpg`);
    
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

export async function analyzeImageWithGptVisionAPI(imageUrl) {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
  
    if (data.length === 0) {
      alert("No items recognized in the image.");
    }
    return data;
  } catch (error) {
    console.error("Error creating completion:", error);
    throw error;
  }
}
export async function generateRecipeWithPantryIngredients(pantryItems) {
  try {
    
    

    // Call OpenAI API for recipe generation
    const response = await fetch('/api/recipe-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pantryItems),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();

    

    // Assuming the response contains a choice with the recipe text
    return data.text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}


