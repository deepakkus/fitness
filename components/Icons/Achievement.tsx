import { JSX, SVGProps } from "react";

const Achievement = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M11.8934 8.704L15 1.6665M7.76335 8.85984L4.16669 1.6665M10.6342 8.37317L7.36252 1.6665M11.9667 1.6665L11.1 3.74984M5.00002 13.3332C5.00002 14.6593 5.5268 15.931 6.46449 16.8687C7.40217 17.8064 8.67394 18.3332 10 18.3332C11.3261 18.3332 12.5979 17.8064 13.5356 16.8687C14.4732 15.931 15 14.6593 15 13.3332C15 12.0071 14.4732 10.7353 13.5356 9.79764C12.5979 8.85996 11.3261 8.33317 10 8.33317C8.67394 8.33317 7.40217 8.85996 6.46449 9.79764C5.5268 10.7353 5.00002 12.0071 5.00002 13.3332Z"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Achievement;
