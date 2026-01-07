'use client';
<<<<<<< HEAD
=======
import {Button} from "@nextui-org/button";
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
import { Search } from "lucide-react";

interface SearchButtonProps {
  onSearch: () => void;
}

const SearchButton = ({onSearch}:SearchButtonProps) => {
  return (
<<<<<<< HEAD
    <button
      onClick={onSearch}
      className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryDark border border-brand-primary text-white rounded-full focus:outline-none"
      aria-label="Search"
    >
      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      <span className="text-sm sm:text-base font-semibold">Search</span>
    </button>
=======
    <Button
      onClick={onSearch}
      className="w-full h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
      startContent={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
    >
      Search
    </Button>
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81
  );
};

export default SearchButton;