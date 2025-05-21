"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Props {
  reraNumber: string;
  id: string; // Owner ID
}

const EditApplicant: React.FC<Props> = ({ reraNumber, id }) => {
  const units = useSelector((state: RootState) => state.Society.units);

  // Find the owner by ID across all units
  const owner = units
    .flatMap((unit) => unit.saleDetail?.owners || [])
    .find((owner) => owner.id === id);

  if (!owner) {
    return <div>No applicant found with ID: {id}</div>;
  }

  return (
    <div>
      <h2>Edit Applicant Details</h2>
      <p>
        <strong>Name:</strong> {owner.salutation} {owner.firstName}{" "}
        {owner.middleName} {owner.lastName}
      </p>
      <p>
        <strong>Email:</strong> {owner.email}
      </p>
      <p>
        <strong>Phone:</strong> {owner.phoneNumber}
      </p>
      <p>
        <strong>Date of Birth:</strong> {owner.dateOfBirth}
      </p>
      <p>
        <strong>Gender:</strong> {owner.gender}
      </p>
      <p>
        <strong>Marital Status:</strong> {owner.maritalStatus}
      </p>
      <p>
        <strong>Nationality:</strong> {owner.nationality}
      </p>
      <p>
        <strong>PAN:</strong> {owner.panNumber}
      </p>
      <p>
        <strong>Aadhar:</strong> {owner.aadharNumber}
      </p>
      <p>
        <strong>Passport:</strong> {owner.passportNumber}
      </p>
      <p>
        <strong>Profession:</strong> {owner.profession}
      </p>
      <p>
        <strong>Designation:</strong> {owner.designation}
      </p>
      <p>
        <strong>Company Name:</strong> {owner.companyName}
      </p>
      <p>
        <strong>Number of Children:</strong> {owner.numberOfChildren}
      </p>
      <p>
        <strong>Anniversary:</strong> {owner.anniversaryDate || "N/A"}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(owner.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default EditApplicant;
