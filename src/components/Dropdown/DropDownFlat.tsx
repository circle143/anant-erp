// components/DropdownFlat/DropdownFlat.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { deleteFlat as apiDeleteFlat } from "@/redux/action/org-admin";

type FlatMinimal = {
  id: string;
  name?: string;
  floorNumber?: string | number;
  facing?: string;
  salableArea?: string | number;
  saleableArea?: string | number;
  unitType?: string;
};

interface DropdownFlatProps {
  reraNumber: string;
  towerId: string;
  flat: FlatMinimal;
  fetchData: () => void | Promise<void>;
  onDeleteClick?: () => void; // WHY: let parent own confirm/modal
}

export default function DropdownFlat({
  reraNumber,
  towerId,
  flat,
  fetchData,
  onDeleteClick,
}: DropdownFlatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRedirect = (
    rera: string,
    type: string,
    extras?: Record<string, string | number>
  ) => {
    const params = new URLSearchParams({ rera });
    if (extras) {
      Object.entries(extras).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }
    router.push(
      `/org-admin/society/towers/flats/${type.toLowerCase()}?${params.toString()}`
    );
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (onDeleteClick) {
      onDeleteClick(); // WHY: parent handles confirmation and deletion
      setIsOpen(false);
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Flat?"
    );
    if (!confirmDelete) return;

    try {
      const response = await apiDeleteFlat(flat.id, reraNumber);
      if (!response?.error) {
        toast.success("Flat deleted successfully");
        await fetchData();
      } else {
        toast.error(response?.message || "Failed to delete Flat");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div
            onClick={() =>
              handleRedirect(reraNumber, "edit", {
                towerId,
                flatId: flat.id,
              })
            }
          >
            Edit
          </div>
          <div
            onClick={() =>
              handleRedirect(reraNumber, "payment-plans", {
                FlatId: flat.id, // WHY: backend expects capitalized key
                towerId:towerId
              })
            }
          >
            Payment Plans
          </div>
          <div onClick={handleDelete}>Delete</div>
        </div>
      )}
    </div>
  );
}
