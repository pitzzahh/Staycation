import FAQs from "@/Components/FAQs";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Staycation Haven | FAQs",
  description: "Find quick answers to common questions about Staycation Haven services, booking policies, and amenities.",
};

const FAQsPage = () => {
  return <FAQs />;
};

export default FAQsPage;
