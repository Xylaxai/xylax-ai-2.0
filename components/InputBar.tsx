import React, { useState, useRef, useCallback } from 'react';
import { AiMode } from '../types';
import Spinner from './Spinner';

interface InputBarProps {
    onSend: (prompt: string, files: File[]) => void;
    isLoading: boolean;
    aiMode: AiMode;
    isLive: boolean;
    toggleLiveSession: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSend, isLoading, aiMode, isLive, toggleLiveSession }) => {
    const [prompt, setPrompt] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(prev => [...prev, ...selectedFiles]);
        
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setFilePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleSendClick = () => {
        onSend(prompt, files);
        setPrompt('');
        setFiles([]);
        filePreviews.forEach(URL.revokeObjectURL);
        setFilePreviews([]);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendClick();
        }
    };
    
    const isMediaMode = aiMode === AiMode.ImageAnalysis || aiMode === AiMode.VideoAnalysis;
    const mediaAcceptType = aiMode === AiMode.ImageAnalysis ? 'image/*' : aiMode === AiMode.VideoAnalysis ? 'video/*' : 'image/*,video/*,application/pdf,.doc,.docx,.txt';


    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 flex flex-col">
                {filePreviews.length > 0 && (
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">ATTACHMENTS</span>
                            <button onClick={() => { setFiles([]); filePreviews.forEach(URL.revokeObjectURL); setFilePreviews([]); }} className="text-xs text-pink-500 hover:underline">Clear</button>
                        </div>
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                            {files.map((file, index) => (
                                <div key={index} className="flex-shrink-0 relative">
                                    {file.type.startsWith('image/') ? (
                                        <img src={filePreviews[index]} alt={file.name} className="h-20 w-20 object-cover rounded-md" />
                                    ) : (
                                        <div className="h-20 w-28 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="text-xs truncate w-full">{file.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex items-end">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept={mediaAcceptType}/>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                        aria-label="Attach file"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <button
                        onClick={toggleLiveSession}
                        className={`p-2 transition-colors ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-pink-500'}`}
                        aria-label={isLive ? 'Stop voice session' : 'Start voice session'}
                        disabled={isMediaMode}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message Xylax AI (${aiMode})...`}
                        className="flex-1 bg-transparent p-2 resize-none outline-none max-h-40 custom-textarea"
                        rows={1}
                        disabled={isLoading || isLive}
                    />
                    <button
                        onClick={handleSendClick}
                        disabled={isLoading || (!prompt.trim() && files.length === 0)}
                        className="bg-pink-500 text-white rounded-lg p-2 hover:bg-pink-600 disabled:bg-pink-300 dark:disabled:bg-gray-600 transition-colors disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        {isLoading ? <Spinner className="text-white"/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                    </button>
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">Powered by Xylax AI Technology</p>
        </div>
    );
};

export default InputBar;
