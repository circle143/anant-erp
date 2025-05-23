"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  TextField,
  InputLabel,
  FormHelperText,
  Button,
  Box,
} from "@mui/material";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateSaleCompanyCustomerDetails } from "@/redux/action/org-admin";

interface Props {
  reraNumber: string;
  id: string;
  route: "towers" | "society";
  towerId?: string;
}

const CompanySchema = Yup.object()
  .shape({
    name: Yup.string().required("Company name is required"),
    companyPan: Yup.string()
      .required("Company PAN is required")
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (Example: ABCDE1234F)"
      ),
    companyGST: Yup.string()
      .nullable()
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST format (Example: 12ABCDE3456F7Z8)"
      ),
    aadharNumber: Yup.string()
      .nullable()
      .matches(
        /^[2-9]{1}[0-9]{11}$/,
        "Invalid Aadhar format (12 digits, cannot start with 0/1)"
      ),
    panNumber: Yup.string()
      .nullable()
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (Example: ABCDE1234F)"
      ),
  })
  .test(
    "at-least-one-id",
    "At least one of Aadhar Number or PAN Number is required",
    function (value) {
      return !!value.aadharNumber?.trim() || !!value.panNumber?.trim();
    }
  );

const EditCompany: React.FC<Props> = ({ reraNumber, id, route , towerId}) => {
  const router = useRouter();

  const units = useSelector((state: RootState) =>
    route === "towers" ? state.TowerFlats.units : state.Society.units
  );

  const companyCustomer = units
    .map((unit) => unit.saleDetail?.companyCustomer)
    .find((customer) => customer?.id === id);

  if (!companyCustomer) {
    return (
      <Box>
        <div className={styles.errorContainer}>
          <h3>No company data found for ID: {id}</h3>
          <p>
            The company you are trying to edit does not exist or is no longer
            available.
          </p>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(
                route === "towers"
                  ? `/org-admin/society/towers/flats?rera=${reraNumber}&towerId=${towerId}`
                  : `/org-admin/society/flats?rera=${reraNumber}`
              )
            }
            sx={{ mt: 2 }}
          >
            Go Back to Flats Page
          </Button>
        </div>
      </Box>
    );
  }

  const initialValues = {
    name: companyCustomer.name || "",
    companyPan: companyCustomer.companyPan || "",
    companyGST: companyCustomer.companyGst || "",
    aadharNumber: companyCustomer.aadharNumber || "",
    panNumber: companyCustomer.panNumber || "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    toast.loading("Updating company details...", { id: "updateCompany" });
    try {
      const result = await updateSaleCompanyCustomerDetails(
        reraNumber,
        id,
        values
      );

      if (result?.error) {
        toast.error(`Update failed: ${result.message}`, {
          id: "updateCompany",
        });
      } else {
        toast.success("Company details updated successfully", {
          id: "updateCompany",
        });

        // Redirect based on route
        router.push(
          route === "towers"
            ? `/org-admin/society/towers/flats?rera=${reraNumber}`
            : `/org-admin/society/flats?rera=${reraNumber}`
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: "updateCompany" });
      console.error("Unexpected submit error:", error);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto">
      <div className={styles.headerContainer}>
        <h2>Edit Company Details</h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={CompanySchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ touched, errors }) => (
          <Form noValidate className={styles.formContainer}>
            <div>
              <InputLabel>Company Name *</InputLabel>
              <Field
                as={TextField}
                name="name"
                fullWidth
                error={touched.name && !!errors.name}
                helperText={<ErrorMessage name="name" />}
                margin="dense"
              />
            </div>
            <div>
              <InputLabel>Company PAN Number *</InputLabel>
              <Field
                as={TextField}
                name="companyPan"
                fullWidth
                inputProps={{
                  maxLength: 10,
                  style: { textTransform: "uppercase" },
                }}
                error={touched.companyPan && !!errors.companyPan}
                helperText={<ErrorMessage name="companyPan" />}
                margin="dense"
              />
            </div>
            <div>
              <InputLabel>Company GST</InputLabel>
              <Field
                as={TextField}
                name="companyGST"
                fullWidth
                error={touched.companyGST && !!errors.companyGST}
                helperText={<ErrorMessage name="companyGST" />}
                margin="dense"
              />
            </div>
            <div>
              <InputLabel>Aadhar Number</InputLabel>
              <Field
                as={TextField}
                name="aadharNumber"
                fullWidth
                error={touched.aadharNumber && !!errors.aadharNumber}
                helperText={<ErrorMessage name="aadharNumber" />}
                margin="dense"
              />
            </div>
            <div>
              <InputLabel>PAN Number</InputLabel>
              <Field
                as={TextField}
                name="panNumber"
                fullWidth
                inputProps={{
                  maxLength: 10,
                  style: { textTransform: "uppercase" },
                }}
                error={touched.panNumber && !!errors.panNumber}
                helperText={<ErrorMessage name="panNumber" />}
                margin="dense"
              />
              {typeof errors === "string" && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {errors}
                </FormHelperText>
              )}
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Save Changes
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default EditCompany;
