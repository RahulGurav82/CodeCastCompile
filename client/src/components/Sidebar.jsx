import { FileCode, Copy, LogOut, Users } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Profile = ({ client }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate consistent colors based on username
  const getAvatarColor = (username) => {
    const colors = [
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-teal-400 to-teal-600'
    ]
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div 
      className={`w-full flex h-14 transition-all duration-300 transform ${
        isHovered ? 'scale-105' : 'scale-100'
      }`}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-14 h-14 text-white ${getAvatarColor(client.username)} rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
        isHovered ? 'shadow-xl rotate-3' : ''
      }`}>
        {client.username[0].toUpperCase()}
      </div>
      <div className='w-full flex items-center ml-3 text-gray-200 font-medium'>
        {client.username}
        <div className={`ml-2 w-2 h-2 bg-green-400 rounded-full transition-all duration-300 ${
          isHovered ? 'animate-pulse' : ''
        }`}></div>
      </div>
    </div>
  )
}

const Sidebar = ({ client = [], roomId }) => {
  const [roomIdCopied, setRoomIdCopied] = useState(false)
  const [isLeaveHovered, setIsLeaveHovered] = useState(false)
    const navigate = useNavigate();

  const handleCopyRoomId = () => {
    setRoomIdCopied(true)
    navigator.clipboard.writeText(roomId);
    setTimeout(() => setRoomIdCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    navigate("/")
  }

  const sampleClients = client.length > 0 ? client : [
    { socketId: '1', username: 'Alice' },
    { socketId: '2', username: 'Bob' },
    { socketId: '3', username: 'Charlie' },
    { socketId: '4', username: 'Diana' }
  ]

  return (
    <div className='h-full w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 -right-5 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-5 w-12 h-12 bg-green-500/10 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <div className='relative z-10 h-full flex flex-col p-6'>
        {/* Header */}
        <div className='flex items-center justify-center text-white h-24 text-2xl gap-3 mb-6'>
          <div className="relative">
            <FileCode className="w-8 h-8 text-purple-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>
          <span className='font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
            CodeCast
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-6"></div>
        
        {/* Users section */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>Active Users ({sampleClients.length})</span>
          </div>
          
          <div className='flex flex-col gap-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
            {sampleClients.map(client => (
              <Profile key={client.socketId} client={client} />
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className='flex flex-col gap-3 mt-6'>
          <button 
            onClick={handleCopyRoomId}
            className={`group relative px-4 py-3 rounded-xl flex items-center justify-center cursor-pointer font-medium transition-all duration-300 overflow-hidden ${
              roomIdCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-lg hover:shadow-emerald-500/25'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <Copy className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">
              {roomIdCopied ? 'Room ID Copied!' : 'Copy Room ID'}
            </span>
          </button>
          
          <button
            onClick={handleLeaveRoom} 
            onMouseEnter={() => setIsLeaveHovered(true)}
            onMouseLeave={() => setIsLeaveHovered(false)}
            className={`group relative px-4 py-3 rounded-xl flex items-center justify-center cursor-pointer font-medium transition-all duration-300 overflow-hidden ${
              isLeaveHovered 
                ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/25 scale-105' 
                : 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg hover:shadow-red-500/25'
            } text-white`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <LogOut className={`w-4 h-4 mr-2 relative z-10 transition-transform duration-300 ${
              isLeaveHovered ? 'translate-x-1' : ''
            }`} />
            <span className="relative z-10">Leave Room</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar