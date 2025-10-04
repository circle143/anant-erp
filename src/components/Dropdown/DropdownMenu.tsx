"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import { deleteSociety, getSocietyDownloadReport } from "@/redux/action/org-admin";
import toast from "react-hot-toast";

interface DropdownMenuProps {
    reraNumber: string;
    name: string;
    address: string;
    coverPhoto?: string; // Optional: for edit page
    fetchData: () => void;
}

const DropdownMenu = ({
    reraNumber,
    name,
    address,
    coverPhoto,
    fetchData,
}: DropdownMenuProps) => {
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

        router.push(
            `/org-admin/society/${type.toLowerCase()}?${params.toString()}`
        );
        setIsOpen(false);
    };

    const handleEdit = () => {
        const params = new URLSearchParams({
            rera: reraNumber,
            name,
            address,
        });

        if (coverPhoto) {
            params.append("image", coverPhoto);
        }

        router.push(`/org-admin/society/edit?${params.toString()}`);
        setIsOpen(false);
    };

    const handleDelete = async () => {
        const confirm = window.confirm(
            "Are you sure you want to delete this society?"
        );
        if (!confirm) return;

        try {
            const response = await deleteSociety(reraNumber);
            if (!response.error) {
                toast.success("Society deleted successfully");
                fetchData();
            } else {
                toast.error(response.message || "Failed to delete society");
            }
        } catch (err) {
            toast.error("An error occurred while deleting");
        } finally {
            setIsOpen(false);
        }
    };
    const handleDownloadReport = async () => {
        try {
            console.log('Initiating master report download for:', reraNumber);
    
            // API should return a Blob since it's a file
            const response = await getSocietyDownloadReport(reraNumber);
    
            if (!response || response.error) {
                toast.error(response?.message || "Failed to download report");
                return;
            }
    
            // Validate response is Blob
            if (!(response instanceof Blob)) {
                console.error('Invalid response type:', typeof response);
                toast.error("Invalid file response from server");
                return;
            }
    
            // Generate filename (timestamped)
            const timestamp = Math.floor(Date.now() / 1000);
            const filename = `${reraNumber}_master_report_${timestamp}.xlsx`;
    
            // Create download link
            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            // Clean up URL object
            window.URL.revokeObjectURL(url);
    
            toast.success("Master report downloaded successfully");
        } catch (error) {
            console.error('Download error:', error);
            toast.error("Failed to download report");
        }
    };
    
    
    
    

    return (
        <div className={styles.dropdownWrapper}>
            <button
                className={styles.menuButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div onClick={() => handleRedirect(reraNumber, "towers")}>
                        Towers
                    </div>
                    {/* <div onClick={() => handleRedirect(reraNumber, "flat-types")}>
            Flat Types
          </div> */}
                    <div onClick={() => handleRedirect(reraNumber, "flats")}>
                        Flats
                    </div>
                    <div onClick={() => handleRedirect(reraNumber, "charges")}>
                        Charges
                    </div>
                    <div
                        onClick={() =>
                            handleRedirect(reraNumber, "other-charges")
                        }
                    >
                        Other Charges
                    </div>
                    <div
                        onClick={() =>
                            handleRedirect(reraNumber, "payment-plans")
                        }
                    >
                        Payment Plans
                    </div>
                    <div
                        onClick={() =>
                            handleRedirect(reraNumber, "sale-report")
                        }
                    >
                        Sale Report
                    </div>
                    <div onClick={handleEdit}>Edit</div>
                    <div onClick={() => handleRedirect(reraNumber, "brokers")}>
                        Broker
                    </div>
                    <div onClick={() => handleRedirect(reraNumber, "banks")}>
                        Banks
                    </div>
                    <div onClick={handleDownloadReport}>
                        Download Reports
                    </div>
                    {/* <div onClick={handleDelete}>Delete</div> */}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
