import React from 'react';
import { Persona } from '../types';

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onSelectPersona }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">I am a:</span>
      <div className="flex border-2 border-brand-text shadow-hard">
        {(Object.values(Persona) as Persona[]).map((persona) => (
          <button
            key={persona}
            onClick={() => onSelectPersona(persona)}
            className={`px-4 py-2 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent ${
              selectedPersona === persona
                ? 'bg-brand-accent text-brand-text'
                : 'bg-brand-bg text-brand-text hover:bg-brand-accent/50'
            }`}
          >
            {persona}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonaSelector;