"use client";

import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { IText } from "fabric";
import { Type } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";

const FONT_FAMILIES = [
  "Arial",
  "Arial Black",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

const FONT_SIZES = { min: 8, max: 120, default: 20 };

const TextControls = () => {
  const { canvasEditor } = useCanvas();

  const [selectedText, setSelectedText] = useState(null); //currently selected text object
  const [fontFamily, setFontFamily] = useState("Arial"); //Current font family
  const [fontSize, setFontSize] = useState(FONT_SIZES.default); //Current font size
  const [textColor, setTextColor] = useState("#000000"); //Current text color
  const [textAlign, setTextAlign] = useState("left"); //Current text alignment
  const [_, setChanged] = useState(0); //Force re-render trigger for button states

  const updateSelectedText = () => {
    if (!canvasEditor) return;

    const activeObject = canvasEditor.getActiveObject();

    if (activeObject && activeObject.type === "i-text") {
      setSelectedText(activeObject);

      // Sync UI controls with the selected text's current properties
      setFontFamily(activeObject.fontFamily || "Arial");
      setFontSize(activeObject.fontSize || FONT_SIZES.default);
      setTextColor(activeObject.fill || "#000000");
      setTextAlign(activeObject.textAlign || "left");
    } else {
      // If no text selected, clear the selectedText state
      setSelectedText(null);
    }
  };

  useEffect(() => {
      if (!canvasEditor) return;

      updateSelectedText();

      const handleSelectionCreated = () => updateSelectedText(); //when user selects and object
      const handleSelectionUpdated = () => updateSelectedText(); //when selection changes to different object

      const handleSelectionCleared = () => setSelectedText(null); //when user deselects everything

      canvasEditor.on("selection:created", handleSelectionCreated);
      canvasEditor.on("selection:updated", handleSelectionUpdated);
      canvasEditor.on("selection:cleared", handleSelectionCleared);

      return () => {
        canvasEditor.off("selection:created", handleSelectionCreated);
        canvasEditor.off("selection:updated", handleSelectionUpdated);
        canvasEditor.off("selection:cleared", handleSelectionCleared);
      };
  }, [canvasEditor]);

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  const addText = () => {
    if (!canvasEditor) return;

    const text = new IText("Edit this text", {
      left: canvasEditor.width / 2, //center horizontally
      top: canvasEditor.height / 2, //center vertically
      originX: "center", //use center as horizontal origin point
      originY: "center", // use center as vertical origin point
      fontFamily, //use current font family setting
      fontSize: FONT_SIZES.default,
      fill: textColor, //use current color setting
      textAlign, //use current allignment setting
      editable: true, //to allow direct text editing on the canvas
      selectable: true, //to allow object selection and transformation on the canvas
    });

    canvasEditor.add(text);
    canvasEditor.setActiveObject(text);
    canvasEditor.requestRenderAll(); //trigger re-render

    setTimeout(() => {
      text.enterEditing(); //switch to text editing mode
      text.selectAll(); // select all text for immediate editing
    }, 100);
  };

  const applyFontFamily = (family) => {};

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Add Text</h3>
          <p className="text-xs text-white/70 mb-4">
            Click to add editable text to your canvas
          </p>
        </div>
        <Button onClick={addText} className="w-full" variant="primary">
          <Type className="h-4 w-4 mr-2" />
          Add Text
        </Button>
      </div>

      {selectedText && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-sm font-medium text-white mb-4">
            Edit Selected Text
          </h3>

          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Font Family</label>

            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded text-white text-sm"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextControls;
