"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createFlatType } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Name is required"),
    accommodation: Yup.string().required("BHK type is required"),
    reraCarpetArea: Yup.number()
        .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? NaN : Number(originalValue)
        )
        .required("Carpet area is required")
        .min(0, "Carpet area must be at least 0"),
    balconyArea: Yup.number()
        .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? NaN : Number(originalValue)
        )
        .required("Balcony area is required")
        .min(0, "Balcony area must be at least 0"),
    superArea: Yup.number()
        .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? NaN : Number(originalValue)
        )
        .required("Super area is required")
        .min(0, "Super area must be at least 0"),
});

const Page = () => {
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        values: {
            name: string;
            accommodation: string;
            reraCarpetArea: string;
            balconyArea: string;
            superArea: string;
        },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!rera) {
            toast.error("RERA number missing from URL");
            return;
        }

        setLoading(true);
        try {
            const response = await createFlatType(
                rera,
                values.name,
                values.accommodation,
                parseFloat(values.reraCarpetArea),
                parseFloat(values.balconyArea),
                parseFloat(values.superArea)
            );

            if (response?.error === false) {
                toast.success("Flat type created successfully!");
                resetForm();
            } else {
                const errorMessage =
                    response?.response?.data?.message ||
                    response?.message ||
                    "Something went wrong";
                toast.error(errorMessage);
                console.error("API Error:", errorMessage);
            }
        } catch (error) {
            toast.error("Unexpected error occurred");
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };
    const new_flat_type = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        {
            name: "Flat Types",
            href: `/org-admin/society/flat-types?rera=${rera}`,
        },
        {
            name: "New Flat Type",
        },
    ];

    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={new_flat_type} />
            </div>
            <div className={`container ${styles.container}`}>
                <h1>Create Flat Type</h1>
                <Formik
                    initialValues={{
                        name: "",
                        accommodation: "",
                        reraCarpetArea: "",
                        balconyArea: "",
                        superArea: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form className={`form ${styles.form}`}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Name</label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="name"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="accommodation">BHK Type</label>
                                <Field
                                    type="text"
                                    id="accommodation"
                                    name="accommodation"
                                    className={styles.form_control}
                                    placeholder="e.g. 2 BHK"
                                />
                                <ErrorMessage
                                    name="accommodation"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="reraCarpetArea">
                                    Carpet Area (sqft)
                                </label>
                                <Field
                                    type="number"
                                    id="reraCarpetArea"
                                    name="reraCarpetArea"
                                    min="0"
                                    step="0.01"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="reraCarpetArea"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="balconyArea">
                                    Balcony Area (sqft)
                                </label>
                                <Field
                                    type="number"
                                    id="balconyArea"
                                    name="balconyArea"
                                    min="0"
                                    step="0.01"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="balconyArea"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="superArea">
                                    Super Area (sqft)
                                </label>
                                <Field
                                    type="number"
                                    id="superArea"
                                    name="superArea"
                                    step="0.01"
                                    min="0"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="superArea"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Page;
