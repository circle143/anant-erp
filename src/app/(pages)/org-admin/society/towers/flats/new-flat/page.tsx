"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createFlat } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { useRouter } from "next/navigation";
const validationSchema = Yup.object({
    flatType: Yup.string().required("Flat Type is required"),
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
});

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const towerId = searchParams.get("towerId");

    const [flatTypes, setFlatTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // const fetchAllFlatTypes = async (
    //     cursor: string | null = null,
    //     accumulated: any[] = []
    // ): Promise<any[]> => {
    //     if (!rera) return [];

    //     const response = await getFlatTypes(cursor, rera);
    //     if (response?.error) return accumulated;

    //     const items = response?.data?.items || [];
    //     const newData = [...accumulated, ...items];
    //     const hasNext = response?.data?.pageInfo?.nextPage;
    //     const nextCursor = response?.data?.pageInfo?.cursor;

    //     if (hasNext && nextCursor) {
    //         return await fetchAllFlatTypes(nextCursor, newData);
    //     }

    //     return newData;
    // };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // const allFlatTypes = await fetchAllFlatTypes();
            // setFlatTypes(allFlatTypes);
            setLoading(false);
        };
        loadData();
    }, [rera]);

    const handleSubmit = async (
        values: {
            flatType: string;
            name: string;
            floorNumber: string;
            facing: string;
        },
        { resetForm }: { resetForm: () => void }
    ) => {
        if (!rera || !towerId) {
            toast.error("Missing RERA or Tower ID in URL");
            return;
        }

        setSubmitting(true); // Start form loading
        const response = await createFlat(
            rera,
            towerId,
            // values.flatType,
            values.name,
            Number(values.floorNumber),
            values.facing
        );
        setSubmitting(false); // Stop form loading

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
                {" "}
                <CustomBreadcrumbs items={new_flat} />
            </div>

            <div className={`container ${styles.container}`}>
                <h1>Create Flat</h1>

                <Formik
                    initialValues={{
                        flatType: "",
                        name: "",
                        floorNumber: "",
                        facing: "Default",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {() => (
                        <Form className={`form ${styles.form}`}>
                            {/* Flat Type Select */}
                            <div className={styles.formGroup}>
                                <label htmlFor="flatType">Flat Type</label>
                                <Field
                                    as="select"
                                    id="flatType"
                                    name="flatType"
                                    className={styles.form_control}
                                >
                                    <option value="">Select Flat Type</option>
                                    {flatTypes.map((type: any) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage
                                    name="flatType"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>

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
                                    placeholder="Enter floor number"
                                />
                                <ErrorMessage
                                    name="floorNumber"
                                    component="p"
                                    className="text-danger"
                                />
                            </div>
                            {/* Facing Select */}
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
