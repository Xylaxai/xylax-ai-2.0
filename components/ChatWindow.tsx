import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
    messages: Message[];
    onPlaySpeech: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onPlaySpeech }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <h1 className="text-4xl font-bold mb-4">Xylax AI</h1>
                    <p className="text-lg">Your agentic AI expert chat. How can I help you today?</p>
                </div>
            ) : (
                messages.map(message => (
                    <MessageBubble key={message.id} message={message} onPlaySpeech={onPlaySpeech} />
                ))
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatWindow;
