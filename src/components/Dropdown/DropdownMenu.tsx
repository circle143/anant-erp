// DropdownMenu.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import { deleteSociety } from "@/redux/action/org-admin";
import toast from "react-hot-toast";

const DropdownMenu = ({
  reraNumber,
  fetchData,
}: {
  reraNumber: string;
  fetchData: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRedirect = (reraNumber: string, type: string) => {
    router.push(`/org-admin/society/${type.toLowerCase()}?rera=${reraNumber}`);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteSociety(reraNumber);
      if (!response.error) {
        toast.success("Society deleted successfully");
        await fetchData(); // re-fetch the data
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
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={() => handleRedirect(reraNumber, "tower")}>Tower</div>
          <div onClick={() => handleRedirect(reraNumber, "flat-type")}>
            Flat Type
          </div>
          <div onClick={() => handleRedirect(reraNumber, "flat")}>Flat</div>
          <div onClick={() => handleRedirect(reraNumber, "charges")}>
            Charges
          </div>
          <div onClick={() => handleRedirect(reraNumber, "other-charges")}>
            Other Charges
          </div>
          <div onClick={() => handleRedirect(reraNumber, "payment-plans")}>
            Payment Plans
          </div>
          <div onClick={handleDelete}>Delete</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
