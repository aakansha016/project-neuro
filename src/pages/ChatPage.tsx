import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { sendChatMessage, sendChatMessageStream, ChatMessage } from '../backend/chatService';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI memory assistant. I can help you search through your transcriptions, create summaries, and answer questions about your stored knowledge. What would you like to explore?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    setStreamedContent('');
    try {
      // Use streaming for typing effect
      let fullResponse = '';
      await sendChatMessageStream(
        newMessages,
        'llama3.1:8b',
        (token) => {
          fullResponse += token;
          setStreamedContent(fullResponse);
        }
      );
      setMessages([...newMessages, { role: 'assistant', content: fullResponse }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, there was an error.' }]);
    }
    setIsTyping(false);
    setStreamedContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0C10] via-[#0B0E11] to-[#000000] flex flex-col">
      {/* Header */}
      <motion.div
        className="pt-20 pb-8 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            AI Memory Assistant
          </h1>
          <p className="text-xl text-white/60">
            Ask questions about your stored knowledge or anything else
          </p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                      : 'bg-black/30 backdrop-blur-xl border border-white/10'
                  }`}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p {...props} className="text-white leading-relaxed whitespace-pre-line" />,
                          li: ({node, ...props}) => <li {...props} className="text-white leading-relaxed whitespace-pre-line ml-6 list-disc" />,
                          ul: ({node, ...props}) => <ul {...props} className="mb-2" />,
                          strong: ({node, ...props}) => <strong {...props} className="font-bold text-white" />,
                          em: ({node, ...props}) => <em {...props} className="italic text-white" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-white leading-relaxed whitespace-pre-line">{message.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

           {/* Streaming/typing effect for AI response */}
           {isTyping && (
             <motion.div
               className="flex justify-start"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <div className="flex items-start space-x-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                   <Bot size={20} />
                 </div>
                 <div className="px-6 py-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                   <ReactMarkdown
                     components={{
                       p: ({node, ...props}) => <p {...props} className="text-white leading-relaxed whitespace-pre-line" />,
                       li: ({node, ...props}) => <li {...props} className="text-white leading-relaxed whitespace-pre-line ml-6 list-disc" />,
                       ul: ({node, ...props}) => <ul {...props} className="mb-2" />,
                       strong: ({node, ...props}) => <strong {...props} className="font-bold text-white" />,
                       em: ({node, ...props}) => <em {...props} className="italic text-white" />,
                     }}
                   >
                     {streamedContent || '...'}
                   </ReactMarkdown>
                 </div>
               </div>
             </motion.div>
           )}
          </div>
        </div>
      </div>

      {/* Input */}
      <motion.div
        className="fixed bottom-24 left-0 right-0 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-white placeholder-white/40 resize-none focus:outline-none max-h-32"
                  rows={1}
                  disabled={isTyping}
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}