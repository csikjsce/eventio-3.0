import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import CheckInModal from '../components/CheckInModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const handleScan = (result: ScanResult[]) => {
    if (result.length > 0 && result[0].rawValue) {
      setScannedValue(result[0].rawValue);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScannedValue(null);
  };

  const handleCheckIn = () => {
    console.log(`Participant ID: ${scannedValue} checked in!`);
    setIsModalOpen(false);
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

      {isModalOpen && (
        <CheckInModal
          scannedValue={scannedValue}
          onClose={handleCloseModal}
          onCheckIn={handleCheckIn}
        />
      )}
    </div>
  );
};

export default ScannerPage;
