"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ProfileImageModal from "@/components/ui/ProfileImageModal";

const STORAGE_KEY = "portfolio_profile_pic";

interface PhotoContextValue {
  /** Data URL of the visitor-set avatar, or null when none is set. */
  image: string | null;
  /** True once the client has read localStorage. */
  ready: boolean;
  openEditor: () => void;
}

const PhotoContext = createContext<PhotoContextValue>({
  image: null,
  ready: false,
  openEditor: () => {},
});

/**
 * Owns the visitor-set profile photo.
 *
 * The avatar lives in localStorage, so it is read after hydration and rendered
 * client-side only; server output shows the monogram, which is a perfectly good
 * fallback and keeps the markup identical on both sides.
 *
 * Wrapped around the page so the avatar can appear in the navbar, the hero and
 * the About section without any of those components owning the state.
 */
export function PhotoProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // oxlint-disable-next-line react/set-state-in-effect -- localStorage only exists after hydration
      setImage(stored || null);
    } catch (error) {
      console.warn("Could not read the saved profile photo", error);
    } finally {
      // oxlint-disable-next-line react/set-state-in-effect
      setReady(true);
    }
  }, []);

  const save = useCallback((next: string | null) => {
    setImage(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Could not persist the profile photo", error);
    }
  }, []);

  const value = useMemo<PhotoContextValue>(
    () => ({ image, ready, openEditor: () => setEditing(true) }),
    [image, ready],
  );

  return (
    <PhotoContext.Provider value={value}>
      {children}
      <ProfileImageModal
        isOpen={editing}
        onClose={() => setEditing(false)}
        currentImage={image}
        onSave={save}
        onRemove={() => save(null)}
      />
    </PhotoContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- a context and its consuming hook belong in the same file.
export function useProfilePhoto() {
  return useContext(PhotoContext);
}