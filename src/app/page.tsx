'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExpandableGallery from "@/components/ExpandableGallery";
import PropertySearch from "@/components/PropertySearch";
import AboutUs from "@/components/AboutUs";
import OfficeContactCards from "@/components/OfficeContactCards";
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen pointer-events-auto">
      <Hero />
            <PropertySearch />

      <ExpandableGallery />
      <AboutUs />
      <OfficeContactCards />
      <Footer />
    </div>
  );
}
