import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MyBookingsClient from "@/Components/MyBookings";

export const metadata = {
  title: "My Bookings - Staycation Haven"
}

const getBookings = async (userId: string) => {
  const res = await fetch(`${process.env.API_URL}/api/bookings/user/${userId}?status=all`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return res.json();
}

const MyBookingsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getBookings(session.user.id);

  return <MyBookingsClient initialData={data} />;
}

export default MyBookingsPage