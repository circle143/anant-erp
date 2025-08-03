"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateOtherChargeDetails } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const validationSchema = Yup.object({
    summary: Yup.string().required("Summary is required").min(3),
    recurring: Yup.boolean(),
    optional: Yup.boolean(),
    fixed: Yup.boolean(),
    disabled: Yup.boolean(),
    advanceMonths: Yup.number().when("recurring", {
        is: true,
        then: (schema) =>
            schema
                .required("Advance months required for recurring charges")
                .min(1, "Minimum 1 month"),
        otherwise: (schema) => schema.notRequired().default(0),
    }),
});

const EditCharges = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = searchParams.get("id") ?? "";
    const rera = searchParams.get("rera") ?? "";
    const summary = searchParams.get("summary") ?? "";

    const disable = searchParams.get("disable") === "true";
    const fixed = searchParams.get("fixed") === "true";
    const recurring = searchParams.get("recurring") === "true";
    const optional = searchParams.get("optional") === "true";
    const advanceMonths = Number(searchParams.get("advanceMonths") ?? "0");

    const initialValues = {
        summary,
        recurring,
        optional,
        fixed,
        advanceMonths,
        disabled: disable,
    };

    const handleSubmit = async (
        values: typeof initialValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            if (!id || !rera) {
                toast.error("Missing RERA or Charge ID");
                return;
            }

            const response = await updateOtherChargeDetails(
                rera,
                id,
                values.summary,
                values.recurring,
                values.optional,
                values.advanceMonths,
                values.disabled,
                values.fixed
            );

            if (response?.error === false) {
                toast.success("Details updated successfully!");
                setTimeout(() => {
                    router.push(
                        `/org-admin/society/other-charges/?rera=${rera}`
                    );
                }, 1000);
            } else {
                toast.error(response?.message || "Update failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error("Update Error:", error);
        } finally {
            setSubmitting(false);
        }
    };
    const Edit_Other_Charge_Details = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        {
            name: "Other Charges",
            href: `/org-admin/society/other-charges?rera=${rera}`,
        },
        { name: "Edit Other Charge Details" },
    ];
    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={Edit_Other_Charge_Details} />
            </div>
            <div className={`container ${styles.container}`}>
                <h1>Edit Charge Details</h1>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="summary">Summary</label>
                                <Field
                                    as="textarea"
                                    name="summary"
                                    className={styles.form_control}
                                    rows={4}
                                />
                                <ErrorMessage
                                    name="summary"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    <Field type="checkbox" name="recurring" />
                                    &nbsp;Recurring
                                </label>
                            </div>

                            {values.recurring && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="advanceMonths">
                                        Advance Months
                                    </label>
                                    <Field
                                        type="number"
                                        name="advanceMonths"
                                        className={styles.form_control}
                                        min="1"
                                    />
                                    <ErrorMessage
                                        name="advanceMonths"
                                        component="p"
                                        className="text-danger"
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label>
                                    <Field type="checkbox" name="optional" />
                                    &nbsp;Optional
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    <Field type="checkbox" name="fixed" />
                                    &nbsp;Fixed
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    <Field
                                        type="checkbox"
                                        name="disabled"
                                        checked={values.disabled}
                                        onChange={() =>
                                            setFieldValue(
                                                "disabled",
                                                !values.disabled
                                            )
                                        }
                                    />
                                    &nbsp;Disable
                                </label>
                            </div>

                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default EditCharges;
