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
  
  return (
    <InteractiveCard>
        <div className="w-full h-[70%] relative rounded-t-lg">
            {imgError || !imgSrc ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-400 text-sm">No Image</span>
                </div>
            ) : (
                <Image 
                    src={imgSrc}
                    alt={`${eventName} poster`}
                    fill={true}
                    className="object-contain rounded-t-lg"
                    onError={() => setImgError(true)}
                    unoptimized={imgSrc.startsWith('http://localhost') || imgSrc.includes('example.com')}
                />
            )}
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