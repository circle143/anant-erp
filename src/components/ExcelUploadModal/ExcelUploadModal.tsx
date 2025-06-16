"use client";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import styles from "./ExcelUploadModal.module.scss";

interface ExcelUploadModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    onUpload: (file: File) => Promise<void>;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
    open,
    onClose,
    title,
    onUpload,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            await onUpload(file);
            setFile(null);
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box className={styles.modalBox}>
                <Typography variant="h6" mb={2}>
                    {title}
                </Typography>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                />
                <div className={styles.actions}>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!file || loading}
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </Button>
                    <Button onClick={onClose} variant="outlined" sx={{ ml: 2 }}>
                        Cancel
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default ExcelUploadModal;
