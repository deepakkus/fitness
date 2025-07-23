import React from "react";

import { JSX, SVGProps } from "react";

const Info = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 9.58366V13.7503M10 6.25866L10.0083 6.24949M10 18.3337C14.6025 18.3337 18.3333 14.6028 18.3333 10.0003C18.3333 5.39783 14.6025 1.66699 10 1.66699C5.39751 1.66699 1.66667 5.39783 1.66667 10.0003C1.66667 14.6028 5.39751 18.3337 10 18.3337Z"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Info;
