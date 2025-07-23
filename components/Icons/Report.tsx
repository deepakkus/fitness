import { JSX, SVGProps } from "react";

const Report = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <path
        d="M3.55 13.0833L4.42083 3.5005C4.4332 3.36369 4.49631 3.23646 4.59775 3.14383C4.6992 3.05121 4.83163 2.9999 4.969 3H17.6144C17.6909 2.99994 17.7665 3.01582 17.8364 3.04662C17.9064 3.07741 17.9691 3.12245 18.0207 3.17886C18.0723 3.23527 18.1115 3.3018 18.136 3.37423C18.1604 3.44665 18.1695 3.52338 18.1626 3.5995L17.3458 12.5828C17.3335 12.7196 17.2704 12.8469 17.1689 12.9395C17.0675 13.0321 16.935 13.0834 16.7977 13.0833H3.55ZM3.55 13.0833L3 18.5833"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Report;
