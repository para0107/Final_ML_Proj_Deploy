"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './animations.css';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

const ChatComponent: React.FC = () => {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, isLoading]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        // Append user message locally
        const updatedHistory = [...conversation, { role: 'user', content: message }];
        setConversation(updatedHistory);
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/rag_chat', {
                message,
                history: updatedHistory,
            });

            // Replace local history with the updated history from server
            setConversation(response.data.history);
        } catch (error) {
            setConversation(prev => [
                ...prev,
                {
                    role: 'system',
                    content: 'Error: Could not connect to the chat service.',
                },
            ]);
        } finally {
            setIsLoading(false);
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f3e8ff] via-[#ffe0f0] to-[#e0f7fa] font-sans font-medium tracking-wide">
            {/* Welcome Title and Subtitle */}
            <div className="flex flex-col items-center mt-8 mb-8">
                <h2 className="text-4xl font-bold text-violet-700 mb-2">Welcome to FBD LLM</h2>
                <p className="text-lg text-violet-500 text-center max-w-md">
                    Start a conversation! FBD is ready to fuck you up.
                </p>
            </div>

            {/* Centered Input Box */}
            <div className="flex-1 flex flex-col items-center w-full">
                <div className="flex flex-col items-center w-full">
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
                </div>

                {/* Chat Answers Below Input */}
                <div className="flex flex-col items-center w-full">
                    <div className="w-full max-w-5xl space-y-6">
                        {conversation.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full animate-fadeIn transition-all duration-700 z-10 ${
                                    msg.role === 'user'
                                        ? 'justify-end'
                                        : msg.role === 'assistant'
                                            ? 'justify-start'
                                            : 'justify-center'
                                }`}
                            >
                                {msg.role === 'user' && (
                                    <div className="w-full max-w-5xl flex justify-end">
                                        <div className="bg-blue-900 text-white rounded-3xl shadow-lg p-6 w-full max-w-xl transition-all duration-700 animate-slideInRight z-10">
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                )}
                                {msg.role === 'assistant' && (
                                    <div className="w-full max-w-5xl flex justify-start">
                                        <div className="bg-blue-900 text-white rounded-3xl shadow-lg p-6 w-full max-w-xl transition-all duration-700 z-10">
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                )}
                                {msg.role === 'system' && (
                                    <div className="w-full max-w-5xl flex justify-center">
                                        <div className="bg-yellow-100 text-yellow-800 rounded-3xl shadow-lg p-4 w-full max-w-xl z-10">
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex animate-fadeIn transition-all duration-700 w-full z-10 justify-start">
                                <div className="bg-blue-900 p-6 rounded-3xl shadow-lg flex items-center w-full max-w-xl z-10">
                                    <div className="animate-typing text-white text-lg font-medium">FBD is typing...</div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
