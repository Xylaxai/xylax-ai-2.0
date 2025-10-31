
import { GoogleGenAI, GenerateContentResponse, Chat, Modality, LiveServerMessage } from "@google/genai";

let ai: GoogleGenAI;
const getAi = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
};

// Unified function for text-based generation with optional configs
export const generateTextResponse = async (
    prompt: string,
    model: string,
    config?: any
): Promise<GenerateContentResponse> => {
    const ai = getAi();
    return await ai.models.generateContent({
        model,
        contents: prompt,
        ...(config && { config: config }),
    });
};

export const createChatSession = (model: string): Chat => {
    const ai = getAi();
    return ai.chats.create({ model });
};

export const analyzeMedia = async (prompt: string, mediaParts: any[], model: string): Promise<GenerateContentResponse> => {
    const ai = getAi();
    return await ai.models.generateContent({
        model,
        contents: [{ parts: [...mediaParts, { text: prompt }] }],
    });
};

export const generateImage = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAi();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });
    // Adapt the response to fit GenerateContentResponse structure for consistency
    const base64Image = response.generatedImages[0].image.imageBytes;
    return {
        text: `data:image/png;base64,${base64Image}`,
    } as unknown as GenerateContentResponse;
};

export const textToSpeech = async (text: string): Promise<string | undefined> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};


// Live API specific types and functions
export type LiveCallbacks = {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
};

export const connectLive = (callbacks: LiveCallbacks) => {
    const ai = getAi();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are Xylax AI, a friendly and helpful conversational AI assistant.',
        },
    });
};
