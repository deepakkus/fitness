import { JSX, SVGProps } from "react";

const Plus = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={25} height={25} viewBox="0 0 25 25" fill="none" {...props}>
      <path d="M8.25 12.5H16.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.25 16.5V8.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M9.25 22.5H15.25C20.25 22.5 22.25 20.5 22.25 15.5V9.5C22.25 4.5 20.25 2.5 15.25 2.5H9.25C4.25 2.5 2.25 4.5 2.25 9.5V15.5C2.25 20.5 4.25 22.5 9.25 22.5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Plus;
