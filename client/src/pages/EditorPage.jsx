import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import Compiler from "../components/Compiler";
import { initSocket } from "../socket";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Code, Terminal, Users } from "lucide-react";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' or 'compiler'
  const [currentCode, setCurrentCode] = useState("");

  const handleError = (err) => {
    console.log("connection Error", err);
    toast.error("Connection Error");
    setIsSocketConnected(false);
  };

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.on("connect", () => {
          setIsSocketConnected(true);
        });

        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);

        socketRef.current.emit("join", {
          roomId,
          username: location.state?.username,
        });

        socketRef.current.on("joined", ({ clients, username, socketId }) => {
          // Only show toast if it's someone else joining
          if (username !== location.state?.username) {
            toast.success(`${username} joined`);
          }
          setClient(clients);

          // Sync code with new user - but only if we have code to sync
          if (socketId !== socketRef.current.id && codeRef.current) {
            socketRef.current.emit("sync-code", {
              code: codeRef.current,
              socketId,
            });
          }
        });

        socketRef.current.on("disconnected", ({ socketId, username }) => {
          toast.success(`${username} left`);
          setClient((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        });

        // Handle code execution results from other users
        socketRef.current.on("code-executed", ({ language, output, executionTime }) => {
          toast.success(`Code executed in ${language} (${executionTime}ms)`);
        });

        // Handle reconnection
        socketRef.current.on("reconnect", () => {
          toast.success("Reconnected to server");
          setIsSocketConnected(true);
          // Re-join the room
          socketRef.current.emit("join", {
            roomId,
            username: location.state?.username,
          });
        });

        socketRef.current.on("disconnect", () => {
          setIsSocketConnected(false);
          toast.error("Disconnected from server");
        });

      } catch (error) {
        console.error("Socket initialization error:", error);
        toast.error("Failed to connect to server");
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.off("code-executed");
        socketRef.current.off("reconnect");
        socketRef.current.off("disconnect");
      }
    };
  }, [roomId, location.state?.username]);

  // Redirect if no username provided
  if (!location.state?.username) {
    navigate("/");
    return null;
  }

  const handleCodeChange = (code) => {
    codeRef.current = code;
    setCurrentCode(code);
  };

  return (
    <div className="w-full flex h-[100vh] bg-gray-900">

      
      {/* Sidebar */}
      <div className="w-72 bg-[#202226] border-r border-gray-700">
        <Sidebar client={client} roomId={roomId} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "editor"
                ? "bg-gray-700 text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <Code size={16} />
            <span>Editor</span>
          </button>
          
          <button
            onClick={() => setActiveTab("compiler")}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "compiler"
                ? "bg-gray-700 text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <Terminal size={16} />
            <span>Compiler</span>
          </button>

          {/* Room Info */}
          <div className="ml-auto flex items-center space-x-4 px-6 py-3 text-gray-400">
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{client.length} online</span>
            </div>
            <div className="text-sm">
              Room: <span className="text-white font-mono">{roomId}</span>
            </div>
            {/* Connection status indicator */}
            <div className={` px-3 py-1 rounded text-white text-sm z-50 ${
              isSocketConnected ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isSocketConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "editor" ? (
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              setClient={setClient}
              codeRef={codeRef}
              onCodeChange={handleCodeChange}
              initialCode={currentCode} // Pass current code as initial value
            />
          ) : (
            <Compiler
              code={currentCode}
              socketRef={socketRef}
              roomId={roomId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
