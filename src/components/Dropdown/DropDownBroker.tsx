"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";

interface BrokerProps {
  reraNumber: string;
  id: string;
  name: string;
  panNumber: string;
  aadharNumber: string;
}

const DropDownBroker = ({
  reraNumber,
  id,
  name,
  panNumber,
  aadharNumber,
}: BrokerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEditBroker = () => {
    const queryParams = new URLSearchParams({
      rera: reraNumber,
      id,
      name,
      panNumber,
      aadharNumber,
    });

    router.push(
      `/org-admin/society/broker/edit-broker?${queryParams.toString()}`
    );
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div onClick={handleEditBroker}>Edit Broker</div>
        </div>
      )}
    </div>
  );
};

export default DropDownBroker;
