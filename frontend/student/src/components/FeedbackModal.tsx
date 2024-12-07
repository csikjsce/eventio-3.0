import { useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const FeedbackModal = ({
  event_id,
  setIsFeedbackPopupOpen,
}: {
  event_id: number;
  setIsFeedbackPopupOpen: (value: boolean) => void;
}) => {
  const [rating, setRating] = useState(0);

  const handleRating = async (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async () => {
    console.log(`Rating selected: ${rating}`);
    setIsFeedbackPopupOpen(false);
    const response = await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + '/event/p/rate',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
      data: {
        rating: rating,
        event_id: event_id,
      },
    });

    console.log(response);
  };

  const fillColorArray = [
    '#FF0000',
    '#FF7F00',
    '#FFFF00',
    '#7FFF00',
    '#00FF00',
  ];

  const getStarColor = () => {
    return fillColorArray[rating - 1] || '#e4e5e9';
  };

  return (
    <div className="bg-card p-8 rounded-lg font-sans">
      <h2 className="text-foreground text-xl font-semibold mb-4 text-center">
        Give us your feedback
      </h2>
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_star, i) => {
          const ratingValue = i + 1;
          return (
            <label key={i}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                style={{ display: 'none' }}
                onClick={() => handleRating(ratingValue)}
              />
              <FaStar
                className="star"
                color={ratingValue <= rating ? getStarColor() : '#e4e5e9'}
                size={40}
              />
            </label>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          className="bg-primary text-white font-semibold border-none rounded-full px-5 py-2 cursor-pointer w-3/5 flex flex-row items-center justify-center gap-2 h-12 active:bg-red-800"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
