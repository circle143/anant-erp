import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react"; // optional icon lib like lucide or FontAwesome
import styles from "./page.module.scss";

const DropdownMenu = ({ reraNumber }: { reraNumber: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleRedirect = (reraNumber: string, type: string) => {
        router.push(
            `/org-admin/society/${type.toLowerCase()}?rera=${reraNumber}`
        );
        setIsOpen(false); // close menu after click
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
                    <div onClick={() => handleRedirect(reraNumber, "tower")}>
                        Tower
                    </div>
                    <div
                        onClick={() => handleRedirect(reraNumber, "flat-type")}
                    >
                        Flat Type
                    </div>
                    <div onClick={() => handleRedirect(reraNumber, "flat")}>
                        Flat
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
