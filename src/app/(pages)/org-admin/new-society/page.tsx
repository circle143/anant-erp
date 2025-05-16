"use client";
import React from "react";
import Society from "@/components/Forms/Society";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { new_society } from "@/utils/breadcrumbs";
const page = () => {
  return (
    <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
      <CustomBreadcrumbs items={new_society} />
      <Society />
    </div>
  );
};

export default page;
