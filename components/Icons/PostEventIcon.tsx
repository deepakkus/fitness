import { JSX, SVGProps } from "react";

const PostEventIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      {/* Calendar outline */}
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* Calendar top bar */}
      <path
        d="M3 9H21"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* Calendar rings */}
      <path
        d="M8 3V7"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 3V7"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* Event dot */}
      <circle
        cx="8"
        cy="13"
        r="1.2"
        fill="currentColor"
      />
      {/* Event text line */}
      <path
        d="M11 13H16"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default PostEventIcon;
