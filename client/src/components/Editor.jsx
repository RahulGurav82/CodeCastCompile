import { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

const Editor = ({ socketRef, roomId, codeRef, onCodeChange, initialCode  }) => {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false); // Flag to prevent infinite loops

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(
      document.getElementById("realTimeEditor"),
      {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        value: initialCode || codeRef.current || "", // Use initialCode first
      }
    );

    

    editorRef.current = editor;
    editor.setSize(null, "100%");

    // Improved change handler with debouncing
    let changeTimeout;
    editor.on("change", (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      
      // Update refs
      onCodeChange(code);
      codeRef.current = code;

      // Only emit if it's a user change (not from setValue)
      if (origin !== "setValue" && !isRemoteChange.current) {
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.emit("code-change", {
              roomId,
              code,
            });
          }
        }, 300);
      }
    });

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(changeTimeout);
    };
  }, []);

    // Add this effect to handle initialCode changes
  useEffect(() => {
    if (editorRef.current && initialCode !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (initialCode !== currentValue) {
        isRemoteChange.current = true;
        editorRef.current.setValue(initialCode);
        setTimeout(() => {
          isRemoteChange.current = false;
        }, 100);
      }
    }
  }, [initialCode]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        const currentCode = editorRef.current.getValue();
        if (code !== currentCode) {
          // Set flag to prevent emitting change event
          isRemoteChange.current = true;
          editorRef.current.setValue(code);
          
          // Reset flag after a short delay
          setTimeout(() => {
            isRemoteChange.current = false;
          }, 100);
        }
      }
    };

    const handleSyncCode = ({ code }) => {
      if (code !== null && editorRef.current) {
        isRemoteChange.current = true;
        editorRef.current.setValue(code);
        onCodeChange(code);
        codeRef.current = code;
        
        setTimeout(() => {
          isRemoteChange.current = false;
        }, 100);
      }
    };

    // Add event listeners
    socketRef.current.on("code-change", handleCodeChange);
    socketRef.current.on("sync-code", handleSyncCode);

    // Add reconnection handling
    socketRef.current.on("reconnect", () => {
      // Request latest code state
      socketRef.current.emit("request-sync", { roomId });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("code-change", handleCodeChange);
        socketRef.current.off("sync-code", handleSyncCode);
        socketRef.current.off("reconnect");
      }
    };
  }, [roomId, onCodeChange]);

  return (
    <div className="h-screen">
      <textarea id="realTimeEditor" className=""></textarea>
    </div>
  );
};

export default Editor;