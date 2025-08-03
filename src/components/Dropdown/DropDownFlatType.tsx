import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import styles from "./page.module.scss";
// import { deleteFlatType } from "@/redux/action/org-admin";

interface FlatTypeProps {
    reraNumber: string;
    id: string;
    name: string;
    area: number;
    price: number;
    type: string;
}

const DropDownFlatType = ({
    reraNumber,
    id,
    name,
    area,
    price,
    type,
}: FlatTypeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const router = useRouter();

    const handleEdit = () => {
        router.push(
            `/org-admin/society/flat-type/edit-flat-type?rera=${reraNumber}&id=${id}&name=${name}&area=${area}&price=${price}&type=${type}`
        );
    };

    const handleDeleteClick = () => {
        setShowDeletePopup(true);
        setIsOpen(false);
    };

    const confirmDelete = async () => {
        try {
            // const response = await deleteFlatType(id, reraNumber);
            // if (!response.error) {
            //   // Optionally show success toast here
            //   window.location.reload(); // or use a prop callback to refresh data
            // }
        } catch (err) {
            console.error("Error deleting flat type:", err);
        } finally {
            setShowDeletePopup(false);
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
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
                    {/* <div onClick={handleEdit}>Edit</div> */}
                    <div onClick={handleDeleteClick}>Delete</div>
                </div>
            )}

            {showDeletePopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h4>Confirm Delete</h4>
                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{name}</strong>?
                        </p>
                        <div className={styles.popupButtons}>
                            <button
                                className={styles.confirmButton}
                                onClick={confirmDelete}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropDownFlatType;
