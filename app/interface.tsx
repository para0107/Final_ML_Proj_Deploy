'use client'

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

type Message = {
    role: 'user' | 'assistant' | 'system'
    content: string
}

type RagChatResponse = {
    answer: string
    history: Message[]
}

export default function ChatComponent() {
    const [message, setMessage] = useState('')
    const [conversation, setConversation] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [conversation])

    const sendMessage = async () => {
        if (!message.trim()) return
        setLoading(true)

        const updated = [
            ...conversation,
            { role: 'user' as const, content: message.trim() },
        ]
        setConversation(updated)

        try {
            const { data } = await axios.post<RagChatResponse>(
                'http://localhost:8000/rag_chat',
                {
                    message,
                    history: updated,
                }
            )

            setConversation((prev) => [
                ...prev,
                { role: 'assistant', content: data.answer },
            ])
        } catch {
            setConversation((prev) => [
                ...prev,
                {
                    role: 'system',
                    content: '⚠️ Could not connect to the chat service.',
                },
            ])
        } finally {
            setMessage('')
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #ffe0f0 0%, #e0f7fa 100%)',
                fontFamily: 'sans-serif',
            }}
        >
            {/* HEADER + INPUT */}
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>Welcome to FBD LLM</h1>
                <p style={{ margin: '0.5rem 0 1.5rem', color: '#555' }}>
                    Start a conversation! FBD is ready to help you.
                </p>
                <div style={{ display: 'inline-flex', width: '60%' }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            fontSize: '1.1rem',
                            borderRadius: '999px 0 0 999px',
                            border: '2px solid #ff99c8',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !message.trim()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1.1rem',
                            borderRadius: '0 999px 999px 0',
                            border: 'none',
                            background:
                                loading || !message.trim() ? '#ccc' : '#ff69b4',
                            color: 'white',
                            cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* FULL-WIDTH CHAT AREA */}
            <div
                style={{
                    flex: 1,
                    padding: '1rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                {conversation.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            alignSelf:
                                m.role === 'user'
                                    ? 'flex-end'
                                    : m.role === 'assistant'
                                        ? 'flex-start'
                                        : 'center',
                            maxWidth: '70%',
                            background:
                                m.role === 'user'
                                    ? '#ff69b4'
                                    : m.role === 'assistant'
                                        ? 'white'
                                        : '#fffae6',
                            color: m.role === 'user' ? 'white' : '#333',
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem',
                            boxShadow:
                                m.role === 'assistant'
                                    ? '0 1px 4px rgba(0,0,0,0.1)'
                                    : 'none',
                            whiteSpace: 'pre-wrap',
                            fontSize: '1rem',
                        }}
                    >
                        {m.content}
                    </div>
                ))}

                {loading && (
                    <div
                        style={{
                            alignSelf: 'flex-start',
                            maxWidth: '70%',
                            background: '#ff69b4',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem',
                            fontStyle: 'italic',
                        }}
                    >
                        FBD is typing…
                    </div>
                )}

                <div ref={endRef} />
            </div>
        </div>
    )
}
