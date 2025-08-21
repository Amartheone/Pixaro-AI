"use client";

import { useCanvas } from "@/context/context";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";

// Common aspect ratios
const ASPECT_RATIOS = [
  { name: "Instagram Story", ratio: [9, 16], label: "9:16" },
  { name: "Instagram Post", ratio: [1, 1], label: "1:1" },
  { name: "Youtube Thumbnail", ratio: [16, 9], label: "16:9" },
  { name: "Portrait", ratio: [2, 3], label: "2:3" },
  { name: "Facebook Cover", ratio: [851, 315], label: "2.7:1" },
  { name: "Twitter Header", ratio: [3, 1], label: "3:1" },
];

const ResizeControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();

  const [newWidth, setNewWidth] = useState(project?.width || 800); //Target width
  const [newHeight, setNewHeight] = useState(project?.height || 600); //Target height
  const [lockAspectRatio, setLockAspectRatio] = useState(true); //whether to maintain proportions
  const [selectedPreset, setSelectedPreset] = useState(null); //Currently selected preset

  const {
    mutate: updateProject,
    data,
    isLoading,
  } = useConvexMutation(api.projects.updateProject);

  const handleWidthChange = (value) => {
    const width = parseInt(value) || 0;
    setNewWidth(width);

    if(lockAspectRatio && project){
      const ratio = project.height / project.width; //current aspect ratio
      setNewHeight(Math.round(width*ratio)); //Apply ratio to new width
    }
    setSelectedPreset(null);
  };
  
  const handleHeightChange = (value) => {
    const height = parseInt(value) || 0;
    setNewWidth(height);

    if(lockAspectRatio && project){
      const ratio = project.width / project.height; //Inverse aspect ratio
      setNewHeight(Math.round(height*ratio)); //Apply ratio to new height
    }
    setSelectedPreset(null);
  };

  if (!canvasEditor || !project) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  const hasChanges = newWidth !== project.width || newHeight !== project.height;

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2"> Current Size</h4>
        <div className="text-xs text-white/70">
          {project.width} x {project.height} pixels
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Custom Size</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className="text-white/70 hover:text-white p-1"
          >
            {lockAspectRatio ? (
              <Lock className="w-4 h-4" /> //Locked - proportions maintained
            ) : (
              <Unlock className="h-4 w-4" /> //Unlocked - free size
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/70 mb-1 block">Width</label>
            <Input
              type="number"
              value={newWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="100" //Minimum reasonable canvas width
              max="5000" //Maximum to prevent memory issues
              className="bg-slate-700 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">Height</label>
            <Input
              type="number"
              value={newHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="100" //Minimum reasonable canvas width
              max="5000" //Maximum to prevent memory issues
              className="bg-slate-700 border-white/20 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizeControls;
