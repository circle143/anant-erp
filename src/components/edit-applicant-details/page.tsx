"use client";

import React, { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { parsePhoneNumber } from "libphonenumber-js/min";
import { uploadData } from "aws-amplify/storage";
import { updateSaleCustomerDetails } from "@/redux/action/org-admin";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  Button,
  FormControl,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import imageCompression from "browser-image-compression";
import { CustomerDetails } from "@/utils/routes/sale/types";

interface Props {
  reraNumber: string;
  id: string;
  flatId?: string;
  ownerIndex?: number;
}

const EditApplicant: React.FC<Props> = ({
  reraNumber,
  id,
  flatId,
  ownerIndex,
}) => {
  const units = useSelector((state: RootState) => state.Society.units);
  const owner = useMemo(
    () =>
      units
        .flatMap((unit) => unit.saleDetail?.owners || [])
        .find((owner) => owner.id === id),
    [units, id]
  );

  const today = new Date();
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);

  const validationSchema = Yup.object()
    .shape({
      salutation: Yup.string().required("Salutation is required"),
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      dateOfBirth: Yup.date()
        .max(eighteenYearsAgo, "Must be at least 18 years old")
        .required("Date of Birth is required"),
      gender: Yup.string().required("Gender is required"),
      maritalStatus: Yup.string().required("Marital Status is required"),
      nationality: Yup.string().required("Nationality is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phoneNumber: Yup.string()
        .matches(/^\d{13}$/, "Phone must be 13 digits")
        .required("Phone is required"),
      numberOfChildren: Yup.number()
        .min(0, "Cannot be negative")
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      anniversaryDate: Yup.date()
        .max(today, "Cannot be future date")
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      aadharNumber: Yup.string()
        .matches(/^[2-9]{1}[0-9]{11}$/, "Invalid Aadhar")
        .nullable(),
      panNumber: Yup.string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN")
        .nullable(),
      passportNumber: Yup.string()
        .matches(/^[A-PR-WYa-pr-wy][0-9]{7}$/, "Invalid Passport")
        .nullable(),
      profession: Yup.string().nullable(),
      designation: Yup.string().nullable(),
      companyName: Yup.string().nullable(),
    })
    .test(
      "at-least-one-id",
      "At least one of Aadhar, PAN, or Passport is required",
      function (value) {
        return (
          !!value.aadharNumber || !!value.panNumber || !!value.passportNumber
        );
      }
    );

  const formik = useFormik({
    initialValues: {
      salutation: owner?.salutation || "",
      firstName: owner?.firstName || "",
      middleName: owner?.middleName || "",
      lastName: owner?.lastName || "",
      dateOfBirth: owner?.dateOfBirth
        ? new Date(owner.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: owner?.gender || "",
      maritalStatus: owner?.maritalStatus || "",
      nationality: owner?.nationality || "",
      email: owner?.email || "",
      phoneNumber: owner?.phoneNumber || "",
      numberOfChildren: owner?.numberOfChildren?.toString() || "",
      anniversaryDate: owner?.anniversaryDate
        ? new Date(owner.anniversaryDate).toISOString().split("T")[0]
        : "",
      aadharNumber: owner?.aadharNumber || "",
      panNumber: owner?.panNumber || "",
      passportNumber: owner?.passportNumber || "",
      profession: owner?.profession || "",
      designation: owner?.designation || "",
      companyName: owner?.companyName || "",
      photoPreview: owner?.photo || "",
      photo: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { photoPreview, ...cleanValues } = values;
        let customerPhoto: string | undefined = photoPreview;

        // Handle new photo upload
        if (cleanValues.photo instanceof File) {
          const compressedPhoto = await imageCompression(cleanValues.photo, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          });

          const fileExt = cleanValues.photo.name.split(".").pop();
          const s3Key = `${reraNumber}/${flatId}/customer${ownerIndex}/profile.${fileExt}`;

          const result = await uploadData({
            path: s3Key,
            data: compressedPhoto,
            options: { contentType: compressedPhoto.type },
          }).result;

          customerPhoto = result.path;
        }

        // Format phone number
        let formattedPhone = cleanValues.phoneNumber;
        try {
          const phoneNumber = parsePhoneNumber(cleanValues.phoneNumber, "IN");
          if (phoneNumber?.isValid()) {
            formattedPhone = phoneNumber.number;
          }
        } catch (error) {
          console.warn("Invalid phone number:", cleanValues.phoneNumber);
        }

        const formattedValues: CustomerDetails = {
          ...cleanValues,
          photo: customerPhoto,
          phoneNumber: formattedPhone,
          dateOfBirth: new Date(cleanValues.dateOfBirth),
          anniversaryDate: cleanValues.anniversaryDate
            ? new Date(cleanValues.anniversaryDate)
            : undefined,
          numberOfChildren: cleanValues.numberOfChildren
            ? parseInt(cleanValues.numberOfChildren)
            : undefined,
        };

        const result = await updateSaleCustomerDetails(
          reraNumber,
          id,
          formattedValues
        );

        if (result.error) {
          throw new Error(result.message);
        }

        toast.success("Customer details updated successfully!");
      } catch (error: any) {
        console.error("Update error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to update details"
        );
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      formik.setFieldValue("photo", file);
      formik.setFieldValue("photoPreview", URL.createObjectURL(file));
    } else {
      formik.setFieldValue("photo", null);
      formik.setFieldValue("photoPreview", owner?.photo || "");
    }
  };

  if (!owner) {
    return <div className={styles.container}>Applicant not found</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Edit Applicant Details</h2>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* ... (keep all existing form fields the same) ... */}

        {/* Photo Upload */}
        <FormControl fullWidth>
          <InputLabel>Upload Photo</InputLabel>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Photo
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          {formik.values.photoPreview && (
            <div className={styles.previewContainer}>
              <img
                src={formik.values.photoPreview}
                alt="Preview"
                className={styles.previewImage}
              />
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  formik.setFieldValue("photo", null);
                  formik.setFieldValue("photoPreview", "");
                }}
                sx={{ mt: 1 }}
              >
                Remove Photo
              </Button>
            </div>
          )}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Update Details
        </Button>
      </form>
    </div>
  );
};

export default EditApplicant;
