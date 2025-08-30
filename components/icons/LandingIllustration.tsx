import React from 'react';

const LandingIllustration: React.FC = () => (
  <svg className="w-40 h-40 md:w-56 md:h-56 animate-float-slow" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="20" y="40" width="160" height="110" rx="8" fill="#FFFFFF" stroke="#1E1E1E" strokeWidth="4" />
    <rect x="32" y="54" width="60" height="12" rx="2" fill="#FBBF24" stroke="#1E1E1E" strokeWidth="2" />
    <rect x="32" y="76" width="120" height="12" rx="2" fill="#F8F1E4" stroke="#1E1E1E" strokeWidth="2" />
    <rect x="32" y="98" width="100" height="12" rx="2" fill="#F8F1E4" stroke="#1E1E1E" strokeWidth="2" />
    <circle cx="160" cy="120" r="16" fill="#FBBF24" stroke="#1E1E1E" strokeWidth="4" />
    <path d="M152 120l6 6 10-12" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default LandingIllustration;

