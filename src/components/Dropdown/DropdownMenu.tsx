"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import { deleteSociety } from "@/redux/action/org-admin";
import toast from "react-hot-toast";

interface DropdownMenuProps {
    reraNumber: string;
    fetchData: () => void;
    soldFlats: number;
    totalFlats: number;
    unsoldFlats: number;
}

const DropdownMenu = ({
    reraNumber,
    fetchData,
    soldFlats,
    totalFlats,
    unsoldFlats,
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
                    <div
                        onClick={() => handleRedirect(reraNumber, "flat-types")}
                    >
                        Flat Types
                    </div>
                    <div
                        onClick={() =>
                            handleRedirect(reraNumber, "flats", {
                                soldFlats,
                                totalFlats,
                                unsoldFlats,
                            })
                        }
                    >
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
                    <div onClick={handleDelete}>Delete</div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
