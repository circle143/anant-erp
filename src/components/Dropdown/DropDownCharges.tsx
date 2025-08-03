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
  disable: boolean;
  fixed?: boolean;
  recurring?: boolean;
  advanceMonths?: number;
  optional?: boolean;
}

const DropDownFlatType = ({
  reraNumber,
  id,
  price,
  summary,
  route,
  disable,
  fixed,
  recurring,
  advanceMonths,
  optional,
}: FlatTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleUpdatePrice = () => {
    router.push(
      `/org-admin/society/${route}/edit-chargePrice?rera=${reraNumber}&id=${id}&type=price&price=${price}`
    );
  };

  const handleUpdateDetails = () => {
    const queryParams = new URLSearchParams({
      rera: reraNumber,
      id,
      type: "details",
      summary,
      disable: String(disable),
    });

    if (fixed !== undefined) queryParams.set("fixed", String(fixed));
    if (recurring !== undefined)
      queryParams.set("recurring", String(recurring));
    if (advanceMonths !== undefined)
      queryParams.set("advanceMonths", String(advanceMonths));
    if (optional !== undefined) queryParams.set("optional", String(optional));

    router.push(
      `/org-admin/society/${route}/edit-chargeDetails?${queryParams.toString()}`
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
