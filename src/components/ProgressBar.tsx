import React from "react";

interface ProgressBarProps {
  color: string;
  label: string;
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ color, label, value }) => {
  const progressWidth = `${value}%`;

  return (
    <div className="p-2 mt-5 w-full">
      <span>{label}</span>
      <svg className="h-4 w-full bg-gray-200 rounded mt-2">
        <rect fill={color} width={progressWidth} height="100%" />
      </svg>
    </div>
  );
};

export default ProgressBar;
