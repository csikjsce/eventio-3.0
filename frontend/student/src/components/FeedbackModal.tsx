import { useState } from "react";
import { FaStar } from "react-icons/fa";

const FeedbackModal = () => {
    const [rating, setRating] = useState(0);

    const handleRating = (rate: number) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        console.log(`Rating selected: ${rating}`);
    };

    const fillColorArray = ['#FF0000', '#FF7F00', '#FFFF00', '#7FFF00', '#00FF00'];

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
                    className="bg-primary text-white font-semibold border-none rounded-full px-5 py-2 cursor-pointer w-3/5 flex flex-row items-center justify-center gap-2 h-12 active:bg-red-800"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default FeedbackModal;
