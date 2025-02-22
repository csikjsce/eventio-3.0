const CheckInModal = ({
  scannedValue,
  onClose,
  onCheckIn,
}: {
  scannedValue: string | null;
  onClose: () => void;
  onCheckIn: () => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[rgb(52,52,52)] p-6 rounded-lg w-80 shadow-lg">
      <h2 className="text-white text-xl font-semibold text-center mb-4">
        Check-In
      </h2>
        <p className="text-red-400 text-center mb-4">
          Scanned Code: {scannedValue}
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="bg-green-500 text-white py-2 rounded-md w-full"
            onClick={onCheckIn}
          >
            Check-In
          </button>
          <button
            className="bg-red-500 text-white py-2 rounded-md w-full"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
