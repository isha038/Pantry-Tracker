// components/SignUp.js
import { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Paper, Link } from '@mui/material';
import { auth, firestore } from '../firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
   
    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user info in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        uid: user.uid,
      });

      console.log("User credential:", userCredential);
    console.log("Firestore doc path:", doc(firestore, "users", user.uid));
      console.log("User signed up:", user);

      router.push("/landingPage");
    } catch (error) {

        switch (error.code) {
            case "auth/email-already-in-use":
              alert("Email is already in use. Please sign in.");
              break;
            case "auth/invalid-email":
              alert("Invalid email address. Please check the email format.");
              break;
            case "auth/weak-password":
              alert("Password should be at least 6 characters.");
              break;
            default:
              console.error("Error during sign up:", error.message);
              alert("An error occurred. Please try again.");
          }
    }
    
    
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
      <Typography variant="body1" align="center" gutterBottom>
          Create an account to get started
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ padding: '10px' }}
          >
            Sign Up
          </Button>
          <Box mt={2}>
            <Typography align="center">
              <Link href="/signin" underline="hover">
                Already have an account? Sign In
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
