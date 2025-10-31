import React, { useState } from 'react';
import { Message } from '../types';
import Spinner from './Spinner';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
    message: Message;
    onPlaySpeech: (text: string) => void;
}


const renderMessageContent = (message: Message) => {
    const content = message.content;
    const parts = content.split(/(```[\w\s]*\n[\s\S]*?\n```)/g);

    const renderedParts = parts.map((part, index) => {
        if (part.startsWith('```')) {
            return <CodeBlock key={index}>{part}</CodeBlock>;
        }
        const cleanedPart = part.replace(/[*#]/g, '');
        return cleanedPart.split('\n').map((line, i) => (
            <React.Fragment key={`${index}-${i}`}>{line}{i < part.split('\n').length - 1 && <br />}</React.Fragment>
        ));
    });

    if (content.startsWith('data:image/')) {
        return <img src={content} alt="Generated" className="max-w-sm rounded-lg shadow-md" />;
    }

    return (
        <div>
            {message.files && message.files.length > 0 && (
                <div className="mb-2 flex gap-2 flex-wrap">
                    {message.files.map((file, index) => (
                         file.type.startsWith('image/') ? (
                            <img key={index} src={file.url} alt={file.name} className="max-w-xs max-h-40 rounded-lg" />
                         ) : (
                            <div key={index} className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm text-black dark:text-white">
                                {file.name}
                            </div>
                         )
                    ))}
                </div>
            )}
            <p>{renderedParts}</p>
        </div>
    );
}


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPlaySpeech }) => {
    const isUser = message.role === 'user';
    const hasTextContent = typeof message.content === 'string' && !message.content.startsWith('data:image/');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = (message.content as string).replace(/[*#]/g, '');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} message-bubble-animation group`}>
            {!isUser && (
                <div className="w-10 h-10 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center font-bold text-white">
                    X
                </div>
            )}
            <div className={`max-w-2xl w-fit rounded-2xl p-4 ${isUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none'}`}>
                {message.isTyping ? <Spinner className="text-pink-500" /> : renderMessageContent(message)}
                
                {!isUser && !message.isTyping && hasTextContent && (
                    <div className="flex items-center gap-2 mt-2 -ml-1">
                         <button 
                            onClick={() => onPlaySpeech((message.content as string).replace(/[*#]/g, ''))}
                            className="text-gray-400 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Play message audio"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v4a1 1 0 001 1h12a1 1 0 001-1v-4a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM8 8a2 2 0 114 0v3a2 2 0 11-4 0V8z" /></svg>
                        </button>
                        <button 
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Copy message"
                         >
                            {isCopied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </button>
                    </div>
                )}

                {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2 text-xs">
                        <h4 className="font-bold mb-2">Sources:</h4>
                        <ul className="space-y-1">
                            {message.sources.map((source, index) => {
                                const chunk = source.web || (source.maps && {uri: source.maps.uri, title: source.maps.title});
                                if (!chunk) return null;
                                return (
                                <li key={index}>
                                    <a href={chunk.uri} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline break-all">
                                    {index + 1}. {chunk.title || chunk.uri}
                                    </a>
                                </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center font-bold">
                    U
                </div>
            )}
        </div>
    );
};

export default MessageBubble;