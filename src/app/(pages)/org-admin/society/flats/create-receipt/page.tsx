"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import CreateReceiptForm from "@/components/Receipts/CreateReceiptForm";

const Page = () => {
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera") || "";
  const saleId = searchParams.get("saleId") || "";
  const towerId = searchParams.get("towerId") || "";
  const breadcrumbs = towerId
    ? [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
        {
          name: "Flats",
          href: `/org-admin/society/towers/flats?rera=${rera}&towerId=${towerId}`,
        },
        { name: "Create Receipt" },
      ]
    : [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        {
          name: "Flats",
          href: `/org-admin/society/flats?rera=${rera}`,
        },
        { name: "Create Receipt" },
      ];

  return (
    <>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={breadcrumbs} />
      </div>
      <div className={`container ${styles.container}`}>
        <h1>Create Sale Receipt</h1>
        <CreateReceiptForm rera={rera} saleId={saleId} />
      </div>
    </>
  );
};

export default Page;
