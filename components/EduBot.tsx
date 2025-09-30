import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
);

const EduBot: React.FC = () => {
    const { streamChatbotResponse, learningPath } = useAppContext();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ sender: 'bot', text: `Hi ${user?.name}! I'm EduBot. How can I help you with your learning path today?` }]);
        }
    }, [isOpen, messages.length, user?.name]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsStreaming(true);
        
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        const pathContext = learningPath ? { title: learningPath.title, progress: 0 } : null; // Progress is simplified here

        try {
            await streamChatbotResponse(newMessages.slice(0, -1), input, pathContext, (chunk) => {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.sender === 'bot') {
                        return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunk }];
                    }
                    return prev;
                });
            });
        } catch (error) {
            console.error("Chatbot stream failed:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error.' }]);
        }


        setIsStreaming(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transform hover:scale-110 transition-all duration-300 z-50"
                aria-label="Open AI Assistant"
            >
                 <ChatIcon className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[70vh] bg-white dark:bg-neutral-light/95 rounded-xl shadow-2xl flex flex-col z-50 animate-slide-in">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">EduBot Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center flex-shrink-0">🤖</div>}
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-neutral-light/20 text-content-light dark:text-content-dark'}`}>
                           {msg.text}
                           {isStreaming && msg.sender === 'bot' && index === messages.length - 1 && <span className="inline-block w-1 h-4 bg-gray-600 dark:bg-gray-400 ml-1 animate-ping"></span>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        disabled={isStreaming}
                    />
                    <button onClick={handleSend} disabled={isStreaming || !input.trim()} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EduBot;
