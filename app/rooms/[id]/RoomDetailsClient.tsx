"use client";

import { useRouter } from "next/navigation";
import RoomsDetailsPage from "@/Components/Rooms/RoomsDetailsPage";

<<<<<<< HEAD
interface HavenData {
  uuid_id: string;
  haven_name: string;
  six_hour_rate: number;
  images?: Array<{ url: string }>;
  rating?: number;
  review_count?: number;
  capacity: number;
  amenities?: Record<string, boolean>;
  description: string;
  full_description?: string;
  beds?: string;
  room_size?: string;
  location?: string;
  tower?: string;
  photo_tours?: Array<{ category: string; url: string }>;
  youtube_url?: string;
}

interface RoomDetailsClientProps {
  room: HavenData;
=======
interface RoomDetailsClientProps {
  room: any;
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
}

export default function RoomDetailsClient({ room: haven }: RoomDetailsClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/rooms');
  };

  // Transform haven data to room format expected by RoomsDetailsPage
  const room = {
    id: haven.uuid_id,
    name: haven.haven_name,
    price: `₱${haven.six_hour_rate}`,
    pricePerNight: 'per night',
<<<<<<< HEAD
    images: haven.images?.map((img) => img.url) ?? [],
=======
    images: haven.images?.map((img: any) => img.url) ?? [],
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
    rating: haven.rating ?? 4.5,
    reviews: haven.review_count ?? 0,
    capacity: haven.capacity,
    amenities: Object.entries(haven.amenities || {})
<<<<<<< HEAD
      .filter(([, value]) => value === true)
=======
      .filter(([_, value]) => value === true)
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
      .map(([key]) => key),
    description: haven.description,
    fullDescription: haven.full_description || haven.description,
    beds: haven.beds,
    roomSize: haven.room_size,
    location: haven.location,
    tower: haven.tower,
    photoTour: haven.photo_tours
<<<<<<< HEAD
      ? haven.photo_tours.reduce((acc: Record<string, string[]>, item) => {
          acc[item.category] = acc[item.category] || [];
          acc[item.category].push(item.url);
          return acc;
        }, {} as Record<string, string[]>)
=======
      ? haven.photo_tours.reduce((acc: any, item: any) => {
          acc[item.category] = acc[item.category] || [];
          acc[item.category].push(item.url);
          return acc;
        }, {})
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
      : {},
    youtubeUrl: haven.youtube_url,
  };

  return <RoomsDetailsPage room={room} onBack={handleBack} />;
}

