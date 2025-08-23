"use client";

import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import {
  Crop,
  Maximize,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Square,
} from "lucide-react";
import { Rect } from "fabric";
import { useEffect, useState } from "react";
import React from "react";

const ASPECT_RATIOS = [
  { label: "Freeform", value: null, icon: Maximize },
  { label: "Square", value: 1, icon: Square, ratio: "1:1" },
  {
    label: "Widescreen",
    value: 16 / 9,
    icon: RectangleHorizontal,
    ratio: "16:9",
  },
  { label: "Portrait", value: 4 / 5, icon: RectangleVertical, ratio: "4:5" },
  { label: "Story", value: 9 / 16, icon: Smartphone, ratio: "9:16" },
];

const CropContent = () => {
  const { canvasEditor, activeTool } = useCanvas();

  const [SelectedImage, setSelectedImage] = useState(null); //The image cropped
  const [isCropMode, setIsCropMode] = useState(false); // Whether crop more is active or not
  const [selectedRatio, setSelectedRatio] = useState(null); //Currently selected aspect ratio
  const [cropRect, setCropRect] = useState(null); //The blue crop rectangle overlay
  const [originalProps, setOriginalProps] = useState(null); //Store original image properties for restoration

  const getActiveImage = () => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();

    if (activeObject && activeObject.type === "image") return activeObject;

    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type == "image") || null;
  };

  useEffect(() => {
    if (activeTool === "crop" && canvasEditor && isCropMode) {
      const image = getActiveImage();

      if (image) {
        initializeCropMode(image);
      } else if (activeTool !== "crop" && isCropMode) {
        exitCropMode();
      }
    }
  }, [activeTool, canvasEditor]);

  useEffect(() => {
    return () => {
      if (isCropMode) {
        exitCropMode();
      }
    };
  });

  const exitCropMode = () => {
    if (!isCropMode) return;

    removeAllCropRectangles();
    setCropRect(null);

    if (SelectedImage && originalProps) {
      SelectedImage.set({
        selectable: originalProps.selectable,
        evented: originalProps.evented,
        // restored position and tranformation
        left: originalProps.left,
        top: originalProps.top,
        scaleX: originalProps.scaleX,
        scaleY: originalProps.scaleY,
        angle: originalProps.angle,
      });

      canvasEditor.setActiveObject(SelectedImage);
    }

    setIsCropMode(null);
    setSelectedImage(null);
    setOriginalProps(null);
    setSelectedRatio(null);

    if(canvasEditor){
      canvasEditor.requestRenderAll();
    }
  };

  const createCropRectangle = (image) => {
    const bounds = image.getBoundingRect();

    const cropRectangle = new Rect({
      left: bounds.left + bounds.width * 0.1,
      top: bounds.top + bounds.height * 0.1,
      width: bounds.width * 0.8,
      height: bounds.height * 0.8,
      fill: "Transparent", //See through interior
      stroke: "00bcd4", //Cyan border color
      strokeWidth: 2,
      strokeDashArray: [5, 5], //Dashed line effect
      selectable: true, //User can select and resize
      evented: true,
      name: "cropRect", //Identifier for this rectangle

      // VISUAL STYLING FOR CROP HANDLES
      cornerColor: "00bcd4", //Cyan resize handles
      cornerSize: 12,
      transparentCorners: false,
      cornerStyle: "circle",
      borderColor: "00bcd4",
      borderScaleFactor: 1,

      // Custom property to identify crop rectangles
      isCropRectangle: true,
    });

    cropRectangle.on("scaling", (e) => {
      const rect = e.target;

      if (selectedRatio && selectedRatio !== null) {
        const currentRatio =
          (rect.width * rect.scaleX) / (rect.height * rect.scaleY);

        if (Math.abs(currentRatio - selectedRatio) > 0.1) {
          const newHeight =
            (rect.width * rect.scaleX) / selectedRatio / rect.scaleY;
          rect.set("height", newHeight);
        }
      }

      canvasEditor.requestRenderAll();
    });

    canvasEditor.add(cropRectangle);
    canvasEditor.setActiveObject(cropRectangle);
    setCropRect(cropRectangle);
  };

  const removeAllCropRectangles = () => {
    if (!canvasEditor) return;

    const objects = canvasEditor.getObjects();
    const rectsToRemove = objects.filter((obj) => obj.type === "rect");

    rectsToRemove.forEach((rect) => {
      canvasEditor.remove(rect);
    });

    canvasEditor.requestRenderAll();
  };

  const initializeCropMode = (image) => {
    if (!image || isCropMode) return; // Prevent double initialization

    removeAllCropRectangles();

    const original = {
      left: image.left,
      top: image.top,
      width: image.width,
      height: image.height,
      scaleX: image.scaleX,
      scaleY: image.scaleY,
      angle: image.angle || 0,
      selectable: image.selectable,
      evented: image.evented,
    };

    setOriginalProps(original);
    setSelectedImage(image);
    setIsCropMode(true);

    image.set({
      selectable: false,
      evented: false,
    });
    createCropRectangle(image);
    canvasEditor.requestRenderAll();
  };

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  const activeImage = getActiveImage();

  return (
    <div className="space-y-6">
      {isCropMode && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
          <p className="text-cyan-400 text-sm font-medium">
            ✂️ Crop Mode Active
          </p>
          <p className="text-cyan-300/80 text-xs mt-1">
            Adjust the blue rectange to set the crop area.
          </p>
        </div>
      )}

      {!isCropMode && activeImage && (
        <Button
          onClick={() => initializeCropMode(activeImage)}
          className="w-full"
          variant="primary"
        >
          <Crop className="h-4 w-4 mr-2" />
          Start Cropping
        </Button>
      )}

      {isCropMode &&(
        <div>
          <h3 className="text-sm font-medium text-white mb-3">
            Crop aspect ratio
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((ratio)=>{
              const IconComponent = ratio.icon;

              return(
                <button
                key={ratio.label}
                onClick={()=>applyAspectRatio(ratio.value)}
                >
                  <IconComponent className="h-6 w-6 mx-auto mb-2 text-white" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropContent;
