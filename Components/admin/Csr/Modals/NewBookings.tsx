"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Mail, Phone, User, UserPlus, X } from "lucide-react";

interface NewBookingModalProps {
  onClose: () => void;
}

const havenOptions = ["Haven 1", "Haven 2", "Haven 3", "Haven 4"];

export default function NewBookingModal({ onClose }: NewBookingModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState({
    guestName: "",
    email: "",
    phone: "",
    haven: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    notes: "",
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Booking Saved! (Connect to backend)");
    onClose();
  };

  if (!isMounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center px-4 py-8 z-[9999]">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div>
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-[0.2em]">
                Booking manager
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Create New Booking</h2>
              <p className="text-sm text-gray-500 mt-1">
                Capture guest details and reservation preferences.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {/* Guest Details */}
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">
                  Guest details
                </p>
                <h3 className="text-lg font-semibold text-gray-900">Primary contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput
                  label="Guest Name"
                  name="guestName"
                  value={form.guestName}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  icon={<User className="w-4 h-4 text-gray-400" />}
                  required
                />
                <LabeledInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                  required
                />
                <LabeledInput
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+63 912 345 6789"
                  icon={<Phone className="w-4 h-4 text-gray-400" />}
                />
                <LabeledSelect
                  label="Select Haven"
                  name="haven"
                  value={form.haven}
                  onChange={handleChange}
                  options={havenOptions}
                  required
                />
              </div>
            </section>

            {/* Schedule */}
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">
                  Stay details
                </p>
                <h3 className="text-lg font-semibold text-gray-900">Schedule overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput
                  label="Check-in Date"
                  name="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={handleChange}
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                  required
                />
                <LabeledInput
                  label="Check-out Date"
                  name="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={handleChange}
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                  required
                />
                <LabeledInput
                  label="No. of Guests"
                  name="guests"
                  type="number"
                  min={1}
                  value={form.guests}
                  onChange={handleChange}
                  placeholder="2"
                  icon={<UserPlus className="w-4 h-4 text-gray-400" />}
                  required
                />
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">
                  Special requests
                </p>
                <h3 className="text-lg font-semibold text-gray-900">Add internal notes</h3>
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add any guest preferences, arrival notes, or CSR reminders..."
                rows={4}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </section>
          </form>

          {/* Footer actions */}
          <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-white">
            <p className="text-xs text-gray-500">
              Bookings will be synced to the reservations dashboard.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-yellow-600 transition"
              >
                Save Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const LabeledInput = ({ label, icon, ...props }: LabeledInputProps) => (
  <label className="space-y-2">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">{icon}</div>}
      <input
        {...props}
        className={`w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${icon ? "pl-9" : "pl-3"
          }`}
      />
    </div>
  </label>
);

interface LabeledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

const LabeledSelect = ({ label, options, ...props }: LabeledSelectProps) => (
  <label className="space-y-2">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <select
      {...props}
      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);
