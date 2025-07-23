import React from "react";

import { JSX, SVGProps } from "react";

const ChevronDown2 = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <path d="M5.5 8.25L11 13.75L16.5 8.25" strokeWidth="1.375" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ChevronDown2;
