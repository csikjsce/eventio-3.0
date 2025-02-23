import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Snackbar from '../components/Snackbar';
import axios from 'axios';

interface ScanResult {
  rawValue: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  format: string;
  cornerPoints: { x: number; y: number }[];
}

const ScannerPage = () => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | null>(null);

  const handleScan = async (result: ScanResult[]) => {
    if (result.length > 0 && result[0].rawValue) {
      const scannedId = result[0].rawValue;
      setScannedValue(scannedId);

      try {
        const participantId = parseInt(scannedId, 10);
        const response = await axios.post(
          `${import.meta.env.VITE_APP_SERVER_ADDRESS}/api/v1/event/checkin`,
          {
            event_id: 47,
            participant_id: participantId,
          }
        );

        if (response.status === 200) {
          setSnackbarMessage(`Participant ID: ${scannedId} checked in successfully!`);
          setSnackbarType('success');
        } else {
          setSnackbarMessage('Failed to check in participant.');
          setSnackbarType('error');
        }
      } catch (error) {
        setSnackbarMessage('Error checking in participant.');
        setSnackbarType('error');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarMessage(null);
    setSnackbarType(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold">Check-In</h2>
      <div className="flex justify-center items-center w-[300px] h-[300px] border-2 border-red-500 relative">
        <Scanner
          onScan={handleScan}
          allowMultiple={true}
          scanDelay={3000}
          className="absolute inset-0"
        />
      </div>

      {snackbarMessage && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
};

export default ScannerPage;