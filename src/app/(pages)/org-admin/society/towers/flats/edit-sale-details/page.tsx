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
  const flatId = searchParams.get("flatId");
  const ownerIndex = searchParams.get("ownerIndex");
  
  const towerId = searchParams.get("towerId");
  if (!type || !reraNumber || !id) {
    return <div>Invalid URL parameters</div>;
  }

  return (
    <div>
      {type === "user" ? (
        <EditApplicant
          reraNumber={reraNumber}
          id={id}
          flatId={flatId ?? undefined}
          ownerIndex={ownerIndex ? parseInt(ownerIndex, 10) : undefined}
          route="towers"
          towerId={towerId ?? undefined}
        />
      ) : (
        <EditCompany
          reraNumber={reraNumber}
          id={id}
          route="towers"
          towerId={towerId ?? undefined}
        />
      )}
    </div>
  );
};

export default page;
