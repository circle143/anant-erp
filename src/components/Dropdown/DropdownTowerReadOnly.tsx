import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface DropdownTowerReadOnlyProps {
  reraNumber: string;
  towerId: string;
}

const DropdownTowerReadOnly = ({
  reraNumber,
  towerId,
}: DropdownTowerReadOnlyProps) => {
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
      `/user/societies/towers/${type.toLowerCase()}?${params.toString()}`
    );
    setIsOpen(false);
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
              handleRedirect(reraNumber, "flats", {
                towerId,
              })
            }
          >
            Flats
          </div>
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
      )}
    </div>
  );
};

export default DropdownTowerReadOnly;
