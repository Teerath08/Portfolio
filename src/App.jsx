import { useState, useEffect } from "react";
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

export default function App() {
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("portfolio_profile_pic") || null;
  });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSaveProfileImage = (newImage) => {
    setProfileImage(newImage);
    if (newImage) {
      localStorage.setItem("portfolio_profile_pic", newImage);
    } else {
      localStorage.removeItem("portfolio_profile_pic");
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem("portfolio_profile_pic");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Navbar profileImage={profileImage} />
      <main>
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
