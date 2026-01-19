import { useState } from "react";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface DropdownChargesReadOnlyProps {
  reraNumber: string;
  id: string;
  price: number;
  summary: string;
}

const DropdownChargesReadOnly = ({
  reraNumber,
  id,
  price,
  summary,
}: DropdownChargesReadOnlyProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.disabledItem}>View Details</div>
        </div>
      )}
    </div>
  );
};

export default DropdownChargesReadOnly;
