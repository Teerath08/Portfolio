import type { ComponentType, ReactNode, SVGProps } from "react";

/**
 * Brand marks.
 *
 * Hand-drawn rather than pulled from an icon library: brand logos are the one
 * thing a general-purpose icon set cannot ship (the marks are trademarked, and
 * lucide removed them in v1 for that reason). These are simple `currentColor`
 * filled paths, so they inherit whatever accent the surrounding component uses.
 *
 * The prop signature deliberately mirrors lucide's (`size`, `strokeWidth`,
 * `className`) so these can sit in the same array as lucide icons without the
 * caller needing to know which is which. `strokeWidth` is accepted for
 * signature parity and ignored — the paths are filled, not stroked.
 */

export interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: string | number;
  strokeWidth?: string | number;
}

/** Anything that can be rendered as `<Icon size={16} strokeWidth={1.8} />`. */
export type IconComponent = ComponentType<BrandIconProps>;

function BrandSvg({ size = 24, strokeWidth, children, ...rest }: BrandIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function GitHubIcon(props: BrandIconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </BrandSvg>
  );
}

export function LinkedInIcon(props: BrandIconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </BrandSvg>
  );
}

export function XIcon(props: BrandIconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </BrandSvg>
  );
}
