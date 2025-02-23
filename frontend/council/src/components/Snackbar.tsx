import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Snackbar = ({
    message,
    type,
    onClose,
}: {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg flex items-center space-x-2 transition-transform duration-300 ${
                type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
        >
            {type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
            <span>{message}</span>
            <button className="ml-4" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default Snackbar;