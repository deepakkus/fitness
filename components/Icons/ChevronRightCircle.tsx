import { JSX, SVGProps } from "react";

const ChevronRightCircle = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <path
        d="M10.083 7.79199L13.2913 11.0003L10.083 14.2087"
        strokeWidth="1.46667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.9997 20.1663C16.0624 20.1663 20.1663 16.0624 20.1663 10.9997C20.1663 5.93692 16.0624 1.83301 10.9997 1.83301C5.93692 1.83301 1.83301 5.93692 1.83301 10.9997C1.83301 16.0624 5.93692 20.1663 10.9997 20.1663Z"
        strokeWidth="1.46667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronRightCircle;
