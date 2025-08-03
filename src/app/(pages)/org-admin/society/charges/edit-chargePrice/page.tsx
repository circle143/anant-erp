"use client"
import React from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updatePreferenceLocationChargePrice } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const validationSchema = Yup.object({
    price: Yup.number().required("Price is required").min(0),
});

const EditCharges = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const rera = searchParams.get("rera");
    const price = searchParams.get("price");

    const router = useRouter();

    const initialValues = {
        price: price || "",
    };

    const handleSubmit = async (
        values: typeof initialValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            if (!id || !rera) {
                toast.error("Missing RERA or FlatType ID");
                return;
            }

            const response = await updatePreferenceLocationChargePrice(
                rera,
                id,
                Number(values.price)
            );

            if (response?.error === false) {
                toast.success("Price updated successfully!");
                setTimeout(() => {
                    router.push(`/org-admin/society/charges/?rera=${rera}`);
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
    const edit_price = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        {
            name: "Charges",
            href: `/org-admin/society/charges?rera=${rera}`,
        },
        { name: "Edit Price" },
    ];
    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={edit_price} />
            </div>
            <div className={`container ${styles.container}`}>
                <h1>Edit Price</h1>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="price">Price per sqft</label>
                                <Field
                                    type="number"
                                    name="price"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="price"
                                    component="p"
                                    className="text-danger"
                                />
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
