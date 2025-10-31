
import { useState, useRef, useCallback } from 'react';
// FIX: Removed `LiveSession` as it is not an exported member of `@google/genai`.
import { LiveServerMessage } from '@google/genai';
import { connectLive } from '../services/geminiService';
import { createPcmBlob } from '../utils/audioUtils';
import { decode, decodeAudioData } from '../utils/audioUtils';

const useLiveAudio = () => {
    const [isLive, setIsLive] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // FIX: Used `ReturnType<typeof connectLive>` to correctly infer the session promise type without direct import.
    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const cleanup = useCallback(() => {
        setIsLive(false);
        setIsInitializing(false);
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        
        inputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        // Don't close output context as it might be used by TTS
    }, []);

    const stopLiveSession = useCallback(async () => {
        if (!sessionPromiseRef.current) return;
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        } finally {
            cleanup();
            sessionPromiseRef.current = null;
        }
    }, [cleanup]);
    
    const startLiveSession = useCallback(async () => {
        if (isLive) return;

        setUserTranscript('');
        setModelTranscript('');
        setError(null);
        setIsInitializing(true);
        
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                // FIX: Added `(window as any)` to support `webkitAudioContext` for older browsers without TypeScript errors.
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            }
             if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                // FIX: Added `(window as any)` to support `webkitAudioContext` for older browsers without TypeScript errors.
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }


            sessionPromiseRef.current = connectLive({
                onopen: () => {
                    console.log('Live session opened.');
                    setIsLive(true);
                    setIsInitializing(false);

                    const inputCtx = inputAudioContextRef.current;
                    if (!streamRef.current || !inputCtx) return;

                    mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(streamRef.current);
                    scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        if (sessionPromiseRef.current) {
                           sessionPromiseRef.current.then(session => session.sendRealtimeInput({ media: pcmBlob })).catch(console.error);
                        }
                    };

                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle transcription
                    if (message.serverContent?.inputTranscription) {
                        setUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
                    }
                    if (message.serverContent?.outputTranscription) {
                        setModelTranscript(prev => prev + message.serverContent.outputTranscription.text);
                    }
                    if (message.serverContent?.turnComplete) {
                        setUserTranscript('');
                        setModelTranscript('');
                    }

                    // Handle audio playback
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    const outputCtx = outputAudioContextRef.current;
                    if (audioData && outputCtx) {
                       nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                       const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                       const source = outputCtx.createBufferSource();
                       source.buffer = audioBuffer;
                       source.connect(outputCtx.destination);
                       source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                       source.start(nextStartTimeRef.current);
                       nextStartTimeRef.current += audioBuffer.duration;
                       audioSourcesRef.current.add(source);
                    }
                     // Handle interruption
                    if (message.serverContent?.interrupted) {
                        for(const source of audioSourcesRef.current.values()){
                            source.stop();
                            audioSourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError(e.message || 'An unknown error occurred.');
                    cleanup();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Live session closed.');
                    cleanup();
                },
            });

        } catch (err) {
            console.error("Failed to start live session:", err);
            setError(err instanceof Error ? err.message : 'Failed to get user media.');
            setIsInitializing(false);
            cleanup();
        }
    }, [isLive, cleanup]);


    return { isLive, isInitializing, userTranscript, modelTranscript, error, startLiveSession, stopLiveSession };
};

export default useLiveAudio;
