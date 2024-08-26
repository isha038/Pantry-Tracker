// components/SignIn.js
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link as MuiLink } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, firestore } from '../firebase'; // Adjust path as needed
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUserSignIn = useCallback(async (user) => {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          createdAt: new Date(),
          uid: user.uid,
        });
      }
      router.push('/landingPage');
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleUserSignIn(user);
      }
    });

    return () => unsubscribe();
  }, [handleUserSignIn]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        router.push('/landingPage');
      } 
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        alert('Invalid password. Please try again.');
      } else {
        console.error('Error during sign in:', error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await handleUserSignIn(user);
      }
    } catch (error) {
      console.error('Error during Google sign in:', error);
    }
  };

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (isMobile) {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            const user = result.user;
            await handleUserSignIn(user);
          }
        } catch (error) {
          console.error('Error handling redirect result:', error);
        }
      }
    };

    handleAuthRedirect();
  }, [isMobile, handleUserSignIn]);

  return (
    <Container component="main" maxWidth="md" sx={{ display: 'flex', height: '100vh' }}>
      <Box
        sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Paper elevation={3} sx={{ padding: 4, maxWidth: '400px', width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign In
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box mb={3}>
              <TextField
                fullWidth
                label="Email Address"
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
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 2 }}
            >
              Sign In with Google
            </Button>
            <Box mt={2} sx={{ textAlign: 'center' }}>
              <MuiLink href="/forgot-password" underline="hover" sx={{ display: 'block', mb: 1 }}>
                Forgot password?
              </MuiLink>
              <MuiLink href="/signup" underline="hover">
                Create Account
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
