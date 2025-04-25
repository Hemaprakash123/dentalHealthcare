import React, { useState, useEffect } from 'react';
import { MessageCircle, UserCircle2, Send, PlusCircle, HeartPulse, Star } from 'lucide-react';

const Forum = () => {
  const [isDoctor, setIsDoctor] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Anonymous User',
    role: 'Patient'
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { name: 'Dr. Emily Chen', role: 'Doctor' },
      content: 'Urgent: Looking for a kidney donor for a patient with chronic renal failure.',
      timestamp: '2 hours ago',
      comments: [
        {
          id: 101,
          user: { name: 'Michael Rodriguez', role: 'Patient' },
          content: 'I might be interested in helping. How can I get tested?',
          timestamp: '1 hour ago',
        },
      ],
    },
    {
      id: 2,
      user: { name: 'Sarah Johnson', role: 'Patient' },
      content: 'Need advice on managing type 2 diabetes lifestyle changes.',
      timestamp: '5 hours ago',
      comments: [],
    },
    {
      id: 3,
      user: { name: 'Dr. Anil Mehta', role: 'Doctor' },
      content: 'Emergency: O+ blood required for a critical surgery at City Hospital. Please contact if available.',
      timestamp: '30 minutes ago',
      comments: [
        {
          id: 201,
          user: { name: 'Rahul Sharma', role: 'Patient' },
          content: 'I am O+ and willing to donate. Please share the details.',
          timestamp: '15 minutes ago',
        },
        {
          id: 202,
          user: { name: 'Anjali Verma', role: 'Patient' },
          content: 'I have O+ blood and am nearby City Hospital. How can I help?',
          timestamp: '10 minutes ago',
        },
      ],
    },
    {
      id: 4,
      user: { name: 'Priya Nair', role: 'Patient' },
      content: 'Emergency: AB- blood urgently needed for a newborn at Apollo Hospital. Anyone willing to donate?',
      timestamp: '1 hour ago',
      comments: [
        {
          id: 301,
          user: { name: 'Dr. Aarti Kumar', role: 'Doctor' },
          content: 'Please provide more details or contact Apollo Hospital’s blood bank immediately.',
          timestamp: '45 minutes ago',
        },
      ],
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    // Get isDoctor value from localStorage
    const doctorStatus = localStorage.getItem("isDoctor") === 'true';
    setIsDoctor(doctorStatus);
    
    // Update currentUser based on isDoctor status
    setCurrentUser({
      name: doctorStatus ? "Dr. Bushan Raju" : "Anurag",
      role: doctorStatus ? "Doctor" : "Patient"
    });
  }, []); // Empty dependency array means this runs once on mount

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        user: currentUser,
        content: newMessage,
        timestamp: 'Just now',
        comments: []
      };
      setMessages([newMsg, ...messages]);
      setNewMessage('');
    }
  };

  const handleAddComment = (messageId) => {
    const commentText = commentTexts[messageId];

    if (commentText?.trim()) {
      setMessages(messages.map(msg =>
        msg.id === messageId
          ? {
            ...msg,
            comments: [
              ...msg.comments,
              {
                id: msg.comments.length + 1,
                user: currentUser,
                content: commentText,
                timestamp: 'Just now'
              }
            ]
          }
          : msg
      ));

      setCommentTexts({
        ...commentTexts,
        [messageId]: ''
      });
    }
  };

  const UserIcon = ({ role = 'Patient', isPostOwner = false, size = "md" }) => {
    const iconClasses = role === 'Doctor'
      ? 'text-blue-600 bg-blue-50'
      : role === 'Patient'
        ? 'text-green-600 bg-green-50'
        : 'text-purple-600 bg-purple-50';

    const borderClass = isPostOwner
      ? 'ring-2 ring-yellow-400'
      : '';

    const sizeClasses = size === "sm" ? "w-6 h-6" : "w-8 h-8";
    const containerSizeClasses = size === "sm" ? "p-0.5" : "p-1";

    return (
      <div className={`rounded-full relative ${iconClasses} ${borderClass} ${containerSizeClasses} flex items-center justify-center`}>
        {role === 'Doctor' ? (
          <HeartPulse className={sizeClasses} />
        ) : (
          <UserCircle2 className={sizeClasses} />
        )}
        {isPostOwner && (
          <Star
            className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 bg-white rounded-full"
            fill="currentColor"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Rest of the JSX remains the same */}
      <div className="bg-white border-b border-gray-200 fixed top-0 w-full z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Healthcare Community Forum</h1>
          </div>
          <div className="flex items-center space-x-2">
            <UserIcon role={currentUser.role} isPostOwner={true} size="sm" />
            <span className="text-sm text-gray-600">{currentUser.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pt-20">
        {/* New Message Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="p-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <UserIcon role={currentUser.role} isPostOwner={true} size="sm" />
              </div>
              <div className="flex-grow">
                <textarea
                  placeholder="Start a new discussion..."
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddMessage}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 space-x-2 text-sm font-bold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center p-3 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <UserIcon
                    role={message.user.role}
                    isPostOwner={message.user.name === currentUser.name}
                    size="sm"
                  />
                </div>
                <div className="ml-2 flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">{message.user.name}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 text-sm text-gray-800 font-bold">
                {message.content}
              </div>

              <div className="bg-gray-50 border-t border-gray-100">
                {message.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 border-b border-gray-100 flex items-start space-x-2"
                  >
                    <div className="flex-shrink-0">
                      <UserIcon
                        role={comment.user.role}
                        isPostOwner={comment.user.name === currentUser.name}
                        size="sm"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}

                <div className="p-3 flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <UserIcon role={currentUser.role} isPostOwner={false} size="sm" />
                  </div>
                  <div className="flex-grow">
                    <textarea
                      placeholder="Write a comment..."
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none bg-white"
                      value={commentTexts[message.id] || ''}
                      onChange={(e) => setCommentTexts({
                        ...commentTexts,
                        [message.id]: e.target.value
                      })}
                      rows={1}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleAddComment(message.id)}
                        className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition duration-200 space-x-1.5 text-sm font-bold"
                      >
                        <Send className="w-3 h-3" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;