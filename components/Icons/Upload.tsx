import { JSX, SVGProps } from "react";

const Upload = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill="none" {...props}>
      <path
        d="M12 22V13M12 13L15.5 16.5M12 13L8.5 16.5M20 17.607C21.494 17.022 23 15.689 23 13C23 9 19.667 8 18 8C18 6 18 2 12 2C6 2 6 6 6 8C4.333 8 1 9 1 13C1 15.689 2.506 17.022 4 17.607"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Upload;
