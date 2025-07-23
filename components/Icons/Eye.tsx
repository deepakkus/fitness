import { JSX, SVGProps } from "react";

const Eye = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="Frame">
        <path
          id="Vector"
          d="M17.875 14.6668L15.6062 11.5538M11 16.0418V12.8335M4.125 14.6668L6.38825 11.5612M2.75 7.3335C6.05 14.6668 15.95 14.6668 19.25 7.3335"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default Eye;
