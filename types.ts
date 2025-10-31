export enum AiMode {
    SwiftSwim = 'Swift Swim (Fast)',
    DeepSwim = 'Deep Swim (Complex)',
    ImageAnalysis = 'Image Analysis',
    VideoAnalysis = 'Video Analysis',
    ImageGeneration = 'Image Generation',
    SearchGrounding = 'Search Grounding',
    MapsGrounding = 'Maps Grounding',
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    // Content is simplified to string for localStorage serialization.
    // Complex content like file previews will be handled during rendering.
    content: string; 
    files?: { name: string; type: string; url: string }[];
    sources?: any[];
    isTyping?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
}

export type Theme = 'dark' | 'light';
