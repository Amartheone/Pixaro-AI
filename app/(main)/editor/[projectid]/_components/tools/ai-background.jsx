import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { Trash2 } from "lucide-react";
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

  return <div className="space-y-6 relative h-full">
    <div>
        <div>
            <h3 className="text-sm font-medium text-white mb-2">
                AI Background Removal
            </h3>
            <p className="text-xs text-white/70 mb-4">
                Automically remove the background from your image using AI
            </p>
        </div>

        <Button className="w-full" variant="primary">
            <Trash2 className="h-4 w-4 mr-2"/>
            Remove Image Background
        </Button>
    </div>
  </div>;
};

export default BackgroundControls;
