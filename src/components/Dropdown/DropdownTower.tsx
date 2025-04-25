import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface DropdownTowerProps {
  reraNumber: string;
  towerId: string;
}

const DropdownTower = ({ reraNumber, towerId }: DropdownTowerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRedirect = (type: string) => {
    router.push(
      `/org-admin/society/tower/${type.toLowerCase()}?rera=${reraNumber}&towerId=${towerId}`
    );
    setIsOpen(false); // close menu after click
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={() => handleRedirect("flat")}>Flats</div>
        </div>
      )}
    </div>
  );
};

export default DropdownTower;
