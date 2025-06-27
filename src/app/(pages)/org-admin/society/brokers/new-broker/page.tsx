"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { addBroker } from "@/redux/action/org-admin";

const validationSchema = Yup.object({
	name: Yup.string().required("Name is required"),
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
});

const Page = () => {
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const rera = searchParams.get("rera");

	const handleSubmit = async (
		values: {
			name: string;
			aadharNumber: string;
			panNumber: string;
		},
		{ resetForm }: { resetForm: () => void }
	) => {
		if (!rera) {
			toast.error("RERA number missing from URL");
			return;
		}

		setLoading(true);

		try {
			const response = await addBroker(
				rera,
				values.name,
				values.panNumber,
				values.aadharNumber
			);

			if (response?.error === false) {
				toast.success("Broker added successfully!");
				resetForm();
			} else {
				const errorMessage =
					response?.response?.data?.message ||
					response?.message ||
					"Something went wrong";
				toast.error(errorMessage);
				console.error("API Error:", errorMessage);
			}
		} catch (error) {
			toast.error("Unexpected error occurred");
			console.error("Unexpected error:", error);
		} finally {
			setLoading(false);
		}
	};

	const new_broker_breadcrumb = [
		{ name: "Home", href: "/org-admin" },
		{ name: "Societies", href: "/org-admin/society" },
		{
			name: "Brokers",
			href: `/org-admin/society/brokers?rera=${rera}`,
		},
		{ name: "New Broker" },
	];

	return (
		<div>
			<div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
				<CustomBreadcrumbs items={new_broker_breadcrumb} />
			</div>
			<div className={`container ${styles.container}`}>
				<h1>Create Broker</h1>
				<Formik
					initialValues={{
						name: "",
						panNumber: "",
						aadharNumber: "",
					}}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
				>
					<Form className={`form ${styles.form}`}>
						<div className={styles.formGroup}>
							<label htmlFor="name">Name</label>
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

						<div className={styles.formGroup}>
							<label htmlFor="panNumber">PAN Number</label>
							<Field
								type="text"
								id="panNumber"
								name="panNumber"
								className={styles.form_control}
							/>
							<ErrorMessage
								name="panNumber"
								component="p"
								className="text-danger"
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="aadharNumber">Aadhar Number</label>
							<Field
								type="text"
								id="aadharNumber"
								name="aadharNumber"
								className={styles.form_control}
							/>
							<ErrorMessage
								name="aadharNumber"
								component="p"
								className="text-danger"
							/>
						</div>

						<button type="submit" disabled={loading}>
							{loading ? "Submitting..." : "Submit"}
						</button>
					</Form>
				</Formik>
			</div>
		</div>
	);
};

export default Page;
