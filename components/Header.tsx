import React from 'react';
import type { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onToggleSidebar: () => void;
    isAuthenticated: boolean;
    onLogout: () => void;
    onNavigateToLogin: () => void;
    onNavigateToSignUp: () => void;
    showSidebarToggle: boolean;
    onShareConversation: () => void;
    shareStatus: string;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onToggleSidebar, isAuthenticated, onLogout, onNavigateToLogin, onNavigateToSignUp, showSidebarToggle, onShareConversation, shareStatus }) => {
    return (
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
                {showSidebarToggle && (
                    <button onClick={onToggleSidebar} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden" aria-label="Toggle sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                )}
                <h1 className="text-xl font-bold">
                    <span className="text-pink-500">Xylax</span> AI
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 {isAuthenticated && (
                     <button onClick={onShareConversation} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                        {shareStatus ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {shareStatus}
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                Share
                            </>
                        )}
                    </button>
                )}
                {isAuthenticated ? (
                     <button onClick={onLogout} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Log Out</button>
                ) : (
                    <>
                        <button onClick={onNavigateToLogin} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Log In</button>
                        <button onClick={onNavigateToSignUp} className="px-4 py-2 text-sm font-medium rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors">Sign Up</button>
                    </>
                )}
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;