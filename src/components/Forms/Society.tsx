"use client";
import styles from "./society.module.scss";
import { useState, ChangeEvent, FormEvent } from "react";

const Society = () => {
  const [formData, setFormData] = useState({
    name: "",
    Rera: "",
  });

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        <h1>Society</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.formsection}>
        <div className="form-group">
          <label htmlFor="name">Society Name</label>
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
          <label htmlFor="Rera">Rera Number</label>
          <input
            type="text"
            name="Rera"
            id="Rera"
            value={formData.Rera}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Society;
