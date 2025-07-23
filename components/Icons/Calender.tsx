import { JSX, SVGProps } from "react";

const Calender = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M5.33331 1.33301V3.33301"
        strokeWidth="1"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 1.33301V3.33301"
        strokeWidth="1"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 2.33301C12.8867 2.45301 14 3.29967 14 6.43301V10.553C14 13.2997 13.3333 14.673 10 14.673H6C2.66667 14.673 2 13.2997 2 10.553V6.43301C2 3.29967 3.11333 2.45967 5.33333 2.33301H10.6667Z"
        strokeWidth="1"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8334 11.7334H2.16669"
        strokeWidth="1"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        strokeWidth="1"
        d="M7.99998 5.5C7.17998 5.5 6.48665 5.94667 6.48665 6.81333C6.48665 7.22667 6.67998 7.54 6.97331 7.74C6.56665 7.98 6.33331 8.36667 6.33331 8.82C6.33331 9.64667 6.96665 10.16 7.99998 10.16C9.02665 10.16 9.66665 9.64667 9.66665 8.82C9.66665 8.36667 9.43331 7.97333 9.01998 7.74C9.31998 7.53333 9.50665 7.22667 9.50665 6.81333C9.50665 5.94667 8.81998 5.5 7.99998 5.5ZM7.99998 7.39333C7.65331 7.39333 7.39998 7.18667 7.39998 6.86C7.39998 6.52667 7.65331 6.33333 7.99998 6.33333C8.34665 6.33333 8.59998 6.52667 8.59998 6.86C8.59998 7.18667 8.34665 7.39333 7.99998 7.39333ZM7.99998 9.33333C7.55998 9.33333 7.23998 9.11333 7.23998 8.71333C7.23998 8.31333 7.55998 8.1 7.99998 8.1C8.43998 8.1 8.75998 8.32 8.75998 8.71333C8.75998 9.11333 8.43998 9.33333 7.99998 9.33333Z"
      />
    </svg>
  );
};

export default Calender;
