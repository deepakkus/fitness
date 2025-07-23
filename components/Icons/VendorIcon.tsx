import { JSX, SVGProps } from "react";

const VendorIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 9.5L4.5 4.5C4.77614 3.67157 5.67157 3 6.5 3H17.5C18.3284 3 19.2239 3.67157 19.5 4.5L21 9.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
};

export default VendorIcon; 