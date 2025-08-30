import React from 'react';
import { Screen } from '../types';
import ChatIcon from './icons/ChatIcon';
import TaxesIcon from './icons/TaxesIcon';
import InvestmentsIcon from './icons/InvestmentsIcon';
import ProfileIcon from './icons/ProfileIcon';


interface BottomNavProps {
  activeScreen: Screen;
  onScreenSelect: (screen: Screen) => void;
}

const navItems = [
  { screen: Screen.CHAT, label: 'Chat', icon: ChatIcon },
  { screen: Screen.TAXES, label: 'Taxes', icon: TaxesIcon },
  { screen: Screen.INVESTMENTS, label: 'Investments', icon: InvestmentsIcon },
  { screen: Screen.CURRENCY_CONVERTER, label: 'Currency', icon: () => <span className="text-xl">💱</span> },
  { screen: Screen.PROFILE, label: 'Profile', icon: ProfileIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onScreenSelect }) => {
  return (
    <nav className="bg-brand-bg border-t-4 border-brand-text">
      <div className="max-w-4xl mx-auto flex justify-around">
        {navItems.map(({ screen, label, icon: Icon }) => {
          const isActive = activeScreen === screen;
          const textColor = isActive ? 'text-brand-accent' : 'text-brand-text';
          
          return (
            <button
              key={screen}
              onClick={() => onScreenSelect(screen)}
              className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-bold transition-colors duration-200 hover:text-brand-accent active:scale-90 ${textColor}`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              <span className="mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;