import React from "react";

import { JSX, SVGProps } from "react";

const TickMark = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 10" fill="none" {...props}>
      <path
        d="M1.25 5L4.682 8.432C4.76638 8.51627 4.88075 8.5636 5 8.5636C5.11925 8.5636 5.23362 8.51627 5.318 8.432L12.5 1.25"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TickMark;
