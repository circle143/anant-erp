"use client";

import React, { useState, useEffect } from "react";
import { decodeAccessToken } from "@/utils/get_user_tokens";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import styles from "./society.module.scss";
import toast from "react-hot-toast";
import {
  createSociety,
  updateSocietyDetails,
} from "../../redux/action/org-admin";
import { getUrl, uploadData } from "aws-amplify/storage";
import imageCompression from "browser-image-compression";

const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface SocietyProps {
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    Rera: string;
    address: string;
    logo?: string;
  };
  onSuccess?: () => void;
}

interface SocietyFormValues {
  name: string;
  Rera: string;
  address: string;
  image: File | null;
}

const validationSchema = Yup.object({
  name: Yup.string().min(3).required("Society name is required"),
  Rera: Yup.string().min(5).required("RERA number is required"),
  address: Yup.string().min(10).required("Address is required"),
  image: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, and WEBP files are allowed",
      (value) => {
        if (!value) return true;
        return value instanceof File && SUPPORTED_FORMATS.includes(value.type);
      }
    ),
});

const ImageUploadField: React.FC<{
  preview: string | null;
  setPreview: (url: string) => void;
}> = ({ preview, setPreview }) => {
  const { setFieldValue, setFieldTouched } =
    useFormikContext<SocietyFormValues>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFieldTouched("image", true);
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }

    setFieldValue("image", file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.image_upload}>
      <label htmlFor="imageUpload" className={styles.image_label}>
        {preview ? (
          <img src={preview} alt="Preview" className={styles.preview_img} />
        ) : (
          <span>+</span>
        )}
        <input
          type="file"
          id="imageUpload"
          onChange={handleImageChange}
          className={styles.file_input}
        />
      </label>
      <ErrorMessage
        name="image"
        component="p"
        className={styles["text-danger"]}
      />
      <h3>Society Logo</h3>
    </div>
  );
};

const Society: React.FC<SocietyProps> = ({
  mode = "create",
  initialData,
  onSuccess,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData?.logo) {
      setPreview(initialData.logo);
    }
  }, [initialData]);

  const handleSubmit = async (
    values: SocietyFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    setLoading(true);
    try {
      const data = await decodeAccessToken();
      let coverPhoto = initialData?.logo || "";

      if (values.image) {
        const compressedFile = await imageCompression(values.image, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });

        const fileExt = values.image.name.split(".").pop();
        const s3Key = `${data?.["custom:org_id"]}/${values.Rera}/society/profile.${fileExt}`;

        const result = await uploadData({
          path: s3Key,
          data: compressedFile,
          options: { contentType: compressedFile.type },
        }).result;

        coverPhoto = result.path;
      }

      const payload = {
        rera: values.Rera,
        name: values.name,
        address: values.address,
        logo: coverPhoto,
      };

      const response =
        mode === "edit"
          ? await updateSocietyDetails(
              payload.rera,
              payload.name,
              payload.address,
              payload.logo)
          : await createSociety(
              payload.rera,
              payload.name,
              payload.address,
              payload.logo
            );

      if (response.error) {
        toast.error(
          response.message ||
            `${mode === "edit" ? "Update" : "Creation"} failed`
        );
        return;
      }

      toast.success(
        `Society ${mode === "edit" ? "updated" : "created"} successfully!`
      );

      resetForm();
      setPreview(null);

      if (mode === "edit" && typeof onSuccess === "function") {
        onSuccess(); // redirect after edit
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const initialValues: SocietyFormValues = {
    name: initialData?.name || "",
    Rera: initialData?.Rera || "",
    address: initialData?.address || "",
    image: null,
  };

  return (
    <div className={`container ${styles.container}`}>
      <h1>{mode === "edit" ? "Edit Society" : "Create Society"}</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className={styles.formsection}>
            <ImageUploadField preview={preview} setPreview={setPreview} />

            <div className={styles.form_group}>
              <label htmlFor="name">Society Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={styles.form_control}
              />
              <ErrorMessage
                name="name"
                component="p"
                className={styles["text-danger"]}
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="Rera">RERA Number</label>
              <Field
                type="text"
                id="Rera"
                name="Rera"
                className={styles.form_control}
                disabled={mode === "edit"}
              />
              <ErrorMessage
                name="Rera"
                component="p"
                className={styles["text-danger"]}
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="address">Address</label>
              <Field
                as="textarea"
                id="address"
                name="address"
                className={styles.form_control}
              />
              <ErrorMessage
                name="address"
                component="p"
                className={styles["text-danger"]}
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading
                ? "Submitting..."
                : mode === "edit"
                ? "Update"
                : "Submit"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Society;
