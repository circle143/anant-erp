"use client";

import React, { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
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

interface Props {
  reraNumber: string;
  id: string;
}

const EditApplicant: React.FC<Props> = ({ reraNumber, id }) => {
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
      .matches(/^\d{10}$/, "Phone must be 10 digits")
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
      photo: null as File | null,
      photoPreview: owner?.photo || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formattedValues = {
          ...values,
          dateOfBirth: new Date(values.dateOfBirth),
          anniversaryDate: values.anniversaryDate
            ? new Date(values.anniversaryDate)
            : undefined,
          numberOfChildren: values.numberOfChildren
            ? parseInt(values.numberOfChildren)
            : undefined,
          photo: values.photo || undefined,
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
    }
  };

  if (!owner) {
    return <div className={styles.container}>Applicant not found</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Edit Applicant Details</h2>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Salutation */}
        <FormControl
          fullWidth
          error={formik.touched.salutation && !!formik.errors.salutation}
        >
          <InputLabel>Salutation *</InputLabel>
          <Select
            name="salutation"
            value={formik.values.salutation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Salutation *"
          >
            <MenuItem value="Mr.">Mr.</MenuItem>
            <MenuItem value="Mrs.">Mrs.</MenuItem>
            <MenuItem value="Ms.">Ms.</MenuItem>
            <MenuItem value="Dr.">Dr.</MenuItem>
            <MenuItem value="Prof.">Prof.</MenuItem>
          </Select>
          {formik.touched.salutation && formik.errors.salutation && (
            <FormHelperText error>{formik.errors.salutation}</FormHelperText>
          )}
        </FormControl>

        {/* Name Fields */}
        <TextField
          label="First Name *"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && !!formik.errors.firstName}
          helperText={formik.touched.firstName && formik.errors.firstName}
          fullWidth
        />

        <TextField
          label="Middle Name"
          name="middleName"
          value={formik.values.middleName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
        />

        <TextField
          label="Last Name *"
          name="lastName"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && !!formik.errors.lastName}
          helperText={formik.touched.lastName && formik.errors.lastName}
          fullWidth
        />

        {/* Date of Birth */}
        <TextField
          label="Date of Birth *"
          type="date"
          name="dateOfBirth"
          value={formik.values.dateOfBirth}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.dateOfBirth && !!formik.errors.dateOfBirth}
          helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
          fullWidth
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              inputProps: {
                max: new Date(
                  new Date().setFullYear(new Date().getFullYear() - 18)
                )
                  .toISOString()
                  .split("T")[0], // Must be at least 18
              },
            },
          }}
        />

        {/* Gender */}
        <FormControl
          fullWidth
          error={formik.touched.gender && !!formik.errors.gender}
        >
          <InputLabel>Gender *</InputLabel>
          <Select
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Gender *"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Transgender">Transgender</MenuItem>
          </Select>
          {formik.touched.gender && formik.errors.gender && (
            <FormHelperText error>{formik.errors.gender}</FormHelperText>
          )}
        </FormControl>

        {/* Marital Status */}
        <FormControl
          fullWidth
          error={formik.touched.maritalStatus && !!formik.errors.maritalStatus}
        >
          <InputLabel>Marital Status *</InputLabel>
          <Select
            name="maritalStatus"
            value={formik.values.maritalStatus}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Marital Status *"
          >
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Married">Married</MenuItem>
          </Select>
          {formik.touched.maritalStatus && formik.errors.maritalStatus && (
            <FormHelperText error>{formik.errors.maritalStatus}</FormHelperText>
          )}
        </FormControl>

        {/* Nationality */}
        <FormControl
          fullWidth
          error={formik.touched.nationality && !!formik.errors.nationality}
        >
          <InputLabel>Nationality *</InputLabel>
          <Select
            name="nationality"
            value={formik.values.nationality}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Nationality *"
          >
            <MenuItem value="Resident">Resident</MenuItem>
            <MenuItem value="PIO">PIO</MenuItem>
            <MenuItem value="NRI">NRI</MenuItem>
            <MenuItem value="OCI">OCI</MenuItem>
          </Select>
          {formik.touched.nationality && formik.errors.nationality && (
            <FormHelperText error>{formik.errors.nationality}</FormHelperText>
          )}
        </FormControl>

        {/* Contact Information */}
        <TextField
          label="Email *"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && !!formik.errors.email}
          helperText={formik.touched.email && formik.errors.email}
          fullWidth
        />

        <TextField
          label="Phone Number *"
          name="phoneNumber"
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phoneNumber && !!formik.errors.phoneNumber}
          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
          fullWidth
        />

        {/* Family Information */}
        <TextField
          label="Number of Children"
          name="numberOfChildren"
          type="number"
          value={formik.values.numberOfChildren}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.numberOfChildren && !!formik.errors.numberOfChildren
          }
          helperText={
            formik.touched.numberOfChildren && formik.errors.numberOfChildren
          }
          fullWidth
        />

        <TextField
          label="Anniversary Date"
          type="date"
          name="anniversaryDate"
          value={formik.values.anniversaryDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.anniversaryDate && !!formik.errors.anniversaryDate
          }
          helperText={
            formik.touched.anniversaryDate && formik.errors.anniversaryDate
          }
          fullWidth
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              inputProps: {
                max: new Date().toISOString().split("T")[0], // disable future
              },
            },
          }}
        />

        {/* Identity Documents */}
        <TextField
          label="Aadhar Number"
          name="aadharNumber"
          value={formik.values.aadharNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.aadharNumber && !!formik.errors.aadharNumber}
          helperText={formik.touched.aadharNumber && formik.errors.aadharNumber}
          fullWidth
        />

        <TextField
          label="PAN Number"
          name="panNumber"
          value={formik.values.panNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.panNumber && !!formik.errors.panNumber}
          helperText={formik.touched.panNumber && formik.errors.panNumber}
          fullWidth
        />

        <TextField
          label="Passport Number"
          name="passportNumber"
          value={formik.values.passportNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.passportNumber && !!formik.errors.passportNumber
          }
          helperText={
            formik.touched.passportNumber && formik.errors.passportNumber
          }
          fullWidth
        />

        {/* Professional Information */}
        <TextField
          label="Profession"
          name="profession"
          value={formik.values.profession}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
        />

        <TextField
          label="Designation"
          name="designation"
          value={formik.values.designation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
        />

        <TextField
          label="Company Name"
          name="companyName"
          value={formik.values.companyName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
        />

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
            <img
              src={formik.values.photoPreview}
              alt="Preview"
              className={styles.previewImage}
            />
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
