
import React, { useState } from 'react';

interface CodeBlockProps {
    children: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => {
    const [isCopied, setIsCopied] = useState(false);

    const match = /language-(\w+)/.exec(children) || [];
    const lang = match[1] || '';
    const code = children.replace(/```[\w\s]*\n/, '').replace(/\n```$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-black/80 dark:bg-gray-900/80 rounded-lg my-4 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 dark:bg-gray-700 text-xs text-gray-300">
                <span>{lang || 'code'}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    {isCopied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-white"><code className={`language-${lang}`}>{code}</code></pre>
        </div>
    );
};

export default CodeBlock;
