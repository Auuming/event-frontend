'use client'

import Image from "next/image";
import InteractiveCard from "./InteractiveCard";
import { Rating } from "@mui/material";
import { useState } from "react";

export default function Card({eventName, imgSrc, description, eventDate, availableTicket, onCompare}:{
  eventName:string, 
  imgSrc:string, 
  description?:string,
  eventDate?:string,
  availableTicket?:number,
  onCompare?:Function
}) {
  const [rating, setRating] = useState<number | null>(0);
  const [imgError, setImgError] = useState(false);
  
  // Validate imgSrc - must be a string and a valid URL/path
  const isValidImageSrc = (src: string): boolean => {
    if (!src || typeof src !== 'string') return false;
    const trimmed = src.trim();
    if (trimmed === '') return false;
    // Must start with / for relative paths, or http:// or https:// for absolute URLs
    return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
  };
  
  // Use fallback image if imgSrc is invalid
  const validImgSrc = isValidImageSrc(imgSrc) ? imgSrc : '/img/cover.jpg';
  const displayImgSrc = imgError ? '/img/cover.jpg' : validImgSrc;
  
  return (
    <InteractiveCard>
        <div className="w-full h-[70%] relative rounded-t-lg">
                <Image 
                src={displayImgSrc}
                    alt={`${eventName} poster`}
                    fill={true}
                    className="object-contain rounded-t-lg"
                    onError={() => setImgError(true)}
                unoptimized={displayImgSrc.startsWith('http://localhost') || displayImgSrc.includes('example.com')}
                />
        </div>
        <div className="w-full h-[30%] text-black p-3 flex flex-col justify-between overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="font-bold text-lg mb-1 truncate" title={eventName}>{eventName}</div>
          {description && (
            <div className="text-sm text-gray-600 mb-1 truncate" title={description}>{description}</div>
          )}
          {eventDate && (
            <div className="text-xs text-gray-500 mb-1">Date: {new Date(eventDate).toLocaleDateString()}</div>
          )}
          {availableTicket !== undefined && (
            <div className="text-xs text-gray-500 mb-1">Available: {availableTicket} tickets</div>
          )}
          {
            onCompare? <Rating
            id = {eventName + " Rating"}
            name = {eventName + " Rating"}
            data-testid = {eventName + " Rating"}
            value={rating}
            onChange={(_, value) => {
              setRating(value);
              onCompare(eventName, value);
            }}
            /> : ''
          }
        </div>
    </InteractiveCard>
  );
}