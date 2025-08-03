"use client";
import styles from "./flatType.module.scss";
import { useState, ChangeEvent, FormEvent } from "react";

const Tower = () => {
  const [formData, setFormData] = useState({
    name: "",
    floorCount: "",
    flatCount: "",
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
      [name]: type === "number" ? (value ? parseInt(value) : "") : value, // Convert number fields
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
        <h1>Tower</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.formsection}>
        <div className="form-group">
          <label htmlFor="name">Tower Name</label>
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
          <label htmlFor="floorCount">Floor Count</label>
          <input
            type="number"
            name="floorCount"
            id="floorCount"
            value={formData.floorCount}
            onChange={handleChange}
            className="form-control"
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="flatCount">Per Floor Flat Count</label>
          <input
            type="number"
            name="flatCount"
            id="flatCount"
            value={formData.flatCount}
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

export default Tower;
