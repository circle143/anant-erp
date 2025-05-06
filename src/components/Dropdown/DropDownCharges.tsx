import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface FlatTypeProps {
  reraNumber: string;
  id: string;
  price: number;
  summary: string;
  route: string;
}

const DropDownFlatType = ({
  reraNumber,
  id,
  price,
  summary,
  route,
}: FlatTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleUpdatePrice = () => {
    router.push(
      `/org-admin/society/${route}/edit-chargesPrice?rera=${reraNumber}&id=${id}&type=price&price=${price}`
    );
  };

  const handleUpdateDetails = () => {
    router.push(
      `/org-admin/society/${route}/edit-chargesDetails?rera=${reraNumber}&id=${id}&type=details&summary=${encodeURIComponent(
        summary
      )}`
    );
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={handleUpdatePrice}>Update Price</div>
          <div onClick={handleUpdateDetails}>Update Details</div>
        </div>
      )}
    </div>
  );
};

export default DropDownFlatType;
