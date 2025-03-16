import { useState } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import Snackbar from '../components/Snackbar';
import axios from 'axios';

interface SnackbarData {
  message: string;
  type: 'success' | 'error';
}

const ScannerPage = () => {
  const [snackbarData, setSnackbarData] = useState<SnackbarData | null>(null);

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (result.length > 0 && result[0].rawValue) {
      const scannedId = result[0].rawValue;
      // setScannedValue(scannedId);

      try {
        const participantId = parseInt(scannedId, 10);
        const response = await axios.post(
          `${import.meta.env.VITE_APP_SERVER_ADDRESS}/api/v1/event/checkin`,
          {
            event_id: 47,
            participant_id: participantId,
          },
        );

        if (response.status === 200) {
          setSnackbarData({
            message: `Participant ID: ${scannedId} checked in successfully!`,
            type: 'success',
          });
        } else {
          setSnackbarData({
            message: `Failed to check in participant ID: ${scannedId}`,
            type: 'error',
          });
        }
      } catch (error) {
        setSnackbarData({
          message: `Error checking in participant ID: ${scannedId}`,
          type: 'error',
        });
        console.error(error);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarData(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold">Check-In</h2>
      <div className="flex justify-center items-center w-[300px] h-[300px] border-2 border-red-500 relative">
        <Scanner onScan={handleScan} allowMultiple={true} scanDelay={3000} />
      </div>

      {snackbarData && (
        <Snackbar
          message={snackbarData.message}
          type={snackbarData.type}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
};

export default ScannerPage;
