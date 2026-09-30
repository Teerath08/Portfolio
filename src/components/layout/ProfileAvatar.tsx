"use client";

import { Camera } from "lucide-react";
import { personalInfo } from "@/data";
import { useProfilePhoto } from "@/components/layout/PhotoProvider";
import { cn } from "@/lib/cn";

interface ProfileAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  /** Wraps the avatar in a button that opens the photo editor. */
  interactive?: boolean;
  /** Shows the camera affordance on hover. Implied by `interactive`. */
  hint?: boolean;
  /** Rendered as a decorative mark — used in the navbar. */
  decorative?: boolean;
  className?: string;
}

const SIZES = {
  xs: "h-7 w-7 text-[10px] rounded-lg",
  sm: "h-9 w-9 text-xs rounded-xl",
  md: "h-16 w-16 text-lg rounded-2xl sm:h-20 sm:w-20 sm:text-xl",
  lg: "h-40 w-40 text-4xl rounded-3xl sm:h-52 sm:w-52 sm:text-5xl",
} as const;

/**
 * The profile avatar.
 *
 * Three states, in order of preference: the photo the visitor has set, the
 * monogram. Because the photo is read from localStorage after hydration, the
 * monogram is what the server renders — so this never causes a layout shift.
 *
 * Kept as its own small client component so the sections that use it stay
 * server components.
 */
export default function ProfileAvatar({
  size = "md",
  interactive = true,
  hint,
  decorative = false,
  className,
}: ProfileAvatarProps) {
  const { image, ready, openEditor } = useProfilePhoto();
  const showHint = hint ?? interactive;

  const frame = cn(
    // `block` is load-bearing. A bare `span` is inline, and width/height do not
    // apply to a non-replaced inline box — so outside a flex or grid parent the
    // frame would size to its content, `overflow-hidden` would be inert on an
    // inline box, and the photo inside would fall back to its intrinsic size.
    "relative block shrink-0 overflow-hidden border border-line/12 bg-surface2",
    "font-mono font-semibold tracking-tight text-accent",
    SIZES[size],
    className,
  );

  const content = image && ready ? (
    // eslint-disable-next-line @next/next/no-img-element -- a user-supplied data URL; next/image adds nothing here
    <img
      src={image}
      alt={decorative ? "" : `${personalInfo.name} — profile photo`}
      width={512}
      height={512}
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <span aria-hidden="true" className="grid h-full w-full place-items-center">
      {personalInfo.initials}
    </span>
  );

  if (!interactive) return <span className={frame}>{content}</span>;

  return (
    <button
      type="button"
      onClick={openEditor}
      title={image ? "Change profile photo" : "Add a profile photo"}
      aria-label={image ? "Change profile photo" : "Add a profile photo"}
      className={cn(
        "group relative block transition-transform duration-300 ease-out hover:scale-[1.02]",
        "focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-canvas",
      )}
    >
      <span className={frame}>{content}</span>

      {showHint && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 grid place-items-center bg-canvas/75 text-accent opacity-0 backdrop-blur-[2px]",
            "transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          <Camera size={size === "lg" ? 28 : 18} strokeWidth={1.75} />
        </span>
      )}
    </button>
  );
}