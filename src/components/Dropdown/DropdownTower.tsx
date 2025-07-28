import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { deleteTower } from "@/redux/action/org-admin";
interface DropdownTowerProps {
  reraNumber: string;
  towerId: string;
  fetchData: () => void;
}

const DropdownTower = ({
  reraNumber,
  towerId,
  fetchData,
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
  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this Tower?"
    );
    if (!confirm) return;

    try {
      const response = await deleteTower(towerId, reraNumber);
      if (!response.error) {
        toast.success("Tower deleted successfully");
        fetchData();
      } else {
        toast.error(response.message || "Failed to delete Tower");
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
          <div
            onClick={() =>
              handleRedirect(reraNumber, "flats", {
                towerId,
              })
            }
          >
            Flats
          </div>
          {/* <div
            onClick={() =>
              handleRedirect(reraNumber, "payment-plans", {
                towerId,
              })
            }
          >
            Payment Plans
          </div> */}
          <div onClick={handleDelete}>Delete</div>
        </div>
      )}
    </div>
  );
};

export default DropdownTower;
