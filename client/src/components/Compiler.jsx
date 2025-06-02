import React, { useState } from "react";
import { Play, Square, Download, Settings } from "lucide-react";
import toast from "react-hot-toast";

// List of supported languages
const LANGUAGES = [
  { id: "python3", name: "Python 3", extension: "py" },
  { id: "java", name: "Java", extension: "java" },
  { id: "cpp", name: "C++", extension: "cpp" },
  { id: "nodejs", name: "Node.js", extension: "js" },
  { id: "c", name: "C", extension: "c" },
  { id: "ruby", name: "Ruby", extension: "rb" },
  { id: "go", name: "Go", extension: "go" },
  { id: "scala", name: "Scala", extension: "scala" },
  { id: "bash", name: "Bash", extension: "sh" },
  { id: "sql", name: "SQL", extension: "sql" },
  { id: "pascal", name: "Pascal", extension: "pas" },
  { id: "csharp", name: "C#", extension: "cs" },
  { id: "php", name: "PHP", extension: "php" },
  { id: "swift", name: "Swift", extension: "swift" },
  { id: "rust", name: "Rust", extension: "rs" },
  { id: "r", name: "R", extension: "r" },
];

const Compiler = ({ code, socketRef, roomId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // API configuration - now using your backend proxy
  const API_CONFIG = {
    apiUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code to execute");
      return;
    }

    setIsRunning(true);
    setOutput("Running...");
    const startTime = Date.now();

    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: code,
          language: selectedLanguage,
          stdin: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      const execTime = endTime - startTime;

      setExecutionTime(execTime);

      if (result.error) {
        setOutput(`Error: ${result.error}`);
        toast.error("Compilation/Execution error");
      } else {
        const outputText = result.output || "No output";
        setOutput(outputText);
        
        // Broadcast execution result to other users
        if (socketRef?.current) {
          socketRef.current.emit("code-executed", {
            roomId,
            language: selectedLanguage,
            output: outputText,
            executionTime: execTime,
          });
        }
        
        toast.success("Code executed successfully");
      }
    } catch (error) {
      console.error("Execution error:", error);
      setOutput(`Error: ${error.message}`);
      toast.error("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput("Execution stopped");
    toast.info("Execution stopped");
  };

  const clearOutput = () => {
    setOutput("");
    setInput("");
    setExecutionTime(null);
  };

  const downloadOutput = () => {
    if (!output) {
      toast.error("No output to download");
      return;
    }

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output_${selectedLanguage}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Output downloaded");
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          {executionTime && (
            <span className="text-sm text-gray-400">
              Executed in {executionTime}ms
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-md transition-colors"
          >
            <Play size={16} />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
          
          {isRunning && (
            <button
              onClick={stopExecution}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
            >
              <Square size={16} />
              <span>Stop</span>
            </button>
          )}
          
          <button
            onClick={downloadOutput}
            disabled={!output}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md transition-colors"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Execution Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Selected Language: {LANGUAGES.find(l => l.id === selectedLanguage)?.name}
              </label>
            </div>
            <button
              onClick={clearOutput}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <label className="block text-sm font-medium mb-2">
            Input (stdin):
          </label>
          <textarea
            value={input || code}
            onChange={(e) => setInput(e.target.value) }
            placeholder="Enter input for your program..."
            className="w-full h-24 bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
          />
        </div>

        {/* Output Section */}
        <div className="flex-1 p-4">
          <label className="block text-sm font-medium mb-2">
            Output:
          </label>
          <div className="h-full bg-black rounded-md p-4 overflow-auto">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
              {output || "Output will appear here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;