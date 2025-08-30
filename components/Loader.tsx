import React from 'react';
import './loader.css';

interface LoaderProps {
  size?: 'sm' | 'md';
}

const Loader: React.FC<LoaderProps> = ({ size = 'md' }) => {
  return (
    <div className={`uiverse-loader ${size === 'sm' ? 'uiverse-loader--sm' : ''}`} aria-label="Loading" role="status">
      <span className="uiverse-loader__dot" />
      <span className="uiverse-loader__dot" />
      <span className="uiverse-loader__dot" />
      <span className="uiverse-loader__dot" />
    </div>
  );
};

export default Loader;

