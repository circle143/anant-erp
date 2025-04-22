"use client";

import React, { useEffect, useState } from "react";
import { decodeAccessToken } from "@/utils/get_user_tokens";
import { uploadData } from "aws-amplify/storage";
import styles from "./page.module.scss";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [img, setImg] = useState("/dp.jpg");
  const [originalName, setOriginalName] = useState("");
  const [originalImg, setOriginalImg] = useState("/dp.jpg");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await decodeAccessToken();
      const userName = data?.name || "No name provided";
      const userImg = data?.img || "/dp.jpg";

      setUser(data);
      setName(userName);
      setImg(userImg);
      setOriginalName(userName);
      setOriginalImg(userImg);
    };

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSave = async () => {
    let newImg = img;

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await uploadData({
          path: `profile-images/${file.name}`,
          data: arrayBuffer,
          options: {
            contentType: file.type,
          },
        }).result;
        // Manually construct the S3 URL (assuming your files are public)
        const bucket = "erp-bucket";
        const region = "ap-south-1"; // e.g., ap-south-1
        const key = result.path;
        const email=user?.email;
        const orgId = user?.["custom:org_id"];
        newImg = `https://${bucket}.s3.${region}.amazonaws.com/profile-images/${orgId}/${email}/${key}`;
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    // Update state (mocking backend update)
    setUser({ ...user, name, img: newImg });
    setOriginalName(name);
    setOriginalImg(newImg);
    setImg(newImg);
    setFile(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(originalName);
    setImg(originalImg);
    setFile(null);
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

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />

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
