import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { AiMode, Message, Theme, Conversation } from './types';
import * as geminiService from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import useLiveAudio from './hooks/useLiveAudio';
import { decode, decodeAudioData } from './utils/audioUtils';
import ModeSelector from './components/ModeSelector';

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('dark');
    const [isLoading, setIsLoading] = useState(false);
    const [aiMode, setAiMode] = useState<AiMode>(AiMode.SwiftSwim);
    const [outputAudioContext, setOutputAudioContext] = useState<AudioContext | null>(null);
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState<'chat' | 'login' | 'signup'>('chat');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [shareStatus, setShareStatus] = useState('');


    // Effect to run on initial component mount
    useEffect(() => {
        const loggedIn = localStorage.getItem('xylax-auth') === 'true';
        setIsAuthenticated(loggedIn);
        
        if (loggedIn) {
            const savedConversations = localStorage.getItem('xylax-conversations');
            const parsedConvos = savedConversations ? JSON.parse(savedConversations) : [];
            if (parsedConvos.length > 0) {
                setConversations(parsedConvos);
                setActiveConversationId(parsedConvos[0].id);
            } else {
                createNewConversation();
            }
        } else {
            // For guest users, create a single, temporary conversation
            createNewConversation();
        }
    }, []);

    // Effect to save conversations to localStorage when they change for authenticated users
     useEffect(() => {
        if(isAuthenticated && conversations.length > 0) {
            localStorage.setItem('xylax-conversations', JSON.stringify(conversations));
        }
    }, [conversations, isAuthenticated]);

    // Effect to initialize the audio context
    useEffect(() => {
        if (!outputAudioContext) {
            setOutputAudioContext(new AudioContext({ sampleRate: 24000 }));
        }
        return () => {
            outputAudioContext?.close();
        };
    }, [outputAudioContext]);

    const { isLive, isInitializing, startLiveSession, stopLiveSession, userTranscript, modelTranscript } = useLiveAudio();

    // Effect to manage the theme class on the HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const messages = activeConversation ? activeConversation.messages : [];

    const createNewConversation = (title: string = "New Chat"): string => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title,
            messages: []
        };
        setConversations(prev => [newConversation, ...prev.filter(c => c.messages.length > 0)]); // Keep previous chats if they have messages
        setActiveConversationId(newConversation.id);
        return newConversation.id;
    };
    
    const handleNewChat = () => {
        createNewConversation();
    };


    const playSpeech = useCallback(async (base64Audio: string) => {
        if (!outputAudioContext) return;
        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }, [outputAudioContext]);

    const handleTts = async (text: string) => {
        if (!text) return;
        try {
            const audioData = await geminiService.textToSpeech(text);
            if (audioData) {
                await playSpeech(audioData);
            }
        } catch (error) {
            console.error('TTS Error:', error);
        }
    };
    
    const handleSend = async (prompt: string, files: File[]) => {
        if (isLoading || (!prompt.trim() && files.length === 0)) return;

        setIsLoading(true);

        // Auto-select AI Mode
        let effectiveAiMode = aiMode;
        if (files.length > 0) {
            const firstFileType = files[0].type;
            if (firstFileType.startsWith('video/')) {
                effectiveAiMode = AiMode.VideoAnalysis;
            } else if (firstFileType.startsWith('image/')) {
                effectiveAiMode = AiMode.ImageAnalysis;
            }
        } else if (/(generate|create|draw|make) an? (image|picture|photo|drawing|logo)/i.test(prompt)) {
            effectiveAiMode = AiMode.ImageGeneration;
        }

        if (effectiveAiMode !== aiMode) {
            setAiMode(effectiveAiMode);
        }
        
        let currentConvoId = activeConversationId;
        if (!currentConvoId) {
             currentConvoId = createNewConversation(prompt.substring(0, 30) || "New Chat");
        } else if (messages.length === 0) {
             setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, title: prompt.substring(0, 30) } : c));
        }

        const userMessageId = Date.now().toString();
        const modelMessageId = (Date.now() + 1).toString();

        const fileParts = await Promise.all(files.map(fileToGenerativePart));
        const fileDataForMessage = files.map(file => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) }));

        const userMessage: Message = { id: userMessageId, role: 'user', content: prompt, files: fileDataForMessage };
        const modelMessage: Message = { id: modelMessageId, role: 'model', content: '', isTyping: true };
        
        setConversations(prevConvos =>
            prevConvos.map(convo => {
                if (convo.id === currentConvoId) {
                    return { ...convo, messages: [...convo.messages, userMessage, modelMessage] };
                }
                return convo;
            })
        );

        try {
            let response;
            let sources;
            let content;

            switch (effectiveAiMode) {
                 case AiMode.SwiftSwim:
                    response = await geminiService.generateTextResponse(prompt, 'gemini-flash-lite-latest');
                    content = `${response.text}\n\nPowered by Xylax API Technology`;
                    break;
                case AiMode.DeepSwim:
                    response = await geminiService.generateTextResponse(prompt, 'gemini-2.5-pro', {
                        thinkingConfig: { thinkingBudget: 32768 },
                        tools: [{ googleSearch: {} }],
                    });
                    sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    content = `${response.text}\n\nPowered by Xylax API Technology`;
                    break;
                case AiMode.SearchGrounding:
                     response = await geminiService.generateTextResponse(prompt, 'gemini-2.5-flash', {
                         tools: [{ googleSearch: {} }],
                     });
                    sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    content = response.text;
                    break;
                case AiMode.MapsGrounding:
                    response = await geminiService.generateTextResponse(prompt, 'gemini-2.5-flash', {
                        tools: [{ googleMaps: {} }],
                    });
                    sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    content = response.text;
                    break;
                case AiMode.ImageAnalysis:
                     if (files.length === 0) throw new Error("Please upload an image for analysis.");
                    response = await geminiService.analyzeMedia(prompt, fileParts, 'gemini-2.5-flash');
                    content = response.text;
                    break;
                case AiMode.VideoAnalysis:
                    if (files.length === 0) throw new Error("Please upload a video for analysis.");
                    response = await geminiService.analyzeMedia(prompt, fileParts, 'gemini-2.5-pro');
                    content = response.text;
                    break;
                case AiMode.ImageGeneration:
                    response = await geminiService.generateImage(prompt);
                    content = response.text;
                    break;
                default:
                    throw new Error("Invalid AI mode selected.");
            }
            
            setConversations(prevConvos => prevConvos.map(convo => {
                if(convo.id === currentConvoId) {
                    return {...convo, messages: convo.messages.map(msg => msg.id === modelMessageId ? { ...msg, content, sources, isTyping: false } : msg)}
                }
                return convo;
            }));


        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             setConversations(prevConvos => prevConvos.map(convo => {
                if(convo.id === currentConvoId) {
                    return {...convo, messages: convo.messages.map(msg => msg.id === modelMessageId ? { ...msg, content: `Error: ${errorMessage}`, isTyping: false } : msg)}
                }
                return convo;
            }));
        } finally {
            setIsLoading(false);
            fileDataForMessage.forEach(file => URL.revokeObjectURL(file.url));
        }
    };
    
    // Auth Handlers
    const handleLogin = () => {
        localStorage.setItem('xylax-auth', 'true');
        setIsAuthenticated(true);
        setCurrentPage('chat');

        // Reload conversations for the logged-in user
        const savedConversations = localStorage.getItem('xylax-conversations');
        const parsedConvos = savedConversations ? JSON.parse(savedConversations) : [];
        if (parsedConvos.length > 0) {
            setConversations(parsedConvos);
            setActiveConversationId(parsedConvos[0].id);
        } else {
            handleNewChat();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('xylax-auth');
        setIsAuthenticated(false);
        // Start a fresh guest session
        createNewConversation();
    };

    const handleDeleteConversation = (id: string) => {
        const remainingConversations = conversations.filter(c => c.id !== id);
        setConversations(remainingConversations);
        if (activeConversationId === id) {
            if (remainingConversations.length > 0) {
                setActiveConversationId(remainingConversations[0].id);
            } else {
                createNewConversation();
            }
        }
    };

    const handleShareConversation = () => {
        if (!activeConversation) return;

        const formattedChat = activeConversation.messages.map(msg => {
            const prefix = msg.role === 'user' ? 'User:' : 'Xylax AI:';
            return `${prefix}\n${msg.content}`;
        }).join('\n\n---\n\n');

        navigator.clipboard.writeText(formattedChat).then(() => {
            setShareStatus('Copied!');
            setTimeout(() => setShareStatus(''), 2000);
        }).catch(err => {
            console.error('Failed to copy chat:', err);
            setShareStatus('Failed to copy');
            setTimeout(() => setShareStatus(''), 2000);
        });
    };

    const LiveStatus = () => {
      if (!isLive && !isInitializing) return null;
      return (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center items-center">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-4 max-w-2xl w-full mx-4">
                <h3 className="font-bold text-lg text-pink-500 flex items-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span></span>
                    Live Conversation
                </h3>
                {isInitializing ? <p>Initializing...</p> : 
                (<div>
                    <p className="font-semibold text-sm">You: <span className="text-gray-600 dark:text-gray-400 italic">{userTranscript || "..."}</span></p>
                    <p className="font-semibold text-sm mt-1">Xylax AI: <span className="text-gray-600 dark:text-gray-400 italic">{modelTranscript || "..."}</span></p>
                </div>)}
            </div>
        </div>
      );
    };

    if (currentPage === 'login') return <LoginPage onLogin={handleLogin} onNavigateToSignUp={() => setCurrentPage('signup')} onBack={() => setCurrentPage('chat')} />;
    if (currentPage === 'signup') return <SignUpPage onSignUp={handleLogin} onNavigateToLogin={() => setCurrentPage('login')} onBack={() => setCurrentPage('chat')} />;

    return (
        <div className={`flex flex-col h-screen font-sans bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
            <Header 
                theme={theme} 
                setTheme={setTheme} 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
                onNavigateToLogin={() => setCurrentPage('login')}
                onNavigateToSignUp={() => setCurrentPage('signup')}
                showSidebarToggle={isAuthenticated}
                onShareConversation={handleShareConversation}
                shareStatus={shareStatus}
            />
            <main className="flex flex-1 overflow-hidden">
                {isAuthenticated && <Sidebar 
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onNewChat={handleNewChat}
                    onSelectConversation={setActiveConversationId}
                    onDeleteConversation={handleDeleteConversation}
                    isOpen={isSidebarOpen}
                />}
                <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <ModeSelector selectedMode={aiMode} onModeChange={setAiMode} />
                    </div>
                    <ChatWindow messages={messages} onPlaySpeech={handleTts} />
                    <LiveStatus />
                    <InputBar
                        onSend={handleSend}
                        isLoading={isLoading}
                        aiMode={aiMode}
                        isLive={isLive}
                        toggleLiveSession={isLive ? stopLiveSession : startLiveSession}
                     />
                </div>
            </main>
        </div>
    );
};

export default App;