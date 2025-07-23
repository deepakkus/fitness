import { JSX, SVGProps } from "react";

const Messages = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="Frame">
        <path
          id="Vector"
          d="M7.33337 9.16683H14.6667M7.33337 12.8335H11M11 20.1668C16.0628 20.1668 20.1667 16.0629 20.1667 11.0002C20.1667 5.93741 16.0628 1.8335 11 1.8335C5.93729 1.8335 1.83337 5.93741 1.83337 11.0002C1.83337 12.6694 2.27979 14.236 3.05987 15.5835L2.29171 19.7085L6.41671 18.9403C7.80962 19.7461 9.39084 20.1693 11 20.1668Z"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default Messages;
