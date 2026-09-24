import { useState } from "react";
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
import ThunderOverlay from "./components/ThunderOverlay";
import ThunderQuickNav from "./components/ThunderQuickNav";

export default function App() {
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("portfolio_profile_pic") || null;
  });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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
      } catch (err) {}
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    try {
      localStorage.removeItem("portfolio_profile_pic");
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-red-600 selection:text-white relative">
      {/* Global Interactive Thunder Lightning Overlay */}
      <ThunderOverlay />

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

      {/* Floating 3D Thunder Navigation HUD */}
      <ThunderQuickNav />

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
