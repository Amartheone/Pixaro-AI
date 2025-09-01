"use client";

import { useCanvas } from "@/context/context";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import React from "react";

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

const AIExtenderControls = () => {
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

  const { width: newWidth, height: newHeight } = calculateDimensions();

  return <div>AIExtenderControls</div>;
};

export default AIExtenderControls;
