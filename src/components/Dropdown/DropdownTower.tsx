import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface DropdownTowerProps {
    reraNumber: string;
    towerId: string;
    soldFlats: number;
    totalFlats: number;
    unsoldFlats: number;
}

const DropdownTower = ({
    reraNumber,
    towerId,
    soldFlats,
    totalFlats,
    unsoldFlats,
}: DropdownTowerProps) => {
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
            `/org-admin/society/towers/${type.toLowerCase()}?${params.toString()}`
        );
        setIsOpen(false);
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
                    <div>
                        <div
                            onClick={() =>
                                handleRedirect(reraNumber, "flats", {
                                    soldFlats,
                                    totalFlats,
                                    unsoldFlats,
                                    towerId,
                                })
                            }
                        >
                            Flats
                        </div>
                    </div>
                    <div>
                        <div
                            onClick={() =>
                                handleRedirect(reraNumber, "payment-plans", {
                                    towerId,
                                })
                            }
                        >
                            Payment Plans
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownTower;
