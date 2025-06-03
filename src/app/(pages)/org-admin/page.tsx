"use client";
import { decodeAccessToken } from "@/utils/get_user_tokens";
import React, { useEffect, useState } from "react";
import {
    getSelf,
    updateOrganizationDetails,
} from "../../../redux/action/org-admin";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { getUrl, uploadData } from "aws-amplify/storage";
import imageCompression from "browser-image-compression";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { home } from "@/utils/breadcrumbs";
const Page = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        gst: "",
        logo: "",
        file: null as File | null,
    });

    useEffect(() => {
        const fetchSelf = async () => {
            const res = await getSelf();
            if (!res?.error && res?.data) {
                const item = res.data;
                if (item.logo) {
                    try {
                        const getUrlResult = await getUrl({
                            path: item.logo,
                            options: {
                                validateObjectExistence: true,
                                expiresIn: 3600,
                            },
                        });
                        item.logo = getUrlResult.url.toString();
                    } catch (error) {
                        console.error("Error fetching logo URL", error);
                    }
                }
                setData(item);
                setFormData({
                    name: item.name || "",
                    gst: item.gst || "",
                    logo: item.logo || "",
                    file: null,
                });
            }
            setLoading(false);
        };
        fetchSelf();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const userData = await decodeAccessToken();
            let coverPhoto = "";

            const options = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            if (formData.file) {
                const compressedFile = await imageCompression(
                    formData.file,
                    options
                );
                const fileExt = formData.file.name.split(".").pop();
                const s3Key = `${userData?.["custom:org_id"]}/org/profile.${fileExt}`;
                const result = await uploadData({
                    path: s3Key,
                    data: compressedFile,
                    options: {
                        contentType: compressedFile.type,
                    },
                }).result;
                coverPhoto = result.path;
            }

            const response = await updateOrganizationDetails({
                name: formData.name,
                gst: formData.gst,
                logo: coverPhoto || data.logo,
            });

            if (response.error) {
                console.log("Update failed", response.message);
                toast.error(response.message.message || "Update failed");
                return;
            }

            toast.success("Updated successfully!");
            setData({
                ...data,
                name: formData.name,
                gst: formData.gst,
                logo: coverPhoto || data.logo,
            });
            setEditMode(false);
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: data.name || "",
            gst: data.gst || "",
            logo: data.logo || "",
            file: null,
        });
        setEditMode(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const preview = URL.createObjectURL(file);
                setFormData({
                    ...formData,
                    file,
                    logo: preview,
                });
            } finally {
                setUploading(false);
            }
        }
    };

    if (loading) return <Loader />;
    if (data?.error) return <div>Error: {data.message}</div>;

    const org = data || {};

    return (
        <div className={styles.container}>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={home} />
            </div>
            <div className={styles.organizationProfile}>
                <div className={styles.card}>
                    {formData.logo ? (
                        <img
                            loading="lazy"
                            src={formData.logo}
                            alt="Organization Logo"
                            className={styles.logo}
                        />
                    ) : (
                        <div className={styles.placeholderLogo}>No Logo</div>
                    )}

                    {uploading && (
                        <p className={styles.uploadingText}>
                            Uploading preview...
                        </p>
                    )}
                    {editMode ? (
                        <>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Organization Name"
                                disabled={saving}
                            />
                            <input
                                type="text"
                                name="gst"
                                value={formData.gst}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="GST Number"
                                disabled={saving}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.inputFile}
                                disabled={uploading || saving}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className={styles.name}>{org.name}</h2>
                            <p className={styles.gst}>
                                <strong>GST:</strong>{" "}
                                {org.gst || "Not Provided"}
                            </p>
                        </>
                    )}

                    <div className={styles.buttonGroup}>
                        {editMode ? (
                            <>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                    disabled={saving || uploading}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles.editButton}
                                onClick={() => setEditMode(true)}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
