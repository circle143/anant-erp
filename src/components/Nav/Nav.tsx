"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import React, { useState, useRef, useEffect } from "react";
import styles from "./nav.module.scss";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../../redux/slice/sidebarSlice";
import { getAccessToken } from "@/utils/get_user_tokens";

const Nav = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.navbarWrapper} ref={dropdownRef}>
      <div className={styles.welcomeText}>
        <Menu size={24} onClick={() => dispatch(toggleSidebar())} />
        <div>
          <p>Welcome</p>
        </div>
      </div>
      <div
        className={styles.profile}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Image
          src="/assets/images/user.png"
          alt="Profile"
          width={40}
          height={40}
        />
      </div>

      {showDropdown && (
        <div className={styles.dropdownMenu}>
          <button className="btn btn-outline-danger btn-sm" onClick={signOut}>
            Sign out
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={async () => {
              navigator.clipboard.writeText((await getAccessToken()) ?? "");
            }}
          >
            Get Access Token
          </button>
        </div>
      )}
    </div>
  );
};

export default Nav;
