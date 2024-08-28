"use client";


import { useEffect, useState, Suspense } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, filledInputClasses, CircularProgress } from "@mui/material";
// box similar to div
import CameraComponent from '../app/CameraComponent';
import { uploadImage,analyzeImageWithGptVisionAPI, generateRecipeWithPantryIngredients } from '../app/imageUtils';
import { useRouter } from 'next/router';
import { firestore,auth } from "@/firebase";
import { signOut } from 'firebase/auth';

import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc ,updateDoc} from "firebase/firestore";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display:'flex',
  flexDirection: 'column',

  gap:3,
};



function useErrorBoundary() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return hasError;
}

const ErrorBoundary = ({ children }) => {
  const hasError = useErrorBoundary();

  if (hasError) {
    return <h1>Something went wrong.</h1>;
  }

  return children;
};




export default function Home() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNoResults, setOpenNoResults] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  
  const [itemName, setItemName] = useState('');
  const [search, setSearch] = useState('');
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [classificationResult, setClassificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState(null);
  const [openRecipe, setOpenRecipe] = useState(false)

  const handleOpenRecipe = () => setOpenRecipe(true);
  const handleCloseRecipe = () => setOpenRecipe(false);
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);
  const handleCloseNoResults = () => setOpenNoResults(false);
  const handleOpenCamera = () => setOpenCamera(true);
  const handleCloseCamera = () => setOpenCamera(false);

  const router = useRouter();

  


  const handleTakePhoto = async (dataUri) => {
    setClassificationResult(null);
    setErrorMessage(null);
  
    try {
      // Close the camera interface
      handleCloseCamera();
  
      // Upload the image and get the download URL
      const imageUrl = await uploadImage(dataUri);
      console.log(imageUrl)
  
      if (imageUrl) {
        // Analyze the image using GPT Vision API
        const classificationData = await analyzeImageWithGptVisionAPI(imageUrl);
  
        // Log the full response to verify structure
        console.log('Full Classification Data:', classificationData);
  
        if (Array.isArray(classificationData) && classificationData.length > 0) {
          // Map the classification data to extract relevant details
          const items = classificationData.map(item => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit
          }));
  
          // Store the result in state to display it later
          setClassificationResult(items);
  
          // Example of handling additional operations
          if (items.length > 0) {
            // Assuming you want to add the first item to the pantry
            const itemName = items[0].name;
            await addItem(itemName);
            await updatePantry();
          }
        } else {
          setErrorMessage('No items recognized in the image.');
        }
      } else {
        console.error('Image upload failed.');
        setErrorMessage('Failed to upload the image.');
      }
    } catch (error) {
      console.error('Error processing photo:', error);
      setErrorMessage('Failed to analyze the image. Please try again.');
    }
  };
  
  
  const updatePantry = async () =>
    {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      
      pantryList.push({name: doc.id, ...doc.data(),})

    });
    setPantry(pantryList)
    setFilteredPantry(pantryList);
  }

  

  useEffect(()=>{
    updatePantry()
  }, [])


  const addItem = async (item) => {
    
    const docRef = doc(collection(firestore, 'pantry'),item)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      // If the document already exists, you might want to update the count instead of setting it to 1
      await setDoc(docRef, { count: count + 1 });
    } else {
      // If the document doesn't exist, create it with count: 1
      await setDoc(docRef, { count: 1 });
    }

    updatePantry();
  }

  const removeItem = async (item) =>{
    const docRef = doc(collection(firestore,'pantry'),item)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()){
      const {count} = docSnap.data()
      if (count === 1){
        await deleteDoc(docRef)


      }
      else{
        await setDoc(docRef, {count: count-1})
      }
    }
    
    updatePantry()
      
    
  }

  const handleSearch = () => {
    if (search.trim() === '') {
      // If search input is empty, show all items
      setFilteredPantry(pantry);
    } else {
      // Filter pantry items based on search input
      const filtered = pantry.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      
      if (filtered.length === 0) {
        setOpenNoResults(true); // Open No Results Modal if no items found
      } else {
        setFilteredPantry(filtered);
      }


    }
    setSearch('')
    handleCloseSearch(); // Close the modal after search
  };
  const handleGenerateRecipe = async () => {
    setIsLoading(true);
    setRecipe(null);
    setError(null);
    try {
      // Generate the recipe using pantry items
      const generatedRecipe = await generateRecipeWithPantryIngredients(filteredPantry);
      setRecipe(generatedRecipe);
      
      setError(''); // Clear any previous errors
      setOpenRecipe(true); // Ensure the modal opens
    } catch (error) 
    {
      console.error('Error generating recipe:', error);
      setError('Failed to generate recipe. Please try again.');
    }
    finally {
      setIsLoading(false); // End loading
    }
      
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
      router.push('/signin'); // Redirect to sign-in page after sign-out
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap ={2}
    >
      
      <Stack width="100%" direction={'row'} spacing={2} justifyContent={"center"} alignItems={"center"}>
        <Button variant="contained" onClick={handleOpenAdd}>Add</Button>
        <Button variant="contained" onClick={handleOpenSearch}>Search</Button>
        <Button variant="contained" onClick={handleOpenCamera}>Take Photo</Button>
        <Button variant="contained" onClick={handleGenerateRecipe}>
        Generate Recipe
      </Button>
      <Button
          variant="contained"
          color="secondary"
          onClick={handleSignOut}
          sx={{ mt: 4 }}
        >
          Sign Out
        </Button>
      </Stack>

      {isLoading && (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
)}
      
      <Modal
        open={openRecipe}
        onClose={handleCloseRecipe}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <Box
          sx={{
            width: '80%',
            maxWidth: '800px',
            height: '80%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',

          }}
        >
          <Typography id="recipe-modal-title" variant="h6" component="h2" gutterBottom>
            Generated Recipe
          </Typography>
          <Box
            id="recipe-modal-description"
            sx={{
              whiteSpace: 'pre-line', // Preserve line breaks
              overflowWrap: 'break-word', // Ensure long lines wrap
              maxHeight: '70vh', // Limit height for scrolling
              overflowY: 'auto', // Add scroll if content overflows
              width: '100%',
              
            }}
          >
            <Typography variant="body1">{recipe}</Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={handleCloseRecipe} sx={{ marginTop: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>


      <Modal open={openCamera} onClose={handleCloseCamera}>
        <Box sx={{width: '90%', height:"100%" }}>
          <CameraComponent onTakePhoto={handleTakePhoto} />
        </Box>
      </Modal>
      {classificationResult && (
        <Box sx={{ marginTop: 2 }}>
          <h2>Classification Result:</h2>
          <ul>
            {classificationResult.map((item, index) => (
              <li key={index}>
                {item.name} 
              </li>
            ))}
          </ul>
         
        </Box>
      )}

      {/* Display error message if any */}
      {errorMessage && (
        <Box sx={{ marginTop: 2, color: 'red' }}>
          <p>{errorMessage}</p>
        </Box>
      )}
    

     

      

      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <Button variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleCloseAdd();
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openSearch}
        onClose={handleCloseSearch}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Search Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="search-field"
              label="Search Items"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openNoResults}
        onClose={handleCloseNoResults}
        aria-labelledby="no-results-modal-title"
        aria-describedby="no-results-modal-description"
      >
        <Box sx={{...style, textAlign:'center'}}>
          <Typography id="no-results-modal-title" variant="h6" component="h2" justifyContent= {'center'} >
            No Such Item Found
          </Typography>
          <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={2}
    >
      <Button 
        variant="contained" 
        onClick={handleCloseNoResults}
        sx={{ minWidth: 'auto'}}
      >
        Close
      </Button>
      </Box>
        </Box>
      </Modal>

      {/* //viewport width and height */}
      <Box border ={'1px solid #333'} >
      <Box width="800px" height="100px" display={"flex"} justifyContent={"center"} alignItems={"center"} bgcolor={"#ADD8E6"}>
        <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="500px" spacing={2} overflow={"auto"}>
        {filteredPantry.map(({name, count}) => (
           
        
          <Box
            key={name}
            width = '100%'
            minHeight="150px"
            display={"flex"}

            justifyContent={"space-between"}
            alignItems={"center"}
            bgcolor={"#f0f0f0"}
            paddingX = {5}
          >
            <Typography variant={"h3"} color={"#333"} textAlign={"left"}>
            {typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'}
            </Typography>
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              {count}
            </Typography>
            <Stack direction={'row'} spacing = {2}>
              <Button
              variant = "contained"
              onClick = {
                () => addItem(name)
              }
              >
                Add
              </Button>
            <Button variant='contained' onClick ={
            () => removeItem(name)
          }>
            Remove
            
          </Button>
          </Stack>
          </Box>
        ))
        }

        
      </Stack> 
      </Box>
    </Box>
    </Suspense>
    </ErrorBoundary>
  );
  
}
