import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MyWishlistClient from "@/Components/MyWishlist";

export const metadata = {
  title: "My Wishlist - Staycation Haven"
}

const getWishlist = async (userId: string) => {
  const res = await fetch(`${process.env.API_URL}/api/wishlist/${userId}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  return res.json();
}

const MyWishlistPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getWishlist(session.user.id);

  return <MyWishlistClient initialData={data} />;
}

export default MyWishlistPage;