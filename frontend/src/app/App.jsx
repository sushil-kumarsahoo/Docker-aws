import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { useState, useEffect } from "react";

function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider(
        "http://localhost:3000",
        "monaco-room",
        ydoc,
        { autoconnect: true },
      );

      provider.awareness.setLocalStateField("user", { username });

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .filter(state => state.user && state.user?.username)
            .map(state => state.user),
        );
      });

      const states = Array.from(provider.awareness.getStates().values());
      setUsers(
        states
          .filter(state => state.user && state.user?.username)
          .map(state => state.user),
      );

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        provider?.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [username, ydoc, ytext]);

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-900 text-white flex gap-2 p-2 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Enter your username</h1>
          <input
            type="text"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-900 font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex gap-2 p-2">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        <h1 className="text-gray-900 text-2xl font-bold p-2">Users</h1>
        <ul className="p-2">
          {users.map((user, index) => (
            <li key={index} className="text-white bg-gray-900 p-2 mb-2 ">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </div>
  );
}

export default App;
