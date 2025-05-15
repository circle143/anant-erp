"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateOtherChargePrice } from "@/redux/action/org-admin";

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

      const response = await updateOtherChargePrice(
        rera,
        id,
        Number(values.price)
      );

      if (response?.error === false) {
        toast.success("Price updated successfully!");
        setTimeout(() => {
           router.push(`/org-admin/society/other-charges/?rera=${rera}`);
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

  return (
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
  );
};

export default EditCharges;
