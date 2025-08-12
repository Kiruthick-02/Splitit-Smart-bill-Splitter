import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const SendIcon = () => (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
);

const ChatBubble = ({ msg, isOwn }) => {
    const bubbleAlignment = isOwn ? 'justify-end' : 'justify-start';
    const bubbleColor = isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    const bubbleRadius = isOwn ? 'rounded-l-xl rounded-t-xl' : 'rounded-r-xl rounded-t-xl';

    return (
        <div className={`flex ${bubbleAlignment} mb-4`}>
            <div className="flex flex-col max-w-xs lg:max-w-md">
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1 ml-2">
                        <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username}`} alt={msg.sender?.username} className="h-5 w-5 rounded-full"/>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{msg.sender?.username || 'Unknown'}</p>
                    </div>
                )}
                <div className={`px-4 py-3 ${bubbleColor} ${bubbleRadius}`}>
                    <p className="text-sm">{msg.message}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-2' : 'text-left ml-2'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};


const GroupChat = ({ groupId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get(`/chat/${groupId}`);
                setMessages(data);
            } catch (err) {
                console.error('Failed to load chat history.');
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [groupId]);

    useEffect(() => {
        if (!user) return;

        // Make sure to connect to your deployed server URL in production
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001');
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
                messageText: newMessage,
                senderId: user.id
            };
            socketRef.current.emit('sendMessage', messagePayload);
            setNewMessage('');
        }
    };
    
    return (
        <div className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Group Chat</h2>
            <div className="flex flex-col h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-grow p-4 overflow-y-auto">
                    {loading && <div>Loading chat...</div>}
                    {!loading && messages.map((msg) => (
                        <ChatBubble key={msg._id} msg={msg} isOwn={msg.sender._id === user.id} />
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
                            className="input-field flex-grow"
                        />
                        <button type="submit" className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupChat;