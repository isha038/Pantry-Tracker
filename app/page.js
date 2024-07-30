"use client";


import { useEffect, useState } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, filledInputClasses } from "@mui/material";
// box similar to div
import { firestore } from "@/firebase";
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



export default function Home() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNoResults, setOpenNoResults] = useState(false);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);

  const handleCloseNoResults = () => setOpenNoResults(false);
  

  const [pantry, setPantry] = useState([])
  const [itemName, setItemName] = useState('')
  const [search, setSearch] = useState('')
  const [filteredPantry, setFilteredPantry] = useState([]);

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
  return (
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
      </Stack>

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
            <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
            {typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'}
            </Typography>
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              Quantity: {count}
            </Typography>
            <Button variant='contained' onClick ={
            () => removeItem(name)
          }>
            Remove
            
          </Button>
          </Box>
        ))
        }

        
      </Stack> 
      </Box>
    </Box>
  );
}