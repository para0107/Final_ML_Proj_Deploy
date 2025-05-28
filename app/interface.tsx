'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './animations.css';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type Metric = {
    dataset: string;
    bleu: number | null;
    rouge: Record<string, number> | null;
};

type RagChatResponse = {
    answer: string;
    history: Message[];
    metrics?: Metric[];
};

type EvaluateResponse = {
    evaluation: string;
};

const ChatComponent: React.FC = () => {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [evaluation, setEvaluation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, isLoading, metrics, evaluation]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        // append user message locally
        const updatedHistory = [...conversation, { role: 'user' as const, content: message }];
        setConversation(updatedHistory);
        setIsLoading(true);
        setEvaluation(null);

        try {
            // 1) call chat endpoint
            const chatResp = await axios.post<RagChatResponse>('http://localhost:8000/rag_chat', {
                message,
                history: updatedHistory,
                ground_truth_source: 'all'
            });

            // update conversation and metrics
            setConversation(chatResp.data.history);
            setMetrics(chatResp.data.metrics || []);

            // 2) call evaluate endpoint
            const evalResp = await axios.post<EvaluateResponse>('http://localhost:8000/evaluate', {
                question: message,
                answer: chatResp.data.answer
            });
            setEvaluation(evalResp.data.evaluation);

        } catch (error) {
            console.error(error);
            setConversation(prev => [
                ...prev,
                { role: 'system', content: 'Error: Could not connect to the chat service.' },
            ]);
        } finally {
            setIsLoading(false);
            setMessage('');
        }
    };

    // only show metrics where at least one non-null
    const visibleMetrics = metrics
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f3e8ff] via-[#ffe0f0] to-[#e0f7fa] font-sans font-medium tracking-wide">
            {/* Welcome Title and Subtitle */}
            <div className="flex flex-col items-center mt-8 mb-8">
                <h2 className="text-4xl font-bold text-violet-700 mb-2">Welcome to FBD LLM</h2>
                <p className="text-lg text-violet-500 text-center max-w-md">
                    Start a conversation! FBD is ready to help you.
                </p>
            </div>

            {/* Centered Input Box */}
            <div className="flex-1 flex flex-col items-center w-full">
                <div className="flex justify-center w-full">
                    <div className="w-[400px]">
                        <div className="flex items-center bg-gradient-to-r from-blue-900 to-black rounded-2xl shadow-xl border-2 border-blue-900 p-3 mt-8 mb-8 h-20">
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent outline-none text-white placeholder-blue-300 px-2 text-lg h-full"
                                style={{ minHeight: '2.5rem' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !message.trim()}
                                className={`ml-3 px-6 py-2 rounded-xl font-bold transition-all h-12 ${
                                    isLoading || !message.trim()
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-700 to-blue-900 text-white hover:opacity-90'
                                }`}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat & Metrics/Evaluation Panel */}
                <div className="flex w-full max-w-5xl flex-1 overflow-hidden">
                    {/* Chat Column */}
                    <div className="w-1/2 p-4 overflow-y-auto flex flex-col gap-12">
                        {conversation.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex animate-fadeIn transition-all duration-700 z-10 ${
                                    msg.role === 'user'
                                        ? 'justify-end'
                                        : msg.role === 'assistant'
                                            ? 'justify-start'
                                            : 'justify-center'
                                }`}
                            >
                                <div
                                    className={`bg-blue-900 text-white rounded-3xl shadow-lg p-6 w-full max-w-xl whitespace-pre-wrap transition-all duration-700 ${
                                        msg.role === 'system' ? 'bg-yellow-100 text-yellow-800' : ''
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex animate-fadeIn transition-all duration-700 justify-start w-full z-10">
                                <div className="bg-blue-900 p-6 rounded-3xl shadow-lg flex items-center w-full max-w-xl z-10">
                                    <div className="animate-typing text-white text-lg font-medium">FBD is typing...</div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Metrics & Evaluation Column */}
                    <div className="w-1/2 p-8 border-l-2 border-blue-900 flex flex-col justify-start">
                        <h2 className="text-2xl font-semibold mb-4">Metrics</h2>
                        {visibleMetrics.length === 0 ? (
                            <p className="text-gray-600">No metrics yet.</p>
                        ) : (
                            visibleMetrics.map(m => (
                                <div key={m.dataset} className="mb-4">
                                    <div className="text-lg">
                                        <strong>BLEU-{m.dataset}</strong> = {m.bleu != null ? m.bleu.toFixed(4) : '–'}
                                    </div>
                                    <div className="text-lg mt-1">
                                        <strong>ROUGE-{m.dataset}</strong>{' '}
                                        {m.rouge
                                            ? Object.entries(m.rouge)
                                                .map(([k, v]) => `${k}:${v.toFixed(4)}`)
                                                .join(', ')
                                            : '–'}
                                    </div>
                                </div>
                            ))
                        )}

                        <h2 className="text-2xl font-semibold mt-8 mb-4">Evaluation</h2>
                        {evaluation ? (
                            <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
                                {evaluation}
                            </div>
                        ) : (
                            <p className="text-gray-600">No evaluation yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
