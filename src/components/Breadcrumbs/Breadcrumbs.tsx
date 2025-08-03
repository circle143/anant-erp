"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs, Chip } from "@mui/material";
import { styled, emphasize } from "@mui/material/styles";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface CustomBreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Custom styled Chip
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: emphasize(theme.palette.grey[100], 0.06),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.grey[100], 0.12),
  },
}));

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ items }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (item.href && !isLast) {
          return (
            <Link href={item.href} key={item.name} legacyBehavior>
              <a style={{ textDecoration: "none" }}>
                <StyledBreadcrumb label={item.name} clickable />
              </a>
            </Link>
          );
        }

        return (
          <StyledBreadcrumb
            key={item.name}
            label={item.name}
            variant="outlined"
          />
        );
      })}
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;
