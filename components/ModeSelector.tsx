import React from 'react';
import { AiMode } from '../types';

interface ModeSelectorProps {
    selectedMode: AiMode;
    onModeChange: (mode: AiMode) => void;
}

const descriptions: Record<AiMode, string> = {
    [AiMode.SwiftSwim]: "Fast, accurate responses for general tasks.",
    [AiMode.DeepSwim]: "Leverages advanced reasoning and search for the most detailed, nuanced, and accurate answers to complex topics.",
    [AiMode.ImageAnalysis]: "Understand and discuss the content of an image.",
    [AiMode.VideoAnalysis]: "Extract key information from a video file.",
    [AiMode.ImageGeneration]: "Create a new image from a text description.",
    [AiMode.SearchGrounding]: "Get up-to-date info from the web.",
    [AiMode.MapsGrounding]: "Find place information and get location-based answers.",
};


const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <label htmlFor="ai-mode-select" className="font-bold text-lg whitespace-nowrap">
                Xylax AI <span className="text-pink-500">Mode</span>
            </label>
            <div className="relative w-full sm:w-auto">
                <select
                    id="ai-mode-select"
                    value={selectedMode}
                    onChange={(e) => onModeChange(e.target.value as AiMode)}
                    className="appearance-none w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5 pr-10"
                >
                    {Object.values(AiMode).map(mode => (
                        <option key={mode} value={mode}>
                            {mode}
                        </option>
                    ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">{descriptions[selectedMode]}</p>
        </div>
    );
};

export default ModeSelector;