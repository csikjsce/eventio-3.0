"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { rateEvent } from "@/lib/api";

const FeedbackModal = ({
  event_id,
  setIsFeedbackPopupOpen,
}: {
  event_id: number;
  setIsFeedbackPopupOpen: (value: boolean) => void;
}) => {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (server && localStorage.getItem("accessToken")) {
        await rateEvent(event_id, rating);
      }
    } catch {
      // Ignore rating errors silently
    } finally {
      setSubmitting(false);
      setIsFeedbackPopupOpen(false);
    }
  };

  const fillColorArray = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#7FFF00",
    "#00FF00",
  ];

  const getStarColor = () => {
    return fillColorArray[rating - 1] || "#e4e5e9";
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
                style={{ display: "none" }}
                onClick={() => handleRating(ratingValue)}
              />
              <FaStar
                className="star"
                color={ratingValue <= rating ? getStarColor() : "#e4e5e9"}
                size={40}
              />
            </label>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          className="bg-primary text-white font-semibold border-none rounded-full px-5 py-2 cursor-pointer w-3/5 flex flex-row items-center justify-center gap-2 h-12 active:bg-red-800 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
