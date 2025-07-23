import { JSX, SVGProps } from "react";

const Map = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M14.6666 5.99968V9.99968C14.6666 11.6664 14.3333 12.833 13.5866 13.5864L9.33325 9.33302L14.4866 4.17969C14.6066 4.70635 14.6666 5.30635 14.6666 5.99968Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4866 4.17968L4.17991 14.4863C2.17324 14.0263 1.33325 12.6397 1.33325 9.99967V5.99967C1.33325 2.66634 2.66659 1.33301 5.99992 1.33301H9.99992C12.6399 1.33301 14.0266 2.17301 14.4866 4.17968Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5866 13.5863C12.8333 14.333 11.6666 14.6663 9.99994 14.6663H5.99994C5.30661 14.6663 4.7066 14.6063 4.17993 14.4863L9.33327 9.33301L13.5866 13.5863Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.15993 5.32047C4.61326 3.36714 7.5466 3.36714 7.99994 5.32047C8.25994 6.46714 7.53993 7.44047 6.90659 8.04047C6.44659 8.48047 5.71994 8.48047 5.25327 8.04047C4.61994 7.44047 3.89326 6.46714 4.15993 5.32047Z" />
      <path d="M6.06307 5.80013H6.06906" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Map;
