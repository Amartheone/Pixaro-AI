import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import {
  Download,
  Image,
  ImageIcon,
  Loader2,
  Palette,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import React from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

const BackgroundControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();

  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); //default bg color
  const [searchQuery, setSearchQuery] = useState(""); //User's   search input
  const [unsplashImages, setUnsplashImages] = useState([]); //Search results from Unsplash
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
      console.error("Error removing background:", error);
      toast.error("Failed to remove the background. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleColorBackground = () => {
    if (!canvasEditor) return;

    canvasEditor.backgroundColor = backgroundColor;
    canvasEditor.requestRenderAll(); //Re-render to show the change
  };

  const searchUnsplashImage = async () => {
    if (!searchQuery.trim() || !UNSPLASH_ACCESS_KEY) return;

    setIsSearching(true); //show loading state
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`, //Unsplash requires this format
          },
        }
      );

      if (!response.ok) toast.error("Failed to search images");

      const data = await response.json();
      setUnsplashImages(data.results || []); //Store search results
    } catch (error) {
      console.error("Error searching Unsplash:", error);
      toast.error("Failed to search images. Please try again");
    } finally {
      setIsSearching(false); //Hide loading state
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUnsplashImage();
    }
  };

  const handleImageBackground = async (imageUrl, imageId) => {
    if (!canvasEditor) return;

    setSelectedImageId(imageId); //Show loading for this specific image

    try {
      if (UNSPLASH_ACCESS_KEY) {
        fetch(`${UNSPLASH_API_URL}/photos/${imageId}/download`, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }).catch(() => {}); //Silent fall - analytics tracking shouldn't break functionality
      }

      const fabricImage = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous", //Required for CORS
      });

      const canvasWidth = project.width; //Logical canvas width
      const canvasHeight = project.height; //Logical canvas height

      const scaleX = canvasWidth / fabricImage.width;
      const scaleY = canvasHeight / fabricImage.height;

      const scale = Math.max(scaleX, scaleY);

      fabricImage.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center", //Center image horizontally
        originY: "center", //center image vertically
        left: canvasWidth / 2, //Position of canvas center x
        top: canvasHeight / 2, //Position of canvas center y
      });

      canvasEditor.backgroundImage = fabricImage;
      canvasEditor.requestRenderAll();

      setSelectedImageId(null);//clear loading state
    } catch (error) {
      console.error("Error setting background image:", error);
      toast.error("Failed to set background image. Please try again.")
      setSelectedImageId(null); //clear loading state
    }
  };

  const handleRemoveBackground = async(imageUrl, imageId) => {
    
  }

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

        {/* show warning if now image available */}
        {!getMainImage() && (
          <p className="text-xs text-amber-400">
            Please add an image to canvas first to remove its background
          </p>
        )}
      </div>

      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid grid-cols-2 bg-slate-700/50">
          <TabsTrigger
            value="color"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>
        <TabsContent value="color" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Solid Color Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Choose a solid color for your canvas background
            </p>
          </div>

          <div className="space-y-4">
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
              style={{ width: "100%" }}
            />

            <div className="flex items-center gap-2">
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="w-10 h-10 flex-1 bg-slate-700 rounded-b-lg border border-white/20 text-white"
              />
              {/* Color Preview circle */}
              <div
                className="w-10 h-10 rounded-full border border-white/20"
                style={{ backgroundColor }}
              />
            </div>

            <Button
              onClick={handleColorBackground}
              className="w-full"
              variant="primary"
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Color
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="image" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Image Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Search and use high-quality images from Unsplash
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search for backgrounds..."
              className="flex-1 bg-slate-700 border-white/20 text-white"
            />
            <Button
              onClick={searchUnsplashImage}
              disabled={isSearching || !searchQuery.trim()} //Disable if searching or empty query
              variant="primary"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {unsplashImages?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">
                Search Results ({unsplashImages?.length})
              </h4>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {unsplashImages.map((image) => {
                  return (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-colors"
                      onClick={() => {
                        handleImageBackground(image.urls.regular, image.id);
                      }}
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || "Background image"}
                        className="w-full h-24 object-cover "
                      />

                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Download className="h-5 w-5 text-white" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                        <p className="text-xs text-white/80 truncate">
                          bg {image.user.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isSearching && unsplashImages?.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                No images found for "{searchQuery}"
              </p>
              <p className="text-white/70 text-xs">
                Try a different search term
              </p>
            </div>
          )}

          {!searchQuery && unsplashImages?.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                Search for background images
              </p>
              <p className="text-white/50 text-xs">Powered Unsplash</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-white/10 absolute bottom-0 w-full">
        <Button
        onClick={handleRemoveBackground}
        className="w-full"
        variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas Background
        </Button>
      </div>
    </div>
  );
};

export default BackgroundControls;
