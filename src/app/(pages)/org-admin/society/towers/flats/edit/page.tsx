"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { updateFlatDetails } from "@/redux/action/org-admin";

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

const EditFlatPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rera = searchParams.get("rera");
    const towerId = searchParams.get("towerId");
    const flatId = searchParams.get("flatId");

    const [initialValues, setInitialValues] = useState({
        name: "",
        floorNumber: "",
        facing: "Default",
        saleableArea: "",
        unitType: "",
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const storedData = sessionStorage.getItem("editFlatData");
        if (storedData) {
            setInitialValues(JSON.parse(storedData));
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (
        values: typeof initialValues,
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!rera || !towerId || !flatId) {
            toast.error("Missing required identifiers in URL");
            return;
        }

        setSubmitting(true);
        const response = await updateFlatDetails(
            rera,
            flatId,
            towerId,
            Number(values.saleableArea),
            values.unitType,
            values.name,
            Number(values.floorNumber),
            values.facing
        );
        setSubmitting(false);

        if (response?.error === false) {
            toast.success("Flat updated successfully!");
            router.push(
                `/org-admin/society/towers/flats?rera=${rera}&towerId=${towerId}`
            );
        } else {
            const errorMessage =
                response?.message || "Something went wrong during update";
            toast.error(errorMessage);
        }
    };

    const breadcrumbs = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
        {
            name: "Flats",
            href: `/org-admin/society/towers/flats?rera=${rera}&towerId=${towerId}`,
        },
        { name: "Edit Flat" },
    ];

    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={breadcrumbs} />
            </div>

            <div className={`container ${styles.container}`}>
                <h1>Edit Flat</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={initialValues}
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
                                        ? "Updating..."
                                        : loading
                                        ? "Loading..."
                                        : "Update Flat"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};

export default EditFlatPage;
