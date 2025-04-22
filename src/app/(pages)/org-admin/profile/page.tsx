"use client";

import React, { useEffect, useState } from "react";
import { decodeAccessToken } from "@/utils/get_user_tokens";
import styles from "./page.module.scss";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [img, setImg] = useState("/dp.jpg");
  const [originalName, setOriginalName] = useState("");
  const [originalImg, setOriginalImg] = useState("/dp.jpg");

  useEffect(() => {
    const fetchUser = async () => {
      const data = await decodeAccessToken();
      setUser(data);
      const userName = data?.name || "No name provided";
      const userImg = data?.img || "/dp.jpg";

      setName(userName);
      setImg(userImg);
      setOriginalName(userName);
      setOriginalImg(userImg);
    };

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUser({ ...user, name, img });
    setOriginalName(name);
    setOriginalImg(img);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(originalName);
    setImg(originalImg);
    setIsEditing(false);
  };

  return (
    <div className={styles.userCardWrapper}>
      <div className={styles.userCard}>
        <img src={img} alt="User" className={styles.avatar} />

        {isEditing ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Enter your name"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <div className={styles.buttonGroup}>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.email}>{user?.email || "No email"}</p>
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
