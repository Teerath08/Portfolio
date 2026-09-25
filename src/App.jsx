"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Achievements from "./components/Achievements";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ProfileImageModal from "./components/ProfileImageModal";
import QuickNav from "./components/ThunderQuickNav";

export default function App() {
  const [profileImage, setProfileImage] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    try {
      // The saved avatar lives in localStorage, so it can only be read after hydration.
      // oxlint-disable-next-line react/set-state-in-effect
      setProfileImage(localStorage.getItem("portfolio_profile_pic") || null);
    } catch (error) {
      console.warn("Failed to load profile image from localStorage", error);
    }
  }, []);

  const handleSaveProfileImage = (newImage) => {
    setProfileImage(newImage);
    if (newImage) {
      try {
        localStorage.setItem("portfolio_profile_pic", newImage);
      } catch (err) {
        console.warn("Failed to persist to localStorage", err);
      }
    } else {
      try {
        localStorage.removeItem("portfolio_profile_pic");
      } catch {}
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    try {
      localStorage.removeItem("portfolio_profile_pic");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-red-600 selection:text-white relative transition-colors duration-300">
      {/* Navigation */}
      <Navbar profileImage={profileImage} />

      <main className="relative z-10">
        <Hero
          profileImage={profileImage}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        />
        <About
          profileImage={profileImage}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        />
        <Education />
        <Skills />
        <Projects />
        <Achievements />
        <Contact />
      </main>

      <Footer />

      {/* Bottom Quick Navigation Pill */}
      <QuickNav />

      {/* Profile Photo Crop & Upload Modal */}
      <ProfileImageModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentImage={profileImage}
        onSave={handleSaveProfileImage}
        onRemove={handleRemoveProfileImage}
      />
    </div>
  );
}
