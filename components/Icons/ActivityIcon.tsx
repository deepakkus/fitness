import React from 'react';

interface ActivityIconProps {
  height?: string | number;
  width?: string | number;
  stroke?: string;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ height, width, stroke, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={height}
      width={width}
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.7 15c.4-1 .6-2.1.6-3.2 0-4.4-4-8-8-8S4 7.6 4 12c0 1.1.2 2.2.6 3.2" />
    </svg>
  );
};

export default ActivityIcon;