"use client";

import { CanvasContext } from "@/context/context";
import { Monitor } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const Editor = () => {
  const params = useParams();
  const projectId = params.projectId;

  const [canvasEditor, setCanvasEditor] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(null);

  const [activeTool, setActiveTool] = useState("resize");

  return (
    <CanvasContext.Provider
      value={{
        canvasEditor,
        setCanvasEditor,
        setActiveTool,
        activeTool,
        onToolChange: setActiveTool,
        processingMessage,
        setProcessingMessage,
      }}
    >
      <div className="lg:hidden min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {" "}
          <Monitor className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Desktop Required
          </h1>
          <p className="text-white/70 text-lg mb-2">
            This editor is only usable on desktop.
          </p>
          <p className="">
            Please use a larger screen to access the full editing experience.
          </p>
        </div>
      </div>

      <div className="hidden lg:block min-h-screen bg-slate-900">
        Editor: {projectId}
        </div>
    </CanvasContext.Provider>
  );
};

export default Editor;
