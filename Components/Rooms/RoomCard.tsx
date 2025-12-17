"use client";

import { Star, User, MapPin } from "lucide-react";
import RoomImageGallery from "./RoomImageGallery";
import AmenityBadge from "./AmenityBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  price: string;
  pricePerNight: string;
  images: string[];
  rating: number;
  reviews: number;
  capacity: number;
  amenities: string[];
  description: string;
  fullDescription?: string;
  beds?: string;
  roomSize?: string;
  location?: string;
  tower?: string;
}
interface RoomCardsProps {
  room: Room;
  mode?: "select" | "browse"; // 'select' for filtered search, 'browse' for homepage
}
const RoomCard = ({ room, mode = "browse" }: RoomCardsProps) => {
  const router = useRouter();

  const handleSelect = () => {
    // Navigate to room details for booking
    router.push(`/rooms/${room.id}`);
  };
  return (
    <div className="bg-white rounded-t-lg sm:rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in slide-in-from-bottom duration-500">
      {/* Image Gallery */}
      <RoomImageGallery images={room.images} />

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Rating and Revies */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(room.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {room.rating} ({room.reviews} reviews)
          </span>
        </div>

        {/* Room Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {room.name}
        </h3>

        {/* Location */}
        {room.location && room.tower && (
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600 font-medium">
              {room.tower}, {room.location}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Array.isArray(room.amenities) ? room.amenities : [])
            .slice(0, 2)
            .map((amenity, index) => (
              <AmenityBadge key={index} amenity={amenity} />
            ))}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <User className="w-4 h-4 text-blue-600" />
          <span>Up to {room.capacity} guests</span>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-400">
              {room.price}
            </p>
            <p className="text-xs text-gray-500">{room.pricePerNight}</p>
          </div>

          {/* Conditional Button based on mode */}
          {mode === "select" ? (
            // SELECT button for filtered search results
            <button
              onClick={handleSelect}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-lg"
            >
              SELECT
            </button>
          ) : (
            // BOOK NOW button for homepage browse
            <Link href={`/rooms/${room.id}`}>
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap">
                BOOK NOW
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
