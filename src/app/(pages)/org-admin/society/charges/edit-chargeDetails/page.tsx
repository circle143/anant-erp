"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updatePreferenceLocationChargeDetails } from "@/redux/action/org-admin";

const validationSchema = Yup.object({
  summary: Yup.string().required("Summary is required").min(3),
  disabled: Yup.boolean(),
});

const EditCharges = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState({
    summary: "",
    disabled: false,
  });

  const [params, setParams] = useState({ id: "", rera: "" });

  useEffect(() => {
    const id = searchParams.get("id") || "";
    const rera = searchParams.get("rera") || "";
    const summary = searchParams.get("summary") || "";
    const disable = searchParams.get("disable") === "true";

    setParams({ id, rera });

    setInitialValues({
      summary,
      disabled: disable,
    });
  }, [searchParams]);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      if (!params.id || !params.rera) {
        toast.error("Missing RERA or Charge ID");
        return;
      }

      const response = await updatePreferenceLocationChargeDetails(
        params.rera,
        params.id,
        values.summary,
        values.disabled
      );

      if (response?.error === false) {
        toast.success("Details updated successfully!");
        setTimeout(() => {
          router.push(`/org-admin/society/charges/?rera=${params.rera}`);
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
      <h1>Edit Charge Details</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className={styles.form}>
            {/* Summary */}
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

            {/* Disabled Checkbox */}
            <div className={styles.formGroup}>
              <label>
                <Field
                  type="checkbox"
                  name="disabled"
                  checked={values.disabled}
                  onChange={() => setFieldValue("disabled", !values.disabled)}
                />
                &nbsp;Disable
              </label>
            </div>

            {/* Submit Button */}
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
