"use client";

import { useParams } from "next/navigation";
import React from "react";

const Editor = () => {
  const params = useParams();
  const projectId = params.projectId;

  return <div>Editor: {projectId}</div>;
};

export default Editor;