"use client";
import React from "react";
import Sale from "@/components/Sale/Sale";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { sale } from "@/utils/breadcrumbs";
const page = () => {
    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={sale} />
            </div>
            <Sale />
        </div>
    );
};

export default page;
