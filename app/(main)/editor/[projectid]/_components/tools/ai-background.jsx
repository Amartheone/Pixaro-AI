import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import { Trash2 } from "lucide-react";
import { Prociono } from "next/font/google";
import { useState } from "react";
import React from "react";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

const BackgroundControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();

  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); //default bg color
  const [searchQuery, setSearchQuery] = useState(""); //User's   search input
  const [unsplashImages, setUnsplashImages] = useState(null); //Search results from Unsplash
  const [isSearching, setIsSearching] = useState(false); //Loading state for search
  const [selectedImageId, setSelectedImageId] = useState(null); //Track which image is being proccessed

  const getMainImage = () => {
    if (!canvasEditor) return null;
    const objects = canvasEditor.getObjects(); //Get all objects on canvas
    return objects.find((obj) => obj.type === "image") || null; //Find first image object
  };
  const handleBackgroundRemoval = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;

    setProcessingMessage("Removing background with AI...");

    try {
      const currentImageUrl =
        project.currentImageUrl || project.originalImageUrl;

      const bgRemovedUrl = currentImageUrl.includes("ik.imagekit.io")
        ? `${currentImageUrl.split("?")[0]}?tr=e-bgremove`
        : currentImageUrl;

      const proccessedImage = await FabricImage.fromURL(bgRemovedUrl, {
        crossOrigin: "anonymous", //Required for CORS when loading external images
      });

      const currentProps = {
        left: mainImage.left, //X position
        top: mainImage.top, //Y Position
        scaleX: mainImage.scaleX, //Horizontal scale
        scaleY: mainImage.scaleY, //Vertical scale
        angle: mainImage.angle, //Rotation angle
        originX: mainImage.originX, // Transform X
        originY: mainImage.originY, //Transform Y
      };

      canvasEditor.remove(mainImage); //Remove original image
      proccessedImage.set(currentProps); //Apply saved properties
      canvasEditor.add(proccessedImage); //Add processed image

      proccessedImage.setCoords();

      canvasEditor.setActiveObject(proccessedImage);
      canvasEditor.calcOffset(); // Recalculate canvas offset for proper mouse interactions
      canvasEditor.requestRenderAll(); //Force rerender
    } catch (error) {
        console.error("Error removing background:", error );
        toast.error("Failed to remove the background. Please try again.")
    }finally{
        setProcessingMessage(null);
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div>
        <div>
          <h3 className="text-sm font-medium text-white mb-2">
            AI Background Removal
          </h3>
          <p className="text-xs text-white/70 mb-4">
            Automically remove the background from your image using AI
          </p>
        </div>

        <Button
          className="w-full"
          variant="primary"
          onClick={handleBackgroundRemoval}
          disabled={processingMessage || !getMainImage()} // Disable if processing or no image
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Image Background
        </Button>
      </div>
    </div>
  );
};

export default BackgroundControls;
