import React, { useState, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { Camera } from 'react-camera-pro';

const CameraComponent = ({ onTakePhoto }) => {
  const cameraRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  const handleStartCapture = () => {
    setCapturing(true);
  };

  const handleStopCapture = () => {
    setCapturing(false);
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        onTakePhoto(photo);
        handleStopCapture();
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', width: "100%", height: "100%", flexDirection: 'column', alignItems: 'center' }}>
      {capturing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Camera ref={cameraRef} onError={() => setCameraAvailable(false)} />
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
            <Button variant="contained" onClick={handleTakePhoto}>Take Photo</Button>
            <Button variant="outlined" onClick={handleStopCapture}>Stop Capture</Button>
          </Box>
        </Box>
      ) : (
        <Button variant="contained" onClick={handleStartCapture}>Start Camera</Button>
      )}
    </Box>
  );
};

export default CameraComponent;
