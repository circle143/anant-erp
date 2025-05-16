"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { createPreferenceLocationCharge } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const validationSchema = Yup.object({
    summary: Yup.string().required("Summary is required"),
    type: Yup.string().oneOf(["Floor", "Facing"]).required("Type is required"),
    floor: Yup.number().when("type", {
        is: "Floor",
        then: (schema) =>
            schema
                .required("Floor is required")
                .min(0, "Floor must be at least 0"),
        otherwise: (schema) => schema.notRequired(),
    }),
    Price: Yup.number()
        .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? NaN : Number(originalValue)
        )
        .required("Price is required")
        .min(0, "Price must be at least 0"),
});

const Page = () => {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const handleSubmit = async (
        values: {
            summary: string;
            type: string;
            floor?: number;
            Price: number;
        },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!rera) {
            toast.error("RERA number missing from URL");
            return;
        }
        setLoading(true);
        try {
            const payload: any = {
                summary: values.summary,
                type: values.type,
                Price: values.Price,
            };

            if (values.type === "Floor") {
                payload.floor = values.floor;
            }

            const response = await createPreferenceLocationCharge(
                rera,
                payload
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
    const new_charge = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        {
            name: "Charges",
            href: `/org-admin/society/charges?rera=${rera}`,
        },
        { name: "New Charge" },
    ];
    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={new_charge} />
            </div>
            <div className={`container ${styles.container}`}>
                <h1>Create Preference Location Charge</h1>
                <Formik
                    initialValues={{
                        summary: "",
                        type: "",
                        floor: 0,
                        Price: 0,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form className={`form ${styles.form}`}>
                            <div className={styles.formGroup}>
                                <label htmlFor="summary">Summary</label>
                                <Field
                                    type="text"
                                    id="summary"
                                    name="summary"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="summary"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="type">Type</label>
                                <Field
                                    as="select"
                                    id="type"
                                    name="type"
                                    className={styles.form_control}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Floor">Floor</option>
                                    <option value="Facing">Facing</option>
                                </Field>
                                <ErrorMessage
                                    name="type"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            {values.type === "Floor" && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="floor">Floor</label>
                                    <Field
                                        type="number"
                                        id="floor"
                                        name="floor"
                                        className={styles.form_control}
                                        min="0"
                                    />
                                    <ErrorMessage
                                        name="floor"
                                        component="p"
                                        className="text-danger"
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="Price">Price per sqft</label>
                                <Field
                                    type="number"
                                    id="Price"
                                    name="Price"
                                    className={styles.form_control}
                                    min="1"
                                    step="0.01"
                                />
                                <ErrorMessage
                                    name="Price"
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
