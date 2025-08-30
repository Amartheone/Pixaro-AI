"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/context/context";
import { IText } from "fabric";
import {
  AlignCenter,
  AlignJustifyIcon,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Type,
  Underline,
} from "lucide-react";
import { Anek_Bangla } from "next/font/google";
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

  const applyFontFamily = (family) => {
    if (!selectedText) return;
    setFontFamily(family); //Update local state
    selectedText.set("fontFamily", family); //Update Fabric.js object property
    canvasEditor.requestRenderAll(); //Re-render to show all changes
  };

  const applyFontSize = (size) => {
    if (!selectedText) return;
    // Handle both direct values from Slider component
    const newSize = Array.isArray(size) ? size[0] : size;
    setFontSize(newSize); ///Update local state

    selectedText.set("fontSize", newSize); //update Fabric.js
    canvasEditor.requestRenderAll();
  };

  const applyTextAlign = (alignment) => {
    if (!selectedText) return;
    setTextAlign(alignment);
    selectedText.set("textAlign", alignment);
    canvasEditor.requestRenderAll();
  };

  const applyTextColor = (color) => {
    if (!selectedText) return;
    setTextColor(color);
    selectedText.set("fill", color); //In Fabric.js, 'fill' property controls text color
    canvasEditor.requestRenderAll();
  };

  const toggleFormat = (format) => {
    if (!selectedText) return;

    switch (format) {
      case "bold": {
        // Toggle between normal and bold font weight
        const current = selectedText.fontWeight || "normal";
        selectedText.set("fontWeight", current === "bold" ? "normal" : "bold");
        break;
      }

      case "italic": {
        // Toggle between normal and italic
        const current = selectedText.fontStyle || "normal";
        selectedText.set(
          "fontStyle",
          current === "italic" ? "normal" : "italic"
        );
        break;
      }

      case "underline": {
        // Toggle between on/off
        const current = selectedText.underline || false;
        selectedText.set("underline", !current);
        break;
      }
    }

    canvasEditor.requestRenderAll();
    setChanged((c) => c + 1); //Force component re-render to update button active states
  };

  const deleteSelectedText = () => {
    if (!canvasEditor || !selectedText) return;

    canvasEditor.remove(selectedText); //Remove from canvas
    canvasEditor.requestRenderAll(); //Re-render canvas 
    setSelectedText(null); //Clear selection state 
  };

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

          {/* Font Size Slider */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <label className="text-xs text-white/70">Font Size</label>
              <span className="text-xs text-white/70">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]} //Slider expects array format
              onValueChange={applyFontSize} //Calls with array format
              min={FONT_SIZES.min}
              max={FONT_SIZES.max}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Text Alignment</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                ["left", AlignLeft],
                ["center", AlignCenter],
                ["right", AlignRight],
                ["justify", AlignJustifyIcon],
              ].map(([align, Icon]) => (
                <Button
                  key={align}
                  onClick={() => applyTextAlign(align)}
                  variant={textAlign === align ? "default" : "outline"} //Active state styling
                  size="sm"
                  className="p-2"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Text Color</label>
            <div className="flex gap-2">
              {/* Native color picker  */}
              <input
                type="color"
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="w-10 h-10 rounded border border-white/20 bg-transparent cursor-pointer"
              />
              {/* Text input for manual hex entry */}
              <Input
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 bg-slate-700 border-white/20 text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Formatting</label>

            <div className="flex gap-2 py-2">
              <Button
                onClick={() => toggleFormat("bold")}
                variant={
                  selectedText.fontWeight === "bold" ? "default" : "outline"
                } //show active if text is bold
                size="sm"
                className="flex-1"
              >
                <Bold className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => toggleFormat("italic")}
                variant={
                  selectedText.fontStyle === "italic" ? "default" : "outline"
                } //show active if text is italic
                size="sm"
                className="flex-1"
              >
                <Italic className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => toggleFormat("underline")}
                variant={selectedText.underline ? "default" : "outline"} //show active if text is bold
                size="sm"
                className="flex-1"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={deleteSelectedText}
            variant="outline"
            className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>Double-click</strong> any text to edit it directly on the
          canvas.
          <br />
          <strong>Select</strong> text to see formatting options here.
        </p>
      </div>
    </div>
  );
};

export default TextControls;
