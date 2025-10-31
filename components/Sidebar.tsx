import React from 'react';
import { Conversation } from '../types';

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onNewChat: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, activeConversationId, onNewChat, onSelectConversation, onDeleteConversation, isOpen }) => {
    
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent selecting the conversation when deleting
        if (window.confirm("Are you sure you want to delete this chat?")) {
            onDeleteConversation(id);
        }
    };
    
    return (
        <aside className={`flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Conversations</h2>
            </div>
            <button
                onClick={onNewChat}
                className="w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors mb-4 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                New Chat
            </button>
            <div className="flex-1 overflow-y-auto -mr-4 pr-2">
                 <ul className="space-y-2">
                    {conversations.map(convo => (
                        <li key={convo.id} className="relative group">
                            <button
                                onClick={() => onSelectConversation(convo.id)}
                                className={`w-full text-left text-sm p-2 rounded-md truncate transition-colors ${
                                    activeConversationId === convo.id 
                                    ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300 pr-8' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 pr-8'
                                }`}
                            >
                                {convo.title}
                            </button>
                             <button
                                onClick={(e) => handleDelete(e, convo.id)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete conversation"
                            >
                                <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;