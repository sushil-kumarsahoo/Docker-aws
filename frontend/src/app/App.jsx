import "./App.css";
import {Editor} from "@monaco-editor/react";

function App() {
  return <div className="h-screen w-full bg-gray-900 text-white flex gap-2 p-2">
    <aside className="h-full w-1/4 bg-amber-50 rounded-lg"></aside>
    <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language="javascript"
        theme="vs-dark"
      />
    </section>
  </div>;
}

export default App;
