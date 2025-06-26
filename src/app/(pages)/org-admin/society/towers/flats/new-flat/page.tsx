"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createFlat } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Name is required"),
    floorNumber: Yup.number()
        .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? NaN : Number(originalValue)
        )
        .required("Floor Number is required")
        .min(0, "Floor number must be at least 0"),
    facing: Yup.string().required("Facing is required"),
    saleableArea: Yup.number()
        .typeError("Saleable area must be a number")
        .required("Saleable Area is required")
        .positive("Saleable area must be positive"),
    unitType: Yup.string().required("Unit Type is required"),
});

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const towerId = searchParams.get("towerId");

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(false); // No data loading here now
        };
        loadData();
    }, [rera]);

    const handleSubmit = async (
        values: {
            name: string;
            floorNumber: string;
            facing: string;
            saleableArea: string;
            unitType: string;
        },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!rera || !towerId) {
            toast.error("Missing RERA or Tower ID in URL");
            return;
        }

        setSubmitting(true);
        const response = await createFlat(
            rera,
            towerId,
            Number(values.saleableArea),
            values.unitType,
            values.name,
            Number(values.floorNumber),
            values.facing
        );
        setSubmitting(false);

        if (response?.error === false) {
            toast.success("Flat created successfully!");
            resetForm();
        } else {
            const errorMessage =
                response?.response?.data?.message ||
                response?.message ||
                "Something went wrong";
            toast.error(errorMessage);
        }
    };

    const new_flat = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
        {
            name: "Flats",
            href: `/org-admin/society/towers/flats?rera=${rera}&towerId=${towerId}`,
        },
        { name: "New Flat" },
    ];

    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={new_flat} />
            </div>

            <div className={`container ${styles.container}`}>
                <h1>Create Flat</h1>

                <Formik
                    initialValues={{
                        name: "",
                        floorNumber: "",
                        facing: "Default",
                        saleableArea: "",
                        unitType: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {() => (
                        <Form className={`form ${styles.form}`}>
                            {/* Flat Name */}
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Flat Name</label>
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

                            {/* Floor Number */}
                            <div className={styles.formGroup}>
                                <label htmlFor="floorNumber">
                                    Floor Number
                                </label>
                                <Field
                                    type="number"
                                    id="floorNumber"
                                    name="floorNumber"
                                    min="0"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="floorNumber"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            {/* Saleable Area */}
                            <div className={styles.formGroup}>
                                <label htmlFor="saleableArea">
                                    Saleable Area (sq ft)
                                </label>
                                <Field
                                    type="number"
                                    id="saleableArea"
                                    name="saleableArea"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="saleableArea"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            {/* Unit Type */}
                            <div className={styles.formGroup}>
                                <label htmlFor="unitType">Unit Type</label>
                                <Field
                                    as="select"
                                    id="unitType"
                                    name="unitType"
                                    className={styles.form_control}
                                >
                                    <option value="">Select Unit Type</option>
                                    <option value="1BHK">1BHK</option>
                                    <option value="2BHK">2BHK</option>
                                    <option value="3BHK">3BHK</option>
                                    <option value="4BHK">4BHK</option>
                                    <option value="Studio">Studio</option>
                                </Field>
                                <ErrorMessage
                                    name="unitType"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            {/* Facing */}
                            <div className={styles.formGroup}>
                                <label htmlFor="facing">Facing</label>
                                <Field
                                    as="select"
                                    id="facing"
                                    name="facing"
                                    className={styles.form_control}
                                >
                                    <option value="Default">Default</option>
                                    <option value="Park/Road">Park/Road</option>
                                </Field>
                                <ErrorMessage
                                    name="facing"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting || loading}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : loading
                                    ? "Loading..."
                                    : "Submit"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Page;
