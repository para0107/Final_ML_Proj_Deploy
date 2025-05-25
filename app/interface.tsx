"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './animations.css';

// Types matching FastAPI Pydantic models
type ChatMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type ChatResponse = {
    answer: string;
    history: ChatMessage[];
};

function isValidRole(role: unknown): role is ChatMessage['role'] {
    return role === 'user' || role === 'assistant' || role === 'system';
}

// Define a type for potentially unsanitized messages
type UnsanitizedMessage = {
    role: unknown;
    content: unknown;
    [key: string]: unknown; // Allow other properties
};


function sanitizeHistory(history: UnsanitizedMessage[]): ChatMessage[] {
    return history
        .filter(msg => isValidRole(msg.role) && typeof msg.content === 'string')
        .map(msg => ({ role: msg.role, content: msg.content }));
}



// URL of your FastAPI endpoint
const API_URL = "http://localhost:8000/rag_chat";

const ChatComponent: React.FC = () => {
    // Seed with the system prompt
    const [conversation, setConversation] = useState<ChatMessage[]>([
        { role: 'system', content: '' }
    ]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Explicitly type the new message to preserve the literal type
    // const newMessage: ChatMessage = { role: 'user', content: text };
    // const updatedHistory: ChatMessage[] = [...conversation, newMessage];
    // setConversation(updatedHistory);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading]);

    // Send a message to FastAPI
    const sendMessage = async () => {
        const text = message.trim();
        if (!text) return;

        const newMessage: ChatMessage = { role: 'user', content: text };
        const updatedHistory: ChatMessage[] = [...conversation, newMessage];
        setConversation(updatedHistory);
        setIsLoading(true);

        try {
            const { data } = await axios.post<ChatResponse>(
                API_URL,
                { message: text, history: updatedHistory },
                { headers: { 'Content-Type': 'application/json' } }
            );
            // Update with server history (includes assistant reply)
            setConversation(sanitizeHistory(data.history));
        } catch {
            setConversation(prev => [
                ...prev,
                { role: 'system', content: 'Error: Could not connect to the chat service.' }
            ]);
        } finally {
            setIsLoading(false);
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f3e8ff] via-[#ffe0f0] to-[#e0f7fa] p-4">
            {/* Header */}
            <header className="text-center py-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-violet-700">Welcome to FBD LLM</h1>
                <p className="text-md sm:text-lg text-violet-500 mt-2">
                    Start a conversation! FBD is ready to answer your questions.
                </p>
            </header>

            {/* Input Bar: dynamic, playful */}
            <section className="flex justify-center mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={isLoading}
                        className="w-56 sm:w-64 focus:w-80 transition-all duration-300 ease-out px-4 py-2 rounded-full shadow-lg outline-none border-2 border-transparent focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !message.trim()}
                        className="absolute right-1 top-1 bg-gradient-to-r from-blue-700 to-blue-900 text-white px-3 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105"
                    >
                        Send
                    </button>
                </div>
            </section>

            {/* Conversation */}
            <main className="flex-1 overflow-auto px-2">
                <div className="space-y-6 max-w-3xl mx-auto">
                    {conversation.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const isAssistant = msg.role === 'assistant';
                        const align = isUser ? 'justify-end' : isAssistant ? 'justify-start' : 'justify-center';

                        // All Q/A bubbles: dark blue background, white text
                        const bubbleBg = msg.role === 'system'
                            ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                            : 'bg-blue-900 text-white';

                        const bubbleWidth = msg.role === 'system'
                            ? 'w-full sm:w-3/4'
                            : isUser
                                ? 'w-3/5 sm:w-2/5'
                                : 'w-3/4 sm:w-1/2';

                        return (
                            <div key={idx} className={`flex ${align}`}>
                                <div className={`${bubbleWidth} px-5 py-4 rounded-2xl shadow-lg my-4 ${bubbleBg} transition-transform duration-300 ease-out hover:scale-105`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-center">
                            <div className="w-1/2 sm:w-1/3 bg-blue-900 text-white px-4 py-3 rounded-2xl shadow-lg my-4 animate-pulse">
                                FBD is typing...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>
        </div>
    );
};

export default ChatComponent;
