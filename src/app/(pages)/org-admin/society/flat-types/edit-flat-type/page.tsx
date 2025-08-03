"use client"
import React from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
// import { updateFlatType } from "@/redux/action/org-admin"; // Assume you have this
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // At the top of the file

const validationSchema = Yup.object({
  name: Yup.string().min(3).required("Name is required"),
  type: Yup.string().required("Type is required"),
  price: Yup.number().required("Price is required").min(0),
  area: Yup.number().required("Area is required").min(0),
});

const EditFlatType = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const rera = searchParams.get("rera");
const router = useRouter();

  const initialValues = {
    name: searchParams.get("name") || "",
    type: searchParams.get("type") || "",
    price: searchParams.get("price") || "",
    area: searchParams.get("area") || "",
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

      // const response = await updateFlatType(
      //   id,
      //   rera,
      //   values.name,
      //   values.type,
      //   Number(values.price),
      //   Number(values.area)
      // );

      // if (response?.error === false) {
      //   toast.success("Flat type updated successfully! Redirecting...");
      //   setTimeout(() => {
      //     router.push(`/org-admin/society/flat-type?rera=${rera}`);
      //   }, 1000); // 5 seconds
      // } else {
      //   toast.error(response?.message || "Update failed");
      // }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Update Error:", error);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className={`container ${styles.container}`}>
      <h1>Edit Flat Type</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <Field type="text" name="name" className={styles.form_control} />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <Field type="text" name="type" className={styles.form_control} />
              <ErrorMessage name="type" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
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

            <div className={styles.formGroup}>
              <label htmlFor="area">Area</label>
              <Field
                type="number"
                name="area"
                className={styles.form_control}
              />
              <ErrorMessage name="area" component="p" className="text-danger" />
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

export default EditFlatType;
