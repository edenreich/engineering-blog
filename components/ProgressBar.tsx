import React from 'react';

interface ProgressBarProps {
  color: string;
  label: string;
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ color, label, value }) => {
  const containerStyles = {
    height: '10px',
    width: '100%',
    backgroundColor: '#e0e0de',
    borderRadius: '20px',
    margin: '8px 0'
  };

  const fillerStyles = {
    height: '100%',
    width: `${value}%`,
    backgroundColor: color,
    borderRadius: 'inherit',
    textAlign: 'right' as const,
    transition: 'width 0.5s ease-in-out'
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div style={containerStyles}>
        <div style={fillerStyles} />
      </div>
    </div>
  );
};

export default ProgressBar;
