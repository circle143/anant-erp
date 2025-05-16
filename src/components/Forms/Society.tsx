"use client";

import React, { useState } from "react";
import { decodeAccessToken } from "@/utils/get_user_tokens";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import styles from "./society.module.scss";
import toast from "react-hot-toast";
import { createSociety } from "../../redux/action/org-admin";
import { getUrl, uploadData } from "aws-amplify/storage";
import imageCompression from "browser-image-compression";
const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
];

// Formik form values type
interface SocietyFormValues {
    name: string;
    Rera: string;
    address: string;
    image: File | null;
}

// Validation schema
const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "Society name must be at least 3 characters")
        .required("Society name is required"),
    Rera: Yup.string()
        .min(5, "RERA must be at least 5 characters")
        .required("RERA number is required"),
    address: Yup.string()
        .min(10, "Address must be at least 10 characters")
        .required("Address is required"),
    image: Yup.mixed()
        .nullable()
        .test(
            "fileType",
            "Only JPG, JPEG, PNG, and WEBP files are allowed",
            (value) => {
                if (!value) return true;
                return (
                    value instanceof File &&
                    SUPPORTED_FORMATS.includes(value.type)
                );
            }
        ),
});

// Image upload field component
const ImageUploadField: React.FC<{
    preview: string | null;
    setPreview: (url: string) => void;
}> = ({ preview, setPreview }) => {
    const { setFieldValue, setFieldTouched } =
        useFormikContext<SocietyFormValues>();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFieldTouched("image", true);

        if (!file) return;

        if (!SUPPORTED_FORMATS.includes(file.type)) {
            toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
            return;
        }

        setFieldValue("image", file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.image_upload}>
            
            <label htmlFor="imageUpload" className={styles.image_label}>
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className={styles.preview_img}
                    />
                ) : (
                    <span>+</span>
                )}
                <input
                    type="file"
                    id="imageUpload"
                    // accept="image/*"
                    onChange={handleImageChange}
                    className={styles.file_input}
                />
            </label>
            <ErrorMessage
                name="image"
                component="p"
                className={styles["text-danger"]}
            />
            <h3>Society Logo</h3>
        </div>
    );
};

// Main Society component
const Society: React.FC = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // NEW

    const handleSubmit = async (
        values: SocietyFormValues,
        { resetForm }: { resetForm: () => void }
    ) => {
        setLoading(true); // Start loading
        try {
            const data = await decodeAccessToken();
            let coverPhoto = "";
            const options = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            if (values.image) {
                const compressedFile = await imageCompression(
                    values.image,
                    options
                );
                const fileExt = values.image.name.split(".").pop();
                const s3Key = `${data?.["custom:org_id"]}/${values.Rera}/society/profile.${fileExt}`;
                const result = await uploadData({
                    path: s3Key,
                    data: compressedFile,
                    options: {
                        contentType: compressedFile.type,
                    },
                }).result;

                coverPhoto = result.path;
            }

            const response = await createSociety(
                values.Rera,
                values.name,
                values.address,
                coverPhoto
            );

            if (response.error) {
                toast.error(response.message || "Society creation failed");
                return;
            }

            toast.success("Society created successfully!");
            resetForm();
            setPreview(null);
        } catch (err: any) {
            console.error(err);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false); // End loading
        }
    };

    const initialValues: SocietyFormValues = {
        name: "",
        Rera: "",
        address: "",
        image: null,
    };

    return (
        <div className={`container ${styles.container}`}>
            <h1>Society</h1>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className={styles.formsection}>
                        <ImageUploadField
                            preview={preview}
                            setPreview={setPreview}
                        />

                        <div className={styles.form_group}>
                            <label htmlFor="name">Society Name</label>
                            <Field
                                type="text"
                                id="name"
                                name="name"
                                className={styles.form_control}
                            />
                            <ErrorMessage
                                name="name"
                                component="p"
                                className={styles["text-danger"]}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="Rera">RERA Number</label>
                            <Field
                                type="text"
                                id="Rera"
                                name="Rera"
                                className={styles.form_control}
                            />
                            <ErrorMessage
                                name="Rera"
                                component="p"
                                className={styles["text-danger"]}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="address">Address</label>
                            <Field
                                as="textarea"
                                id="address"
                                name="address"
                                className={styles.form_control}
                            />
                            <ErrorMessage
                                name="address"
                                component="p"
                                className={styles["text-danger"]}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.button}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Society;
