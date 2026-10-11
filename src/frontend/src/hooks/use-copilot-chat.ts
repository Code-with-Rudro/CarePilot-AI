import { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { apiClient } from '../lib/api-client';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    role: 'assistant',
    content: 'Hello! I am **CarePilot AI**, your personal health assistant. I can help explain your uploaded diagnostic reports, lab results, and prescription schedules in plain language.\n\n*Note: I provide grounded educational information based on your records; I do not diagnose conditions or replace a qualified doctor.*',
    timestamp: 'Just now',
    suggestedQuestions: [
      'What does my Haemoglobin level mean?',
      'How should I take Metoprolol Tartrate?',
      'What is my latest Fasting Blood Glucose?',
    ],
  }
];

export const useCopilotChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<any | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await apiClient.askCopilot(text);
      setMessages(prev => [...prev, response]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I could not retrieve your health records at this moment. Please check your network connection and try again.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const uploadAndExtractImage = async (file: File, prompt?: string) => {
    const objectUrl = URL.createObjectURL(file);
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const userMessage: ChatMessage = {
      id: `user-upload-${Date.now()}`,
      role: 'user',
      content: prompt?.trim() || `Uploaded medical document: ${file.name}`,
      imageUrl: objectUrl,
      imageName: file.name,
      imageSize: sizeStr,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await apiClient.extractImageInCopilot(file, prompt);
      setMessages(prev => [...prev, response]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue processing **${file.name}**. Please ensure the image is clear and try uploading again.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return {
    messages,
    isTyping,
    sendMessage,
    uploadAndExtractImage,
    clearChat,
    activeCitation,
    setActiveCitation,
  };
};
