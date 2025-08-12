import React from 'react';

const ChatBubble = ({ message, isOwnMessage }) => {
  if (!message) {
    return null; // Don't render if no message data
  }

  const bubbleAlignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const bubbleColor = isOwnMessage
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  const bubbleRadius = isOwnMessage
    ? 'rounded-l-xl rounded-t-xl'
    : 'rounded-r-xl rounded-t-xl';

  return (
    <div className={`flex ${bubbleAlignment} mb-4`}>
      <div className="flex flex-col max-w-xs lg:max-w-md">
        {!isOwnMessage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
                {message.sender?.username || 'Unknown'}
            </p>
        )}
        <div className={`px-4 py-3 ${bubbleColor} ${bubbleRadius}`}>
          <p className="text-sm">{message.text}</p>
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? 'text-right mr-2' : 'text-left ml-2'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;