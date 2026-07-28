import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false }) => {
    const [hover, setHover] = useState(null);

    return (
        <div style={{ display: 'flex' }}>
            {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;

                return (
                    <label key={i}>
                        {!readOnly && (
                            <input
                                type="radio"
                                name="rating"
                                style={{ display: 'none' }}
                                value={ratingValue}
                                onClick={() => setRating(ratingValue)}
                            />
                        )}
                        <Star
                            style={{
                                cursor: readOnly ? 'default' : 'pointer',
                                transition: 'color 200ms',
                                fill: ratingValue <= (hover || rating) ? "#ffc107" : "none"
                            }}
                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                            size={25}
                            onMouseEnter={() => !readOnly && setHover(ratingValue)}
                            onMouseLeave={() => !readOnly && setHover(null)}
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
