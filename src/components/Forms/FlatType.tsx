"use client";
import styles from "./flatType.module.scss";
import { useState, ChangeEvent, FormEvent } from "react";

const FlatType = () => {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    price: "",
    type: "",
    society: "",
  });

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // ✅ Correctly updating state
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
        <h1>Flat Type</h1>
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="area">Area</label>
          <input
            type="number"
            name="area"
            id="area"
            value={formData.area}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <input
            type="text"
            name="type"
            id="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="society">Society</label>
          <select
            name="society"
            id="society"
            value={formData.society}
            onChange={handleChange}
            className="form-control"
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

export default FlatType;
