"use client";

import { useCanvas } from "@/context/context";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Canvas, FabricImage } from "fabric";

const canvasEditor = ({ project }) => {
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef();
  const containerRef = useRef();

  const { canvasEditor, setCanvasEditor, activeTool, onToolChange } =
    useCanvas();

  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject
  );

  const calculateViewportScale = () => {
    if (!containerRef || !project) return 1;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // togive 40px padding
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / project.width; // to get the ratio
    const scaleY = containerHeight / project.height; // to get the ratio

    // use the smaller scale to ensure the canvas fits completely
    // Cap at 1 to prevent upscaling beyond original size
    return Math.min(scaleX, scaleY, 1);
  };

  useEffect(() => {
    if (!canvasRef.current || !project || canvasEditor) return;

    const initializeCanvas = async () => {
      setIsLoading(true);

      const viewportScale = calculateViewportScale();

      const canvas = new Canvas(canvasRef.current, {
        width: project.width, //Logical canvas width (design dimensions)
        height: project.height, //Logical canvas height (design dimesnions)

        backgroundColor: "#ffffff", //default white background

        preserveObjectStacking: true, //to maintain the object order
        controlsAboveOverlay: true, //show selection controls above overlay
        selection: true, //enable object selection

        hoverCursor: "move", //cursor when hovering over objects
        moveCursor: "move", //cursor when moving objects
        defaultCursor: "default", // default cursor

        allowTouchScrolling: false, //disable touch scrolling (prevents conflicts)
        renderOnAddRemove: true, //auto-render when objects are added or removed
        skipTargetFind: false, //allow object targeting for interactions
      });

      canvas.setDimensions(
        {
          width: project.width * viewportScale, //scaled display width
          height: project.height * viewportScale, //scaled display height
        },
        { backstoreOnly: false }
      );

      // Apply zoom to scale the entire canvas content
      canvas.setZoom(viewportScale);

      const scaleFactor = window.devicePixelRatio || 1;
      if (scaleFactor > 1) {
        // Increase canvas resolution for high DPI displays
        canvas.getElement.width = project.width * scaleFactor;
        canvas.getElement.height = project.height * scaleFactor;
        // scale the drawing context to match
        canvas.getContext().scale(scaleFactor, scaleFactor);
      }

      //to load image
      if (project.currentImageUrl || project.originalImageUrl) {
        try {
          // use current image if available(may have transformations), fallback to original
          const imageUrl = project.currentImageUrl || project.originalImageUrl;

          const fabricImage = await FabricImage.fromURL(imageUrl, {
            crossOrigin: "anonymous", //Handle CORS for external images
          });
          //   calculate scaling to fit image within canvas while maintaining the aspect ratio
          const imgAspectRatio = fabricImage.width / fabricImage.height;
          const canvasAspectRatio = project.width / project.height;

          let scaleX, scaleY;

          if (imgAspectRatio > canvasAspectRatio) {
            // image is wider than canvas - scale based on width
            scaleX = project.width / fabricImage.width;
            scaleY = scaleX; // maintain aspect ratio
          } else {
            //Image is taller than canvas - scale based on height
            scaleY = project.height / fabricImage.height;
            scaleX = scaleY; // to maintain the aspect ratio
          }

          fabricImage.set({
            left: project.width / 2, //center horizontally
            top: project.height / 2, //to center vertically
            originX: "center", // Transform origin at center
            originY: "center", // Transform origin at center
            scaleX, //Horizontal scale factor
            scaleY, //vertical scale factor
            selectable: true, //Allow user to select or move image
            evented: true, //enable mouse/ touch events
          });

          // Add image to the canvas and ensure its centered
          canvas.add(fabricImage);
          canvas.centerObject(fabricImage);
        } catch (error) {
          console.error("Error in loading project image: ", error);
        }
      }

      if (project.canvasState) {
        try {
          // Load JSON state - this will restore all objects and their properties
          await canvas.loadFromJSON(project.canvasState);
          canvas.requestRenderAll(); //Force re-render all after loading state
        } catch (error) {
          console.error("Error loading canvas state:", error);
        }
      }

      canvas.calcOffset(); //Recalculate canvas position for event handling
      canvas.requestRenderAll(); //Trigger initial render
      setCanvasEditor(canvas); //Store canvas instance in context

      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 500);

      setIsLoading(false);
    };
    initializeCanvas();

    return () => {
      if (canvasEditor) {
        canvasEditor.dispose(), //Fabric.js cleanup method
        setCanvasEditor(null);
      }
    };
  }, [project]); //project dependency mai dia kyunki if the project changes then it will come into effect.

  const saveCanvasState = async () => {
    if (!canvasEditor || !project) return;

    try {
      //export canvas to json format (includes all objects and properties)
      const canvasJSON = canvasEditor.toJSON();

      //to save in convex database
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
      });
    } catch (error) {
      console.error("Error saving canvas state:", error);
    }
  };

  useEffect(() => {
    if (!canvasEditor) return;

    let saveTimeout;
    // Debounced save function - waits 2 seconds after last change
    const handleCanvasChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveCanvasState();
      }, 2000); //2sec delay
    };

    //Listen to canvas modification events
    canvasEditor.on("object:modified", handleCanvasChange); //object transformed or moved
    canvasEditor.on("object:added", handleCanvasChange); //new object added
    canvasEditor.on("object:removed", handleCanvasChange); //object deleted

    return () => {
      clearTimeout(saveTimeout);
      canvasEditor.off("object:modified", handleCanvasChange);
      canvasEditor.off("object:added", handleCanvasChange);
      canvasEditor.off("object:removed", handleCanvasChange);
    };
  }, [canvasEditor]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasEditor || !project) return;

      // Recalculate optimal scale for new window size
      const newScale = calculateViewportScale();

      // Update canvas display dimensions
      canvasEditor.setDimensions(
        {
          width: project.width * newScale,
          height: project.height * newScale,
        },
        { backstoreOnly: false }
      );

      canvasEditor.setZoom(newScale);
      canvasEditor.calcOffset(); //to update mouse event coordinates
      canvasEditor.requestRenderAll(); //re-render with new dimensions
    };
  }, [canvasEditor, project]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #64748b 25%, transparent 25%),
            linear-gradient(-45deg, #64748b 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #64748b 75%),
            linear-gradient(-45deg, transparent 75%, #64748b 75%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-8 h-8" />{" "}
            <p className="text-white/70 text-sm">Loading canvas.....</p>
          </div>
        </div>
      )}

      <div className="px-5">
        <canvas id="canvas" className="border" ref={canvasRef} />
      </div>
    </div>
  );
};

export default canvasEditor;
