import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { getCopilotResponse } from '../services/geminiService';
import type { CopilotMessage } from '../types';

const AiMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-start">
        <div className="bg-gray-700/50 rounded-lg p-3 max-w-lg">
            <p className="text-sm whitespace-pre-wrap">{text}</p>
        </div>
    </div>
);

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-end">
        <div className="bg-[#00E5FF]/20 text-white rounded-lg p-3 max-w-lg">
            <p className="text-sm">{text}</p>
        </div>
    </div>
);


export const Copilot: React.FC = () => {
    const [messages, setMessages] = useState<CopilotMessage[]>([
        { sender: 'ai', text: 'Hello! I am Zenith AI. How can I help you analyze the market today?\n\nTry asking:\n- "show me stocks with a breakout score above 80"\n- "which mutual fund has the best 1Y return?"\n- "summarize my portfolio performance"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: CopilotMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponseText = await getCopilotResponse(input);
        const aiMessage: CopilotMessage = { sender: 'ai', text: aiResponseText };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="text-center mb-6">
                 <h1 className="text-3xl font-bold text-white mb-2">AI Copilot</h1>
                <p className="text-gray-400">Your personal investment analyst. Ask me anything.</p>
            </div>
            
            <Card className="flex-grow flex flex-col">
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4">
                   {messages.map((msg, index) => (
                       msg.sender === 'ai' ? <AiMessage key={index} text={msg.text} /> : <UserMessage key={index} text={msg.text} />
                   ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700/50 rounded-lg p-3 max-w-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                   <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 p-4 border-t border-white/10">
                    <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about stocks, funds, or your portfolio..."
                            className="w-full bg-transparent p-3 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading}
                            className="p-3 text-[#00E5FF] hover:bg-[#00E5FF]/20 rounded-lg disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
