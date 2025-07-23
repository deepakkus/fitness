import { JSX, SVGProps } from "react";

const LeftArrow = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <path
        d="M19.25 10.9999H2.75M2.75 10.9999L10.5417 3.20825M2.75 10.9999L10.5417 18.7916"
        stroke="#334155"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LeftArrow;
