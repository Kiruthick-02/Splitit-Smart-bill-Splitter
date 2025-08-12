import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const SendIcon = () => (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
);

const Chat = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const { data } = await api.get(`/chat/${groupId}`);
            setMessages(data);
        } catch (err) {
            setError('Failed to load chat history.');
        } finally {
            setLoading(false);
        }
    }
    fetchHistory();
  }, [groupId]);
  
  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5001');

    socketRef.current.emit('joinGroup', groupId);

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId, user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const messagePayload = {
        groupId,
        senderId: user.id,
        text: newMessage,
      };
      
      const optimisticMessage = {
          sender: { _id: user.id, username: 'You' },
          text: newMessage,
          timestamp: new Date().toISOString()
      };
      
      socketRef.current.emit('sendMessage', messagePayload);
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage('');
    }
  };

  if (loading) return <div>Loading chat...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="flex flex-col h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div className="p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Group Chat</h1>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatBubble 
            key={index} 
            message={msg} 
            isOwnMessage={msg.sender._id === user.id} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-full dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;