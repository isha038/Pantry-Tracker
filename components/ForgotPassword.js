// components/ForgotPassword.js
import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import { auth} from '../firebase'; // Adjust path as needed
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. You will be redirected in a few seconds. Please check your inbox.");
      
      setTimeout(() => {
        router.push("/signin");
      }, 7000); // Adjust the delay if needed
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Send Reset Email
          </Button>
          {message && (
            <Box mt={3}>
              <Alert severity={message.includes('Error') ? 'error' : 'success'}>
                {message}
              </Alert>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
}
