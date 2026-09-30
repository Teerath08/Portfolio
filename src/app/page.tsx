import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Education from "@/components/sections/Education";
import EngineeringMindset from "@/components/sections/EngineeringMindset";
import Experience from "@/components/sections/Experience";
import Hardware from "@/components/sections/Hardware";
import Hero from "@/components/sections/Hero";
import LabNotes from "@/components/sections/LabNotes";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";

import BootOverlay from "@/components/layout/BootOverlay";
import CustomCursor from "@/components/layout/CustomCursor";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ScrollField from "@/components/layout/ScrollField";
import SectionRail from "@/components/layout/SectionRail";
import { PhotoProvider } from "@/components/layout/PhotoProvider";
import PortfolioChat from "@/components/chat/PortfolioChat";

/**
 * The page.
 *
 * A server component, and deliberately so: every section below renders on the
 * server and ships as HTML. The client bundle is only the pieces that need a
 * browser — the navbar, the 3D layers, the theme toggle, the cursor, the chat
 * assistant and the small interactive cards.
 *
 * `PhotoProvider` wraps everything because the avatar appears in the navbar, the
 * hero and the About section, and none of them should own that state.
 */
export default function HomePage() {
  return (
    <PhotoProvider>
      {/*
        First in the tree so it paints underneath everything. It is `fixed`, and
        it has to be a sibling of `main` rather than a child — `main` is
        `position: relative`, which would make it the containing block and give
        the layer the document's height instead of the viewport's.
      */}
      <ScrollField />

      <Navbar />

      <main id="main" className="relative">
        <Hero />
        <About />
        <EngineeringMindset />
        <Projects />
        <Hardware />
        <Skills />
        <Experience />
        <Education />
        <LabNotes />
        <Contact />
      </main>

      <Footer />

      {/* Persistent utilities. */}
      <SectionRail />
      <PortfolioChat />
      <CustomCursor />
      <BootOverlay />
    </PhotoProvider>
  );
}
