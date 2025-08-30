import React from 'react';
import { Persona } from '../types';
import { SUGGESTED_TOPICS } from '../constants';

interface SuggestedTopicsProps {
  persona: Persona;
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
}

const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({ persona, onSelectTopic, isLoading }) => {
  const topics = SUGGESTED_TOPICS[persona];

  return (
    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap px-2">
      <span className="text-sm text-brand-text/80 mr-2 shrink-0">Try asking:</span>
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelectTopic(topic)}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 ease-in-out hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          aria-label={`Send suggestion: ${topic}`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default SuggestedTopics;