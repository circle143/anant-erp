"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface DropDownProps {
  reraNumber: string;
  id: string;
  name: string;
  panNumber?: string;
  aadharNumber?: string;
  accountNumber?: string;
}

const DropDownBroker = ({
  reraNumber,
  id,
  name,
  panNumber,
  aadharNumber,
  accountNumber,
}: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    const queryParams = new URLSearchParams({
      rera: reraNumber,
      id,
      name,
    });

    if (panNumber && aadharNumber) {
      // Broker
      queryParams.append("panNumber", panNumber);
      queryParams.append("aadharNumber", aadharNumber);
      router.push(
        `/org-admin/society/brokers/edit-broker?${queryParams.toString()}`
      );
    } else if (accountNumber) {
      // Bank
      queryParams.append("accountNumber", accountNumber);
      router.push(
        `/org-admin/society/banks/edit-bank?${queryParams.toString()}`
      );
    } else {
      console.warn("Unknown entity type for editing.");
    }
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={handleEdit}>
            Edit {accountNumber ? "Bank" : "Broker"}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropDownBroker;
