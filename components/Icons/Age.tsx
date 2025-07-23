import { JSX, SVGProps } from "react";

const Age = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width={18} height={18} fill="none" {...props}>
      <path
        d="M5.2125 13.2187L4.5 12.5062L8.025 8.98124L4.5 5.45624L5.2125 4.74374L9.45 8.98124L5.2125 13.2187ZM12.375 13.3125V4.64999H13.3875V13.3125H12.375Z"
        fill="#EA580C"
      />
    </svg>
  );
};

export default Age;
