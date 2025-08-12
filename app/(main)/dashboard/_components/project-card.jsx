import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

const ProjectCard = ({ project, onEdit }) => {
  const {mutate: deleteProject,isLoading} = useConvexMutation(
    api.projects.deleteProject
  );

const handleDelete = async() => {}

  return (
    <Card className="py-0 group relative bg-slate-800/50 overflow-hidden hover:border-white/20 transition-all hover:transform hover:scale-[1.02] ">
      <div className="aspect-video bg-slate-700 relative overflow-hidden">
        {project.thumbnailUrl && (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}

        <div>
          <Button variant="glass" size="sm" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Button 
          variant="glass"
          size="sm"
          onClick={handleDelete}
          className="gap-2 text-red-400 hover:text-red-300"
          disabled = {isLoading}
          >
            <Trash2 className="h-4 w-4"/>
            Delete
          </Button>
        </div>
      </div>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
