import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Crown, Loader2 } from "lucide-react";
import React from "react";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";


const NewProjectModal = ({ isOpen, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleClose = () => {
    onClose();
  };

  const { isFree, canCreateProject } = usePlanAccess();
  const { data: projects } = useConvexQuery(api.projects.getUserProjects);
  const { mutate: createProject } = useConvexMutation(api.projects.create);

  const currentProjectCount = projects?.length || 0;
  const canCreate = canCreateProject(currentProjectCount);

  const handleCreateProject=()=> {}

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Create New Project
            </DialogTitle>

            {isFree && (
              <Badge variant="secondary" className="bg-slate-700 text-white/70">
                {currentProjectCount}/3 projects
              </Badge>
            )}
          </DialogHeader>

          <div className="spce-y-6">
            {isFree && currentProjectCount >= 2 && (
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <Crown className="h-5 w-5 text-amber-400" />
                <AlertDescription className="text-amber-300/80">
                  <div className="font-semibold text-amber-400 mb-1">
                    {currentProjectCount === 2
                      ? "Last Free Project"
                      : "Project Limit Reached"}

                    {currentProjectCount === 2
                      ? "This will be your last free project. Upgrade to Pixaro Pro for unlimited projects."
                      : "Free plan is limited to 3 projects. Upgrade to Pixaro Pro to create more projects."}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Area */}
          </div>
          <DialogFooter className={"gap-3"}>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading}
              className="text-white/70 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateProject}
              disabled={!selectedFile || !projectTitle.trim() || isUploading}
              variant="primary"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating..
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewProjectModal;
