"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import { getSocietyDownloadReport } from "@/redux/action/org-admin";
import toast from "react-hot-toast";

interface DropdownMenuReadOnlyProps {
  reraNumber: string;
  name: string;
  address: string;
  coverPhoto?: string;
}

const DropdownMenuReadOnly = ({
  reraNumber,
  name,
  address,
  coverPhoto,
}: DropdownMenuReadOnlyProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRedirect = (
    reraNumber: string,
    type: string,
    extras?: Record<string, string | number>
  ) => {
    const params = new URLSearchParams({ rera: reraNumber });

    if (extras) {
      Object.entries(extras).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }

    router.push(`/user/societies/${type.toLowerCase()}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await getSocietyDownloadReport(reraNumber);

      if (!response || response.error) {
        toast.error(response?.message || "Failed to download report");
        return;
      }

      if (!(response instanceof Blob)) {
        console.error("Invalid response type:", typeof response);
        toast.error("Invalid file response from server");
        return;
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const filename = `${reraNumber}_master_report_${timestamp}.xlsx`;

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Master report downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={() => handleRedirect(reraNumber, "towers")}>Towers</div>
          <div onClick={() => handleRedirect(reraNumber, "flats")}>Flats</div>
          <div onClick={() => handleRedirect(reraNumber, "charges")}>
            Charges
          </div>
          <div onClick={() => handleRedirect(reraNumber, "other-charges")}>
            Other Charges
          </div>
          <div onClick={() => handleRedirect(reraNumber, "payment-plans")}>
            Payment Plans
          </div>
          <div onClick={() => handleRedirect(reraNumber, "sale-report")}>
            Sale Report
          </div>
          <div onClick={handleDownloadReport}>Download Reports</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenuReadOnly;
