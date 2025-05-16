"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { createUser } from "@/redux/action/org-admin"; // adjust the path if needed
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { new_user } from "@/utils/breadcrumbs";
// Formik form values type
interface UserFormValues {
    email: string;
}

// Validation schema
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
});

// Main CreateUser component
const Page: React.FC = () => {
    const handleSubmit = async (
        values: UserFormValues,
        { resetForm }: { resetForm: () => void }
    ) => {
        try {
            const response = await createUser(values.email);

            if (response.error) {
                toast.error(response.message || "Failed to create user");
                return;
            }

            toast.success("User created successfully!");
            resetForm();
        } catch (err: any) {
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

    const initialValues: UserFormValues = {
        email: "",
    };

    return (
        <div>
            <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
                <CustomBreadcrumbs items={new_user} />
            </div>
            <div className={`container ${styles.container}`}>
                <h1>Create New User</h1>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form className={styles.formsection}>
                            <div className={styles.form_group}>
                                <label htmlFor="email">Email</label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={styles.form_control}
                                />
                                <ErrorMessage
                                    name="email"
                                    component="p"
                                    className={styles["text-danger"]}
                                />
                            </div>

                            <button type="submit" className={styles.button}>
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Page;
