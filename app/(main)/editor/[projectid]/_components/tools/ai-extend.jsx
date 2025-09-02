"use client";

import { useCanvas } from "@/context/context";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Wand2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FabricImage } from "fabric";
import { toast } from "sonner";

const DIRECTIONS = [
  { key: "top", label: "Top", icon: ArrowUp },
  { key: "bottom", label: "Bottom", icon: ArrowDown },
  { key: "right", label: "Right", icon: ArrowRight },
  { key: "left", label: "Left", icon: ArrowLeft },
];

const FOCUS_MAP = {
  left: "fo-right", //Original image stays on right when extending left
  right: "fo-left", //Original image stays on left when extending right
  top: "fo-bottom", //Original image stays on bottom when extending top
  bottom: "fo-top", //Original image stays on top when extending bottom
};

const AIExtenderControls = (project) => {
  const { canvasEditor, setProcessingMessage } = useCanvas();

  const [selectedDirection, setSelectedDirection] = useState(null);

  const [extensionAmount, setExtensionAmount] = useState(200);

  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject
  );

  const getMainImage = () =>
    canvasEditor?.getObjects().find((obj) => obj.type === "image") || null; //to find the image

  const getImageSrc = (image) =>
    image?.getSrc?.() || image?._element?.src || image?.src; //to extract the image get url

  const hasBackgroundRemoval = () => {
    const imageSrc = getImageSrc(getMainImage());
    return (
      imageSrc.includes("e-bgremove") || //Imagekit background removal
      imageSrc.includes("e-removedotbg") || //Alternative background removal
      imageSrc.includes("e-changebg") //Background change (also removes original)
    );
  };

  if (hasBackgroundRemoval()) {
    return (
      <div className="bg-amber-500/10 border-amber-500/20 rounded-lg p-4">
        <h3 className="text-amber-300/80 font-medium mb-2">
          Extension not available
        </h3>
        <p className="text-amber-300/80 text-sm">
          AI Extension cannot be used on images with removed backgrounds. Use
          extension first, then remove background.
        </p>
      </div>
    );
  }

  const calculateDimensions = () => {
    const image = getMainImage();

    if (!image || !selectedDirection) return { width: 0, height: 0 };

    const currentWidth = image.width * (image.scaleX || 1);
    const currentHeight = image.height * (image.scaleY || 1);

    const isHorizontal = ["left", "right"].includes(selectedDirection);
    const isVertical = ["top", "bottom"].includes(selectedDirection);

    return {
      //Add extension amount only to relevant dimension
      width: Math.round(currentWidth + (isHorizontal ? extensionAmount : 0)),
      height: Math.round(currentHeight + (isVertical ? extensionAmount : 0)),
    };
  };

  const selectDirection = (direction) => {
    setSelectedDirection((prev) => (prev === direction ? null : direction));
  };

  const buildExtensionUrl = (imageUrl) => {
    const baseUrl = imageUrl.split("?")[0];
    const { width, height } = calculateDimensions();

    const transformations = [
      "bg-genfill", //AI generative fills for new areas
      `w-${width}`, //New width
      `h-${height}`, //New height
      "cm-pad_resize", //Pad resize mode (adds space rather than cropping)
    ];

    const focus = FOCUS_MAP[selectedDirection];
    if (focus) transformations.push(focus);

    return `${baseUrl}?tr=${transformations.join(",")}`;
  };

  const applyExtension = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !selectedDirection) return;

    setProcessingMessage("Extending image with AI...");

    try {
      const currentImageUrl = getImageSrc(mainImage);
      const extendedUrl = buildExtensionUrl(currentImageUrl);

      const extendedImage = await FabricImage.fromURL(extendedUrl, {
        crossOrigin: "anonymous", //Required CORS
      });

      const scale = Math.min(
        project.width / extendedImage.width, //scale to fit width
        project.height / extendedImage.height, //scale to fit height
        1 //dont scale up only down
      );

      extendedImage.set({
        left: project.width / 2, //Center horizontally
        top: project.height / 2, //Center vertically
        originX: "center", // Use center as origin for positioning
        originY: "center", // Use center as origin for positioning
        scaleX: scale, // Apply calculated scale
        scaleY: scale, //Apply calculated scale
        selectable: true, // Allow user to select/move
        evented: true, //Allow events (hover, click, etc.)
      });

      canvasEditor.remove(mainImage); //To remove original image
      canvasEditor.add(extendedImage); //To add extended image
      canvasEditor.setActiveObject(extendedImage); //select the new image
      canvasEditor.requestRenderAll(); //To refresh the canvas display

      await updateProject({
        projectId: project._id,
        currentImageUrl: extendedUrl, //Update the current image URL
        canvasState: canvasEditor.toJSON(), //save the canvas state 
      })
      
      toast.success("Image Extended Successfully")
      setSelectedDirection(null);
    } catch (error) {
      console.error("Error in applying the extension", error);
      toast.error("Failed to extend the image. Please try again")
    }finally{
      //Always we should hide the processing msg
      setProcessingMessage(null)
    }
  };

  const { width: newWidth, height: newHeight } = calculateDimensions();
  const currentImage = getMainImage();

  return (
    <div className="space-y-6">
      <div className="">
        <h3 className="text-sm font-medium text-white mb-3">
          Select Extension Direction
        </h3>
        <p className="text-xs text-white/70 mb-3">
          Choose one direction to extend your image
        </p>

        <div className="grid grid-cols-2 gap-3">
          {DIRECTIONS.map(({ key, label, icon: Icon }) => {
            return (
              <Button
                key={key}
                onClick={() => selectDirection(key)}
                variant={selectedDirection === key ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  selectedDirection === key
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-white">Extension Amount</label>
          <span className="text-xs text-white/70">{extensionAmount}px</span>
        </div>
        <Slider
          value={[extensionAmount]}
          onValueChange={([value]) => setExtensionAmount(value)}
          min={50} //Minimum extension
          max={500} //Maximum extension
          step={25} //Step size
          className="w-full"
          disabled={!selectedDirection} //disable if no direction selected
        />
      </div>

      {selectDirection && (
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">
            Extension Preview
          </h4>

          <div className="text-xs text-white/70 space-y-1">
            <div>
              Current:{"  "}
              {Math.round(
                currentImage.width * (currentImage.scaleX || 1)
              )} x{" "}
              {Math.round(currentImage.height * (currentImage.scaleY || 1))}px
            </div>

            <div className="text-cyan-400">
              Extended: {newWidth} x {newHeight}px
            </div>

            <div className="text-white/50">
              Canvas: {project.width} x {project.height}px (unchanged)
            </div>

            <div className="text-cyan-300">
              Direction:{" "}
              {DIRECTIONS.find((d) => d.key === selectedDirection)?.label}
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={applyExtension}
        disabled={!selectedDirection}
        className="w-full"
        variant="primary"
      >
        <Wand2 className="h-4 w-4 mr-1" />
        Apply AI Extension
      </Button>

      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>How it works:</strong> Select one direction → Set amount →
          Apply Extension.
          <br />
          AI will inteligently fill the new area in that direction.
        </p>
      </div>
    </div>
  );
};

export default AIExtenderControls;
