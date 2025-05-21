"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EditApplicant from "@/components/edit-applicant-details/page";
import EditCompany from "@/components/edit-company-details/page";

const page = () => {
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const reraNumber = searchParams.get("reraNumber");
  const id = searchParams.get("id");

  if (!type || !reraNumber || !id) {
    return <div>Invalid URL parameters</div>;
  }

  return (
    <div>
      {type === "user" ? (
        <EditApplicant reraNumber={reraNumber} id={id} />
      ) : (
        <EditCompany reraNumber={reraNumber} id={id} />
      )}
    </div>
  );
};

export default page;
