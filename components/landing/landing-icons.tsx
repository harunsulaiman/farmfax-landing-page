import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconPondProfile(props: IconProps): React.JSX.Element {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M4 14c2.5-3 5-4.5 8-4.5s5.5 1.5 8 4.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M3 17h18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <ellipse
        cx={12}
        cy={10}
        rx={5}
        ry={2.5}
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function IconFeedCredit(props: IconProps): React.JSX.Element {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <rect
        x={4}
        y={6}
        width={16}
        height={12}
        rx={2}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconVerifiedDelivery(props: IconProps): React.JSX.Element {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M5 8h14l-1.5 9H6.5L5 8z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx={9} cy={19} r={1.25} fill="currentColor" />
      <circle cx={16} cy={19} r={1.25} fill="currentColor" />
      <path
        d="M9 11l2 2 4-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronDown(props: IconProps): React.JSX.Element {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
