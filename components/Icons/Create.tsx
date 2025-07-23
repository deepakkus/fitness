import { JSX, SVGProps } from "react";

const Create = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="Frame">
        <path
          id="Vector"
          d="M7.33337 11.0002H11M11 11.0002H14.6667M11 11.0002V7.3335M11 11.0002V14.6668M11 20.1668C16.0628 20.1668 20.1667 16.0629 20.1667 11.0002C20.1667 5.93741 16.0628 1.8335 11 1.8335C5.93729 1.8335 1.83337 5.93741 1.83337 11.0002C1.83337 16.0629 5.93729 20.1668 11 20.1668Z"
          stroke="#64748B"
          strokeWidth="1.46667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default Create;
