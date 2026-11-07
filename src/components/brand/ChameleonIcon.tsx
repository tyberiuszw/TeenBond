import React from 'react';

interface ChameleonIconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const ChameleonIcon: React.FC<ChameleonIconProps> = ({
  color = 'currentColor',
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stylized sleek chameleon silhouette with curled tail and crest */}
      <path
        d="M32 10C30 7 26 5 22 5C14.268 5 8 11.268 8 19C8 22.5 9.3 25.7 11.5 28.1C10 30.5 8 33 5 35C3.5 36 4 39 6.5 39.5C9.5 40.1 13 39 16 36.5C17.8 37.5 19.8 38 22 38C29.732 38 36 31.732 36 24C36 21 34.8 18.3 33 16.2C35 15.5 38 15 41 17C43 18.3 45 17 44.5 14.5C44 12 40 9 32 10Z"
        fill={color}
        fillOpacity="0.2"
      />
      <path
        d="M22 6C14.82 6 9 11.82 9 19C9 22.3 10.2 25.3 12.3 27.6L11 31C10.2 33 8.5 34.5 6.5 35.8C5 36.8 5.6 39.2 7.4 39.5C10.2 40 13.5 39 16.2 36.8L18.5 37.5C19.6 37.8 20.8 38 22 38C29.18 38 35 32.18 35 25C35 22.2 34.1 19.6 32.5 17.5C35.2 16.8 38.5 16.5 41.5 18C43.2 18.8 44.8 17.2 44.2 15.3C43.2 12.2 39 8.8 32 9.8C29.3 7.4 25.8 6 22 6Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eye */}
      <circle cx="28" cy="18" r="4" stroke={color} strokeWidth="2.5" fill="#0F172A" />
      <circle cx="29" cy="17" r="1.5" fill={color} />
      {/* Tongue / playful curl */}
      <path
        d="M33 24C37 24 40 26 42 29"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
};
