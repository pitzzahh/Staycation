"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setCheckInDate, setCheckOutDate } from "@/redux/slices/bookingSlice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DatePicker } from "@nextui-org/date-picker";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@react-types/calendar";
import { useGetRoomBookingsQuery, useCreateBookingMutation } from "@/redux/api/bookingsApi";
import {
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Upload,
  Plus,
  Minus,
  Home,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Footer from "./Footer";

interface AddOns {
  poolPass: number;
  towels: number;
  bathRobe: number;
  extraComforter: number;
  guestKit: number;
  extraSlippers: number;
}

interface Booking {
  status: string;
  check_in_date: string;
  check_out_date: string;
}

interface BlockedDate {
  from_date: string;
  to_date: string;
}

interface SessionUser {
  id?: string;
  role?: string;
}

const ADD_ON_PRICES = {
  poolPass: 100,
  towels: 50,
  bathRobe: 150,
  extraComforter: 100,
  guestKit: 75,
  extraSlippers: 30,
};

const Checkout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bookingData = useAppSelector((state) => state.booking);
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1 = Guest Info, 2 = Confirmation & Payment
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [bookingIdState] = useState(() => `BK${Date.now()}`);

  // Fetch existing bookings for the selected room
  const { data: roomBookingsData } = useGetRoomBookingsQuery(
    bookingData.selectedRoom?.id || '',
    { skip: !bookingData.selectedRoom?.id }
  );

  // Debug: Log the selected room and bookings data
  useEffect(() => {
    console.log('🔍 Selected Room:', bookingData.selectedRoom);
    console.log('🔍 Room Bookings Data:', roomBookingsData);
    if (roomBookingsData?.data) {
      console.log('🔍 Number of bookings found:', roomBookingsData.data.length);
      console.log('🔍 Booking details:', roomBookingsData.data);
    }
  }, [bookingData.selectedRoom, roomBookingsData]);

  // RTK Query mutation for creating bookings
  const [createBooking] = useCreateBookingMutation();

  interface GuestInfo {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    validId: File | null;
    validIdPreview: string;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    facebookLink: "",
    validId: null as File | null,
    validIdPreview: "",
    adults: 1,
    children: 0,
    infants: 0,
    stayType: "",
    checkInTime: "",
    checkOutTime: "",
    paymentProof: null as File | null,
    paymentProofPreview: "",
    termsAccepted: false,
    paymentMethod: "gcash",
  });

  const [additionalGuests, setAdditionalGuests] = useState<GuestInfo[]>([]);

  const [addOns, setAddOns] = useState<AddOns>({
    poolPass: 0,
    towels: 0,
    bathRobe: 0,
    extraComforter: 0,
    guestKit: 0,
    extraSlippers: 0,
  });

  // Calculate number of days for multi-day stay
  const calculateNumberOfDays = (): number => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;

    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Calculate room rate from selected stay type
  const getRoomRateFromStayType = (): number => {
    if (!formData.stayType) return 0; // Return 0 if no stay type selected

    if (formData.stayType === "10 Hours - ₱1,599") {
      return 1599;
    } else if (formData.stayType.includes("weekday")) {
      return 1799;
    } else if (formData.stayType.includes("Fri-Sat")) {
      return 1999;
    } else if (formData.stayType === "Multi-Day Stay") {
      // For multi-day, calculate: base rate × number of days
      const baseRate = bookingData.selectedRoom?.price
        ? parseInt(bookingData.selectedRoom.price.replace(/[₱,]/g, ""))
        : 1799;

      const numberOfDays = calculateNumberOfDays();
      return baseRate * numberOfDays;
    }
    return 0;
  };

  const roomRate = getRoomRateFromStayType();
  const numberOfDays = calculateNumberOfDays();
  const securityDeposit = formData.stayType ? 1000 : 0; // Only show if stay type selected
  const downPayment = 500;

  // Calculate add-ons total
  const addOnsTotal = Object.entries(addOns).reduce((total, [key, quantity]) => {
    return total + quantity * ADD_ON_PRICES[key as keyof AddOns];
  }, 0);

  const totalAmount = roomRate + securityDeposit + addOnsTotal;
  const remainingBalance = totalAmount - downPayment;
  const totalGuests = formData.adults + formData.children + formData.infants;

  // Update additional guests array when adults/children count changes
  const updateAdditionalGuests = (adults: number, children: number) => {
    const totalAdditionalGuests = adults + children - 1; // -1 for main guest
    setAdditionalGuests(prev => {
      const currentLength = prev.length;

      if (totalAdditionalGuests > currentLength) {
        // Add new guests
        const newGuests = Array(totalAdditionalGuests - currentLength).fill(null).map(() => ({
          firstName: "",
          lastName: "",
          age: "",
          gender: "",
          validId: null,
          validIdPreview: "",
        }));
        return [...prev, ...newGuests];
      } else if (totalAdditionalGuests < currentLength) {
        // Remove excess guests
        return prev.slice(0, totalAdditionalGuests);
      }
      return prev;
    });
  };

  // Create a function to check if a date is unavailable (booked or blocked)
  const isDateUnavailable = useMemo(() => {
    return (date: DateValue) => {
      const checkDate = new Date(date.year, date.month - 1, date.day);
      checkDate.setHours(0, 0, 0, 0);

      // Check if the date falls within any existing booking's date range
      const isBooked = roomBookingsData?.data?.some((booking: Booking) => {
        // Only block dates for approved/confirmed/checked-in bookings
        // Pending bookings don't block dates until approved
        const approvedStatuses = ['approved', 'confirmed', 'check_in', 'checked-in'];
        if (!approvedStatuses.includes(booking.status)) {
          return false;
        }

        const bookingCheckIn = new Date(booking.check_in_date);
        bookingCheckIn.setHours(0, 0, 0, 0);

        const bookingCheckOut = new Date(booking.check_out_date);
        bookingCheckOut.setHours(0, 0, 0, 0);

        // A date is unavailable if it falls between check-in and check-out (inclusive)
        return checkDate >= bookingCheckIn && checkDate <= bookingCheckOut;
      });

      // Check if the date is in blocked_dates from the room
      const isBlocked = bookingData.selectedRoom?.blocked_dates?.some((blocked: BlockedDate) => {
        const fromDate = new Date(blocked.from_date);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(blocked.to_date);
        toDate.setHours(0, 0, 0, 0);
        return checkDate >= fromDate && checkDate <= toDate;
      });

      return isBooked || isBlocked;
    };
  }, [roomBookingsData, bookingData.selectedRoom]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle guest count validation (adults + children only, infants not counted)
    if (name === "adults" || name === "children") {
      const newValue = parseInt(value) || 0;
      const currentAdults = name === "adults" ? newValue : formData.adults;
      const currentChildren = name === "children" ? newValue : formData.children;
      const newTotal = currentAdults + currentChildren;

      // Prevent exceeding max 4 guests (excluding infants)
      if (newTotal > 4) {
        toast.error("Maximum 4 guests allowed (adults + children). Infants are not counted.");
        return;
      }

      // Update formData
      const updatedFormData = {
        ...formData,
        [name]: type === "number" ? newValue : value,
      };

      setFormData(updatedFormData);

      // Update additionalGuests directly
      updateAdditionalGuests(currentAdults, currentChildren);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : type === "number"
            ? parseInt(value) || 0
            : value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'id', guestIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'payment') {
        setFormData((prev) => ({
          ...prev,
          paymentProof: file,
          paymentProofPreview: URL.createObjectURL(file),
        }));
      } else if (guestIndex === undefined) {
        // Main guest ID
        setFormData((prev) => ({
          ...prev,
          validId: file,
          validIdPreview: URL.createObjectURL(file),
        }));
      } else {
        // Additional guest ID
        const updatedGuests = [...additionalGuests];
        updatedGuests[guestIndex].validId = file;
        updatedGuests[guestIndex].validIdPreview = URL.createObjectURL(file);
        setAdditionalGuests(updatedGuests);
      }
    }
  };

  const handleAdditionalGuestChange = (index: number, field: keyof GuestInfo, value: string) => {
    const updatedGuests = [...additionalGuests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value,
    };
    setAdditionalGuests(updatedGuests);
  };

  const handleStayTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStayType = e.target.value;

    // Set default times based on stay type
    let defaultCheckInTime = "";
    let defaultCheckOutTime = "";

    if (selectedStayType === "10 Hours - ₱1,599") {
      defaultCheckInTime = "14:00"; // 2:00 PM
      defaultCheckOutTime = "00:00"; // 12:00 AM (midnight)
    } else if (selectedStayType.includes("21 Hours")) {
      defaultCheckInTime = "14:00"; // 2:00 PM
      defaultCheckOutTime = "11:00"; // 11:00 AM
    } else if (selectedStayType === "Multi-Day Stay") {
      defaultCheckInTime = "14:00"; // 2:00 PM
      defaultCheckOutTime = "11:00"; // 11:00 AM
    }

    setFormData((prev) => ({
      ...prev,
      stayType: selectedStayType,
      checkInTime: defaultCheckInTime,
      checkOutTime: defaultCheckOutTime,
    }));

    // Auto-calculate check-out date if check-in date is already selected
    if (bookingData.checkInDate && selectedStayType) {
      const checkInDate = new Date(bookingData.checkInDate);
      const checkOutDate = new Date(checkInDate);

      if (selectedStayType === "10 Hours - ₱1,599") {
        // 10 hours: check-in 2:00 PM, check-out 12:00 AM next day
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      } else if (selectedStayType.includes("21 Hours")) {
        // 21 hours: check-in 2:00 PM, check-out 11:00 AM next day
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      } else if (selectedStayType === "Multi-Day Stay") {
        // Multi-day: add 1 day by default
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      }

      const checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`;
      dispatch(setCheckOutDate(checkOutStr));
    }
  };

  const handleAddOnChange = (item: keyof AddOns, increment: boolean) => {
    setAddOns((prev) => ({
      ...prev,
      [item]: Math.max(0, prev[item] + (increment ? 1 : -1)),
    }));
  };

  const scrollToError = (fieldName: string) => {
    const element = errorRefs.current[fieldName];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add shake animation
      element.classList.add('animate-shake');
      setTimeout(() => element.classList.remove('animate-shake'), 500);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const newErrors: Record<string, string> = {};

      // Validate Step 1 - Main Guest
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.age) newErrors.age = "Age is required";
      if (!formData.gender) newErrors.gender = "Please select a gender";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";

      // Validate ID for main guest if 10+ years old
      if (formData.age && parseInt(formData.age) >= 10 && !formData.validId) {
        newErrors.validId = "Valid ID is required for guests 10+ years old";
      }

      // Validate additional guests
      for (let i = 0; i < additionalGuests.length; i++) {
        const guest = additionalGuests[i];
        const guestNumber = i + 2;

        if (!guest.firstName) newErrors[`guest${i}FirstName`] = `Guest ${guestNumber} first name is required`;
        if (!guest.lastName) newErrors[`guest${i}LastName`] = `Guest ${guestNumber} last name is required`;
        if (!guest.age) newErrors[`guest${i}Age`] = `Guest ${guestNumber} age is required`;
        if (!guest.gender) newErrors[`guest${i}Gender`] = `Guest ${guestNumber} gender is required`;

        // Validate ID for guests 10+ years old
        if (guest.age && parseInt(guest.age) >= 10 && !guest.validId) {
          newErrors[`guest${i}ValidId`] = `Valid ID is required for Guest ${guestNumber} (10+ years old)`;
        }
      }

      // Validate guest count
      if (formData.adults + formData.children > 4) {
        newErrors.guestCount = "Maximum 4 guests allowed (adults + children)";
      }

      // Validate stay type
      if (!formData.stayType) newErrors.stayType = "Please select a stay type";

      // Validate check-in/out times
      if (!formData.checkInTime) newErrors.checkInTime = "Check-in time is required";
      if (!formData.checkOutTime) newErrors.checkOutTime = "Check-out time is required";

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        const firstErrorKey = Object.keys(newErrors)[0];
        toast.error(newErrors[firstErrorKey]);
        scrollToError(firstErrorKey);
        return;
      }

      setCurrentStep(2);
      // Scroll to top to see "Confirm Your Booking"
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const newErrors: Record<string, string> = {};

  // Validate required fields
  if (!formData.paymentProof) {
    newErrors.paymentProof = "Proof of payment is required";
  }
  if (!formData.termsAccepted) {
    newErrors.termsAccepted = "You must accept the terms and conditions";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    const firstErrorKey = Object.keys(newErrors)[0];
    toast.error(newErrors[firstErrorKey]);
    scrollToError(firstErrorKey);
    return;
  }

  try {
    setIsLoading(true);

    // Use the booking ID generated at component mount
    const bookingId = bookingIdState;

    // Convert payment proof to base64 if it's a File
    let paymentProofBase64 = '';
    if (formData.paymentProof) {
      const reader = new FileReader();
      paymentProofBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.paymentProof as File);
      });
    }

    // Convert valid ID to base64 if it's a File
    let validIdBase64 = '';
    if (formData.validId) {
      const reader = new FileReader();
      validIdBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.validId as File);
      });
    }

    // Convert additional guests' IDs to base64
    const additionalGuestsData = await Promise.all(
      additionalGuests.map(async (guest) => {
        let guestIdBase64 = '';
        if (guest.validId) {
          const reader = new FileReader();
          guestIdBase64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(guest.validId as File);
          });
        }
        return {
          firstName: guest.firstName,
          lastName: guest.lastName,
          age: guest.age,
          gender: guest.gender,
          validId: guestIdBase64,
        };
      })
    );

    // Prepare booking data for database
    const sessionUser = session?.user as SessionUser | undefined;
    const bookingRequestData = {
      booking_id: bookingId,
      user_id: sessionUser?.id || null, // NULL for guest, UUID for logged-in users
      guest_first_name: formData.firstName,
      guest_last_name: formData.lastName,
      guest_age: formData.age,
      guest_gender: formData.gender,
      guest_email: formData.email,
      guest_phone: formData.phone,
      facebook_link: formData.facebookLink,
      valid_id: validIdBase64,
      additional_guests: additionalGuestsData,
      room_name: bookingData.selectedRoom?.name || bookingData.location?.name || 'Standard Room',
      stay_type: formData.stayType,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      check_in_time: formData.checkInTime,
      check_out_time: formData.checkOutTime,
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
      payment_method: formData.paymentMethod,
      payment_proof: paymentProofBase64,
      room_rate: roomRate,
      security_deposit: securityDeposit,
      add_ons_total: addOnsTotal,
      total_amount: totalAmount,
      down_payment: downPayment,
      remaining_balance: remainingBalance,
      add_ons: addOns,
    };

    // Save booking to database using RTK Query mutation
    try {
      const result = await createBooking(bookingRequestData).unwrap();

      if (result.success) {
        toast.success(`Booking Submitted Successfully!\n\nYour booking ID is: ${bookingId}\n\nStatus: Pending Admin Approval\n\nYou will receive a confirmation email once the admin approves your booking.`);

        // Clear form and redirect based on user role
        const userRole = sessionUser?.role;
        if (userRole === 'Owner') {
          router.push('/admin/owners');
        } else {
          router.push('/');
        }
      } else {
        setIsLoading(false);
        toast.error('Failed to create booking. Please try again or contact support.');
      }
    } catch (mutationError: unknown) {
      setIsLoading(false);
      console.error('RTK Query mutation error:', mutationError);
      const errorMessage = mutationError && typeof mutationError === 'object' && 'data' in mutationError
        ? (mutationError.data as { error?: string })?.error
        : undefined;
      toast.error(errorMessage || 'An error occurred. Please try again or contact support.');
    }

  } catch (error) {
    setIsLoading(false);
    console.error('Booking error:', error);
    toast.error('An error occurred. Please try again or contact support.');
  }
};

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 sm:pt-28 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {currentStep === 1 ? "Guest Information" : "Confirm Your Booking"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {currentStep === 1
              ? "Please fill in your details"
              : "Review your booking and complete payment"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                currentStep === 1 ? "text-brand-primary dark:text-brand-primary" : "text-green-600 dark:text-green-500"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${
                  currentStep === 1
                    ? "bg-brand-primary text-white"
                    : "bg-green-600 dark:bg-green-500 text-white"
                }`}
              >
                {currentStep === 1 ? "1" : "✓"}
              </div>
              <span className="font-medium text-sm sm:text-base">Guest Info</span>
            </div>
            <div className="w-12 sm:w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                currentStep === 2 ? "text-brand-primary dark:text-brand-primary" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${
                  currentStep === 2
                    ? "bg-brand-primary text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                2
              </div>
              <span className="font-medium text-sm sm:text-base">Confirmation</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative overflow-hidden">
          {/* STEP 1: Guest Information */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6 slide-in-from-right">
              {/* Guest Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary dark:text-brand-primary" />
                  Guest Information
                </h2>

                {/* Main Guest Header */}
                <div className="flex items-center gap-2 mb-4 text-brand-primary dark:text-brand-primary">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold text-sm sm:text-base">Adult 1 (Main Guest)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div ref={(el) => { errorRefs.current.firstName = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, firstName: ''}));
                      }}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div ref={(el) => { errorRefs.current.lastName = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, lastName: ''}));
                      }}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div ref={(el) => { errorRefs.current.age = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, age: ''}));
                      }}
                      required
                      min="1"
                      max="120"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                      placeholder="Enter age"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.age}
                      </p>
                    )}
                  </div>

                  <div ref={(el) => { errorRefs.current.gender = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, gender: ''}));
                      }}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                        errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div ref={(el) => { errorRefs.current.email = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-primary dark:text-brand-primary" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, email: ''}));
                      }}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div ref={(el) => { errorRefs.current.phone = el; }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-primary dark:text-brand-primary" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors(prev => ({...prev, phone: ''}));
                      }}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                      }`}
                      placeholder="e.g., 182918212"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      Facebook Name or Link
                    </label>
                    <input
                      type="text"
                      name="facebookLink"
                      value={formData.facebookLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="e.g., Juan Dela Cruz or facebook.com/juandelacruz"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Alternative contact in case email is incorrect
                    </p>
                  </div>
                </div>

                {/* Valid ID Upload Section */}
                <div ref={(el) => { errorRefs.current.validId = el; }} className={`mt-6 p-4 border-2 border-dashed rounded-lg ${
                  errors.validId ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className={`w-5 h-5 ${errors.validId ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    <h3 className={`font-semibold text-sm sm:text-base ${errors.validId ? 'text-red-800 dark:text-red-300' : 'text-blue-800 dark:text-blue-300'}`}>
                      Valid ID (Required for guests 10+ years old)
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Accepted: Driver&apos;s License, Passport, National ID, School ID
                  </p>

                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileChange(e, 'id')}
                      className="hidden"
                      id="valid-id"
                    />
                    <label
                      htmlFor="valid-id"
                      className="cursor-pointer inline-flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-2 border-gray-200 dark:border-gray-600"
                    >
                      <Upload className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-3" />
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Click to upload ID photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG up to 5MB</p>
                    </label>

                    {formData.validIdPreview && (
                      <div className="mt-4">
                        <Image
                          src={formData.validIdPreview}
                          alt="Valid ID preview"
                          width={300}
                          height={200}
                          className="max-w-xs mx-auto rounded-lg shadow-md border-2 border-green-500"
                        />
                        <p className="text-sm text-green-600 mt-2 font-medium">✓ ID uploaded successfully</p>
                      </div>
                    )}
                    {errors.validId && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-1 justify-center">
                        <AlertCircle className="w-4 h-4" />
                        {errors.validId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Guests */}
              {additionalGuests.map((guest, index) => {
                const guestNumber = index + 2;
                const isAdult = index < formData.adults - 1;
                const guestType = isAdult ? `Adult ${guestNumber}` : `Child ${guestNumber - (formData.adults - 1)}`;

                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4 text-brand-primary dark:text-brand-primary">
                      <User className="w-5 h-5" />
                      <h3 className="font-semibold text-sm sm:text-base">{guestType}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div ref={(el) => { errorRefs.current[`guest${index}FirstName`] = el; }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={guest.firstName}
                          onChange={(e) => {
                            handleAdditionalGuestChange(index, 'firstName', e.target.value);
                            setErrors(prev => ({...prev, [`guest${index}FirstName`]: ''}));
                          }}
                          required
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                            errors[`guest${index}FirstName`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors[`guest${index}FirstName`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`guest${index}FirstName`]}
                          </p>
                        )}
                      </div>

                      <div ref={(el) => { errorRefs.current[`guest${index}LastName`] = el; }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={guest.lastName}
                          onChange={(e) => {
                            handleAdditionalGuestChange(index, 'lastName', e.target.value);
                            setErrors(prev => ({...prev, [`guest${index}LastName`]: ''}));
                          }}
                          required
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                            errors[`guest${index}LastName`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors[`guest${index}LastName`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`guest${index}LastName`]}
                          </p>
                        )}
                      </div>

                      <div ref={(el) => { errorRefs.current[`guest${index}Age`] = el; }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={guest.age}
                          onChange={(e) => {
                            handleAdditionalGuestChange(index, 'age', e.target.value);
                            setErrors(prev => ({...prev, [`guest${index}Age`]: ''}));
                          }}
                          required
                          min="1"
                          max="120"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors[`guest${index}Age`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                          }`}
                          placeholder="Enter age"
                        />
                        {errors[`guest${index}Age`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`guest${index}Age`]}
                          </p>
                        )}
                      </div>

                      <div ref={(el) => { errorRefs.current[`guest${index}Gender`] = el; }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={guest.gender}
                          onChange={(e) => {
                            handleAdditionalGuestChange(index, 'gender', e.target.value);
                            setErrors(prev => ({...prev, [`guest${index}Gender`]: ''}));
                          }}
                          required
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors[`guest${index}Gender`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors[`guest${index}Gender`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`guest${index}Gender`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Valid ID Upload for Additional Guest if 10+ */}
                    {parseInt(guest.age) >= 10 && (
                      <div ref={(el) => { errorRefs.current[`guest${index}ValidId`] = el; }} className={`mt-6 p-4 border-2 border-dashed rounded-lg ${
                        errors[`guest${index}ValidId`] ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-300">
                            Valid ID (Required for guests 10+ years old)
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Accepted: Driver&apos;s License, Passport, National ID, School ID
                        </p>

                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleFileChange(e, 'id', index)}
                            className="hidden"
                            id={`valid-id-${index}`}
                          />
                          <label
                            htmlFor={`valid-id-${index}`}
                            className="cursor-pointer inline-flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-2 border-gray-200 dark:border-gray-600"
                          >
                            <Upload className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-3" />
                            <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                              Click to upload ID photo
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG up to 5MB</p>
                          </label>

                          {guest.validIdPreview && (
                            <div className="mt-4">
                              <Image
                                src={guest.validIdPreview}
                                alt="Valid ID preview"
                                width={300}
                                height={200}
                                className="max-w-xs mx-auto rounded-lg shadow-md border-2 border-green-500"
                              />
                              <p className="text-sm text-green-600 mt-2 font-medium">✓ ID uploaded successfully</p>
                            </div>
                          )}
                        </div>
                        {errors[`guest${index}ValidId`] && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`guest${index}ValidId`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Number of Guests */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary dark:text-brand-primary" />
                  Number of Guests (Max 4 guests)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adults
                    </label>
                    <input
                      type="number"
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      min="1"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      min="0"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Infants
                    </label>
                    <input
                      type="number"
                      name="infants"
                      value={formData.infants}
                      onChange={handleInputChange}
                      min="0"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total Guests (Adults + Children): {formData.adults + formData.children} / 4
                  {formData.infants > 0 && ` + ${formData.infants} infant${formData.infants > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Booking Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary dark:text-brand-primary" />
                  Booking Details
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Haven
                      </label>
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                        <Home className="w-5 h-5 text-brand-primary dark:text-brand-primary" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingData.selectedRoom?.name || bookingData.location?.name || "Not selected"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stay Type *
                      </label>
                      <select
                        name="stayType"
                        value={formData.stayType}
                        onChange={handleStayTypeChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select stay type</option>
                        <option value="10 Hours - ₱1,599">10 Hours - ₱1,599</option>
                        <option value="21 Hours - ₱1,799 (weekday) / ₱1,999 (Fri-Sat)">
                          21 Hours - ₱1,799 (weekday) / ₱1,999 (Fri-Sat)
                        </option>
                        <option value="Multi-Day Stay">Multi-Day Stay</option>
                      </select>
                    </div>

                    <div>
                      <DatePicker
                        label="Check-in Date *"
                        value={bookingData.checkInDate ? parseDate(bookingData.checkInDate) : undefined}
                        onChange={(date: DateValue | null) => {
                          if (date) {
                            const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                            dispatch(setCheckInDate(dateStr));

                            // Auto-set check-out date based on stay type
                            if (formData.stayType === "10 Hours - ₱1,599" || formData.stayType.includes("21 Hours")) {
                              // For 10 hours and 21 hours, check-out is next day
                              const checkOutDate = new Date(date.year, date.month - 1, date.day);
                              checkOutDate.setDate(checkOutDate.getDate() + 1);
                              const checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`;
                              dispatch(setCheckOutDate(checkOutStr));
                            } else if (formData.stayType === "Multi-Day Stay") {
                              // For multi-day, add 1 day by default (user can change)
                              const checkOutDate = new Date(date.year, date.month - 1, date.day);
                              checkOutDate.setDate(checkOutDate.getDate() + 1);
                              const checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`;
                              dispatch(setCheckOutDate(checkOutStr));
                            }
                          }
                        }}
                        minValue={today(getLocalTimeZone())}
                        isDateUnavailable={isDateUnavailable}
                        isDisabled={!formData.stayType}
                        isRequired
                        classNames={{
                          base: "w-full",
                          label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        }}
                        description={!formData.stayType ? "Please select stay type first" : undefined}
                      />
                    </div>

                    <div>
                      <DatePicker
                        label="Check-out Date *"
                        value={bookingData.checkOutDate ? parseDate(bookingData.checkOutDate) : undefined}
                        onChange={(date: DateValue | null) => {
                          if (date) {
                            const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                            dispatch(setCheckOutDate(dateStr));
                          }
                        }}
                        minValue={bookingData.checkInDate ? parseDate(bookingData.checkInDate) : today(getLocalTimeZone())}
                        maxValue={
                          // For 10 hours and 21 hours, max is same as check-in date + 1 day
                          (formData.stayType === "10 Hours - ₱1,599" || formData.stayType.includes("21 Hours")) && bookingData.checkInDate
                            ? (() => {
                                const maxDate = parseDate(bookingData.checkInDate);
                                return parseDate(`${maxDate.year}-${String(maxDate.month).padStart(2, '0')}-${String(maxDate.day + 1).padStart(2, '0')}`);
                              })()
                            : undefined
                        }
                        isDisabled={
                          !formData.stayType ||
                          !bookingData.checkInDate ||
                          formData.stayType === "10 Hours - ₱1,599" ||
                          formData.stayType.includes("21 Hours")
                        }
                        isDateUnavailable={isDateUnavailable}
                        isRequired
                        classNames={{
                          base: "w-full",
                          label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        }}
                        description={
                          formData.stayType === "10 Hours - ₱1,599" || formData.stayType.includes("21 Hours")
                            ? "Auto-set based on check-in date"
                            : !formData.stayType
                            ? "Please select stay type first"
                            : undefined
                        }
                      />
                    </div>

                    <div ref={(el) => { errorRefs.current.checkInTime = el; }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Check-in Time *
                      </label>
                      <input
                        type="time"
                        value={formData.checkInTime}
                        onChange={(e) => {
                          const checkInTime = e.target.value;

                          // Calculate check-out time based on stay type
                          let checkOutTime = "";

                          if (formData.stayType && checkInTime) {
                            const [hours, minutes] = checkInTime.split(':').map(Number);

                            if (formData.stayType === "10 Hours - ₱1,599") {
                              // Add 10 hours
                              let newHours = hours + 10;
                              const newMinutes = minutes;

                              if (newHours >= 24) {
                                newHours -= 24;
                              }

                              checkOutTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
                            } else if (formData.stayType.includes("21 Hours")) {
                              // Add 21 hours
                              let newHours = hours + 21;
                              const newMinutes = minutes;

                              if (newHours >= 24) {
                                newHours -= 24;
                              }

                              checkOutTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
                            } else if (formData.stayType === "Multi-Day Stay") {
                              // For multi-day, use default 11:00 AM check-out
                              checkOutTime = "11:00";
                            }
                          }

                          setFormData({
                            ...formData,
                            checkInTime: checkInTime,
                            checkOutTime: checkOutTime || formData.checkOutTime,
                          });
                          setErrors(prev => ({...prev, checkInTime: ''}));
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {errors.checkInTime && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.checkInTime}
                        </p>
                      )}
                    </div>

                    <div ref={(el) => { errorRefs.current.checkOutTime = el; }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Check-out Time *
                      </label>
                      <input
                        type="time"
                        value={formData.checkOutTime}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            checkOutTime: e.target.value,
                          });
                          setErrors(prev => ({...prev, checkOutTime: ''}));
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {errors.checkOutTime && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.checkOutTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary dark:text-brand-primary" />
                  Pricing Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Room Rate
                      {formData.stayType === "Multi-Day Stay" && numberOfDays > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">₱{roomRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Security Deposit</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₱{securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-brand-primary dark:text-brand-primary">
                        ₱{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400 mb-2">
                      <span className="font-medium text-sm sm:text-base">💳 Down payment (Pay Online)</span>
                      <span className="font-bold">₱{downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-sm sm:text-base">Remaining Balance (Pay Upon Check-in)</span>
                      <span className="font-bold">₱{remainingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> Security deposit is refundable the next day upon
                    checkout if no missing/broken items.
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-primaryDark hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
              >
                Next: Confirmation & Payment
              </button>
            </div>
          )}

          {/* STEP 2: Confirmation & Payment */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6 slide-in-from-right">
              {/* Confirmation Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Confirm Your Details
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
                  Please review your information before proceeding to payment. This is the final
                  step.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Guest Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Guests</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.adults} Adult{formData.adults !== 1 ? "s" : ""}
                      {formData.children > 0 && `, ${formData.children} Child${formData.children !== 1 ? "ren" : ""}`}
                      {formData.infants > 0 && `, ${formData.infants} Infant${formData.infants !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              </div>


              {/* Add-ons */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">Add-ons (Optional)</h2>

                <div className="space-y-3">
                  {[
                    { key: "poolPass", label: "Pool Pass", price: ADD_ON_PRICES.poolPass },
                    { key: "towels", label: "Towels", price: ADD_ON_PRICES.towels },
                    { key: "bathRobe", label: "Bath Robe", price: ADD_ON_PRICES.bathRobe },
                    {
                      key: "extraComforter",
                      label: "Extra Comforter",
                      price: ADD_ON_PRICES.extraComforter,
                    },
                    { key: "guestKit", label: "Guest Kit", price: ADD_ON_PRICES.guestKit },
                    {
                      key: "extraSlippers",
                      label: "Extra Slippers",
                      price: ADD_ON_PRICES.extraSlippers,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">₱{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAddOnChange(item.key as keyof AddOns, false)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                          {addOns[item.key as keyof AddOns]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOnChange(item.key as keyof AddOns, true)}
                          className="w-8 h-8 flex items-center justify-center bg-brand-primary hover:bg-brand-primaryDark text-white rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {addOnsTotal > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Add-ons Total:</strong> ₱{addOnsTotal.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Note:</strong> Add-ons will be added to your total bill and reflected
                    in the price breakdown below.
                  </p>
                </div>
              </div>

              {/* Stay Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Stay Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">📥 Check-in:</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {bookingData.checkInDate
                        ? new Date(bookingData.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : "N/A"}{" "}
                      at {formData.checkInTime ? (() => {
                        const [hours, minutes] = formData.checkInTime.split(':');
                        const hour = parseInt(hours, 10);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${minutes} ${ampm}`;
                      })() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">📤 Check-out:</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {bookingData.checkOutDate
                        ? new Date(bookingData.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : "N/A"}{" "}
                      at {formData.checkOutTime ? (() => {
                        const [hours, minutes] = formData.checkOutTime.split(':');
                        const hour = parseInt(hours, 10);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${minutes} ${ampm}`;
                      })() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Stay Type:</span>
                    <span className="font-semibold">{formData.stayType || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Guests:</span>
                    <span className="font-semibold">
                      {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        Room Rate
                        {formData.stayType === "Multi-Day Stay" && numberOfDays > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">₱{roomRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Security Deposit</span>
                      <span className="font-semibold">₱{securityDeposit.toLocaleString()}</span>
                    </div>
                    {addOnsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Add-ons</span>
                        <span className="font-semibold">₱{addOnsTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-500">₱{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-green-800">💳 Payment</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Downpayment (Pay Online to Secure Booking)</span>
                      <span className="font-bold text-green-800">₱{downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Remaining Balance (Pay Upon Check-in)</span>
                      <span className="font-bold text-green-800">
                        ₱{(totalAmount - downPayment).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Security deposit is refundable the next day upon
                      checkout if no missing/broken items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Payment Method</h2>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition-colors bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gcash"
                      checked={formData.paymentMethod === "gcash"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary accent-brand-primary"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">GCash</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition-colors bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === "bank"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary accent-brand-primary"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">Bank Transfer</span>
                  </label>
                </div>

                {/* Payment Instructions */}
                {formData.paymentMethod === "gcash" ? (
                  // GCash Payment - Show QR Code
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4">
                      💳 Pay via GCash
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Scan the QR code below to pay your <strong>DOWNPAYMENT of ₱{downPayment}</strong> to
                      secure your booking
                    </p>

                    <div className="bg-white rounded-lg p-8 text-center mb-4">
                      <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">GCash QR Code will be loaded here</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="font-semibold">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open your GCash app</li>
                        <li>Tap &quot;Send Money&quot; or &quot;Pay QR&quot;</li>
                        <li>Scan the QR code above</li>
                        <li>Enter amount: ₱{downPayment}</li>
                        <li>Complete the payment</li>
                        <li>Upload screenshot below</li>
                      </ol>
                    </div>

                    {/* Important Note */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important Note:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Make sure to pay the exact downpayment amount</li>
                        <li>• Screenshot must be clear and show transaction details</li>
                        <li>• Your booking will be confirmed once payment is verified</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Bank Transfer Payment - Show Bank Details
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4">
                      🏦 Pay via Bank Transfer
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Transfer your <strong>DOWNPAYMENT of ₱{downPayment}</strong> to the account below
                    </p>

                    {/* Bank Account Details */}
                    <div className="bg-white rounded-lg p-6 mb-4 space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-medium">Bank Name:</span>
                        <span className="font-bold text-gray-800">BDO Unibank</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-medium">Account Name:</span>
                        <span className="font-bold text-gray-800">Staycation Haven Inc.</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-medium">Account Number:</span>
                        <span className="font-bold text-gray-800">0123-4567-8901</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="font-bold text-green-600 text-xl">₱{downPayment}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="font-semibold">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open your banking app or visit your bank</li>
                        <li>Select &quot;Transfer to Another Account&quot;</li>
                        <li>Enter the bank details above</li>
                        <li>Transfer exactly ₱{downPayment}</li>
                        <li>Save your transaction receipt</li>
                        <li>Upload proof of payment below</li>
                      </ol>
                    </div>

                    {/* Important Note */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important Note:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Transfer the exact downpayment amount to avoid delays</li>
                        <li>• Bank transfers may take 1-3 business days to process</li>
                        <li>• Ensure your proof of payment shows complete transaction details</li>
                        <li>• Include reference number in your upload</li>
                        <li>• Your booking will be confirmed after bank verification</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Upload Proof of Payment */}
                <div className="mt-6" ref={(el) => { errorRefs.current.paymentProof = el; }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📷 Upload Proof of Payment *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    errors.paymentProof ? 'border-red-500 bg-red-50 hover:border-red-600' : 'border-gray-300 hover:border-orange-500'
                  }`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        handleFileChange(e, 'payment');
                        setErrors(prev => ({...prev, paymentProof: ''}));
                      }}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label htmlFor="payment-proof" className="cursor-pointer">
                      <Upload className={`w-12 h-12 mx-auto mb-4 ${errors.paymentProof ? 'text-red-400' : 'text-gray-400'}`} />
                      <p className={`font-medium mb-2 ${errors.paymentProof ? 'text-red-600' : 'text-gray-600'}`}>
                        Click to upload payment screenshot
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                    </label>
                    {formData.paymentProofPreview && (
                      <div className="mt-4">
                        <Image
                          src={formData.paymentProofPreview}
                          alt="Payment proof preview"
                          width={300}
                          height={200}
                          className="max-w-xs mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-green-600 mt-2">✓ File uploaded</p>
                      </div>
                    )}
                  </div>
                  {errors.paymentProof && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.paymentProof}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Important:</strong> Your booking will be pending until the CSR verifies
                    your payment. Please ensure the screenshot clearly shows the transaction amount
                    and details.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Note:</strong> Down payments are non-refundable if you cancel your
                    bookings.
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6" ref={(el) => { errorRefs.current.termsAccepted = el; }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={(e) => {
                      handleInputChange(e);
                      setErrors(prev => ({...prev, termsAccepted: ''}));
                    }}
                    className={`w-5 h-5 mt-1 ${errors.termsAccepted ? 'accent-red-500' : 'accent-brand-primary'}`}
                  />
                  <span className={`text-sm ${errors.termsAccepted ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    I agree to the{" "}
                    <a href="#" className="text-brand-primary dark:text-brand-primary hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-brand-primary dark:text-brand-primary hover:underline">
                      Cancellation Policy
                    </a>
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.termsAccepted}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-brand-primary to-brand-primaryDark hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-3 sm:py-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm to Stay'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Checkout;