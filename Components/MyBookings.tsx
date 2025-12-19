'use client';

import { useState, useMemo } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';

interface MyBookingsPageProps {
  initialData: {
    success: boolean;
    data: any[];
  };
}

const MyBookingsPage = ({ initialData }: MyBookingsPageProps) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, past, cancelled

  // Map database status to display status
  const getDisplayStatus = (booking: any) => {
    const today = new Date();
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);

    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.status === 'completed' || checkOutDate < today) return 'past';
    if (['pending', 'approved', 'confirmed'].includes(booking.status) && checkInDate >= today) return 'upcoming';
    return 'past';
  };

  // Filter bookings based on status
  const bookings = useMemo(() => {
    if (!initialData?.data) return [];
    if (filterStatus === 'all') return initialData.data;

    return initialData.data.filter((booking: any) => {
      const displayStatus = getDisplayStatus(booking);
      return displayStatus === filterStatus;
    });
  }, [initialData, filterStatus]);

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      past: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    };
    return badges[status as keyof typeof badges] || badges.past;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your staycation reservations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { label: 'All Bookings', value: 'all' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Past', value: 'past' },
            { label: 'Cancelled', value: 'cancelled' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                filterStatus === filter.value
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any {filterStatus !== 'all' ? filterStatus : ''} bookings yet.
            </p>
            <Link href="/rooms">
              <button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                Browse Rooms
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => {
              const displayStatus = getDisplayStatus(booking);
              // Get first image from room_images array, fallback to default
              const firstImage = Array.isArray(booking.room_images) && booking.room_images.length > 0
                ? booking.room_images[0]
                : '/Images/bg.jpg';
              const totalGuests = booking.adults + booking.children + booking.infants;

              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Room Image */}
                    <div className="md:col-span-1">
                      <img
                        src={firstImage}
                        alt={booking.room_name}
                        className="w-full h-48 md:h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                              {booking.room_name}
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Booking Ref: <span className="font-mono font-semibold">{booking.booking_id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">
                                {booking.tower || 'Quezon City'}
                              </span>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(displayStatus)}`}>
                            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Check-in</p>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {new Date(booking.check_in_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.check_in_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Check-out</p>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {new Date(booking.check_out_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.check_out_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <Users className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Guests</p>
                              <p className="font-semibold text-gray-800 dark:text-white">{totalGuests} people</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                          <p className="text-2xl font-bold text-orange-500">₱{booking.total_amount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-3">
                          <Link href={`/bookings/${booking.id}`}>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-all duration-300">
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </Link>
                          {displayStatus === 'upcoming' && booking.status === 'pending' && (
                            <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300">
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
