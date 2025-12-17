import SearchBarSticky from "@/Components/HeroSection/SearchBarSticky";
import HotelRoomListings from "@/Components/Rooms/HotelRoomListings";
import Footer from "@/Components/Footer";

export default function RoomsPage() {
  return (
    <>
      <SearchBarSticky />
      {/* Add top padding to account for fixed header + sticky search bar - responsive sizing */}
      <div className="pt-[280px] sm:pt-[320px] md:pt-[400px] lg:pt-[450px]">
        <HotelRoomListings />
      </div>
      <Footer />
    </>
  )
}