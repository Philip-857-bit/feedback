"use client"

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
    rating: number;
    onRatingChange: (rating: number) => void;
    totalStars?: number;
};

export function StarRating({ rating, onRatingChange, totalStars = 5 }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (index: number) => {
        // Allow un-selecting by clicking the same star again
        if (rating === index) {
            onRatingChange(0);
        } else {
            onRatingChange(index);
        }
    };

    return (
        <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
            {[...Array(totalStars)].map((_, i) => {
                const index = i + 1;
                return (
                    <Star
                        key={index}
                        role="button"
                        tabIndex={0}
                        aria-label={`Rate ${index} out of ${totalStars} stars`}
                        className={cn(
                            'h-8 w-8 cursor-pointer transition-all duration-150',
                            (hoverRating >= index || rating >= index) 
                                ? 'text-primary fill-primary scale-110' 
                                : 'text-muted-foreground/50'
                        )}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onClick={() => handleClick(index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClick(index);
                            }
                        }}
                    />
                );
            })}
        </div>
    );
}
