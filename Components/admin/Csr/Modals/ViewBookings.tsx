"use client";

import { X, User, Mail, Phone, MapPin, Calendar, Users as UsersIcon, DollarSign, CreditCard, FileText } from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  haven: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  statusColor: string;
  total: string;
}

interface ViewBookingsProps {
  booking: Booking;
  onClose: () => void;
}

export default function ViewBookings({ booking, onClose }: ViewBookingsProps) {
  return (
    <div
  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
  style={{ isolation: "isolate" }}
>

      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-[10000] bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Booking Details</h2>
            <p className="text-sm opacity-90">Booking ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Booking Status</h3>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${booking.statusColor}`}>
              {booking.status}
            </span>
          </div>

          {/* Guest Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Full Name</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">{booking.guestName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-800 break-all">{booking.email}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-800">{booking.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Haven</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <p className="text-sm font-semibold text-gray-800">{booking.haven}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Number of Guests</p>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">{booking.guests} Guests</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Check-In Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">{booking.checkIn}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Check-Out Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">{booking.checkOut}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <p className="text-2xl font-bold text-gray-800">{booking.total}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-800">
                    {booking.status === "Confirmed" ? "Paid" : booking.status === "Pending" ? "Pending Payment" : "Refunded"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Additional Notes
            </h3>
            <p className="text-sm text-gray-600">
              This booking was created on {booking.checkIn}. Please ensure all guest requirements are met before check-in.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
            Edit Booking
          </button>
        </div>
      </div>
    </div>
  );
}