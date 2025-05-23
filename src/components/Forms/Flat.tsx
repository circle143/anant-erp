"use client";
import styles from "./flatType.module.scss";
import { useState, ChangeEvent, FormEvent } from "react";

const Flat = () => {
  const [formData, setFormData] = useState({
    name: "",
    floorNumber: null as number | null,
    flatType: "",
    society: "",
  });

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? (value ? parseInt(value) || "" : "") : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className={`container ${styles.form}`}>
      <div>
        <h1>Flat</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.formsection}>
        <div className="form-group">
          <label htmlFor="name">Flat Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="floorNumber">Floor Number</label>
          <input
            type="number"
            name="floorNumber"
            id="floorNumber"
            value={formData.floorNumber ?? ""}
            onChange={handleChange}
            className="form-control"
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="flatType">Flat Type</label>
          <select
            name="flatType"
            id="flatType"
            value={formData.flatType}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Select Flat Type</option>
            <option value="Gold 1">Gold 1</option>
            <option value="Gold 2">Gold 2</option>
            <option value="Gold 3">Gold 3</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="society">Society</label>
          <select
            name="society"
            id="society"
            value={formData.society}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Select Society</option>
            <option value="Society A">Society A</option>
            <option value="Society B">Society B</option>
            <option value="Society C">Society C</option>
          </select>
        </div>

        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Flat;
