"use client";

import { useRouter } from "next/navigation";
import React from "react";
import ProjectCard from "./project-card";

const ProjectGrid = ({projects}) => {
  const router = useRouter();

  const handleEditProject = (projectId) => {
    router.push(`/editor/${projectId}`);
  };
  
  return (
    <div>
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onEdit={() => handleEditProject(project._id)}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
