import React from "react";

import { JSX, SVGProps } from "react";

const Filter = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <path d="M19.25 16.5V19.25H17.4167V16.5H15.5834V14.6667H21.0834V16.5H19.25ZM4.58335 16.5V19.25H2.75002V16.5H0.916687V14.6667H6.41669V16.5H4.58335ZM10.0834 5.5V2.75H11.9167V5.5H13.75V7.33333H8.25002V5.5H10.0834ZM10.0834 9.16667H11.9167V19.25H10.0834V9.16667ZM2.75002 12.8333V2.75H4.58335V12.8333H2.75002ZM17.4167 12.8333V2.75H19.25V12.8333H17.4167Z" />
    </svg>
  );
};

export default Filter;
