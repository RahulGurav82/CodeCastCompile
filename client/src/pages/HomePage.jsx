import React, { useState } from "react";
import { FileCode, Users, Zap, Code2, ArrowRight, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const uuId = Math.random().toString(36).substring(2, 15);
    setRoomId(uuId);
    // Simulate toast
    toast.success("Room Id generated");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoomJoin = (e) => {
    e.preventDefault();
    if (!roomId || !username) {
      console.log("Room Id and Username Required.");
      return;
    }
    // Simulate navigation
    navigate(`/editor/${roomId}`,
      {
        state: { username },
      },
      toast.success("Room created")
    );
  };
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 p-3 rounded-2xl">
                <FileCode className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Cast</span>
            </h1>
            <p className="text-gray-300 text-sm">Real-time collaborative coding</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="bg-white/10 p-3 rounded-xl mb-2 mx-auto w-fit">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-300">Collaborate</span>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-3 rounded-xl mb-2 mx-auto w-fit">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-xs text-gray-300">Real-time</span>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-3 rounded-xl mb-2 mx-auto w-fit">
                <Code2 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-300">Code</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Room ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Room ID</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter room ID or generate new"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                {roomId && (
                  <button
                    type="button"
                    onClick={copyRoomId}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Username</label>
              <input
                type="text"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={!roomId || !username}
                onClick={handleRoomJoin}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
              >
                Join Room
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-gray-400">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={generateRoomId}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                Generate New Room
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Start coding together in seconds
            </p>
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Powered by real-time collaboration
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;