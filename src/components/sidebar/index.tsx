// components/Sidebar/index.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { closeSidebar } from "../../redux/slice/sidebarSlice";

type MenuItem = {
  eventKey: string;
  paths: string[];
  icon: string;
  text: string;
};

type SidebarProps = {
  menuItems: MenuItem[];
};

const Index = ({ menuItems }: SidebarProps) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.isOpen);

  return (
    <div className={`${styles.sidebarWrapper} ${isOpen ? styles.open : ""}`}>
      <aside className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <X size={24} onClick={() => dispatch(closeSidebar())} />
        <div className={styles.logo}>
          <Link href="/" onClick={() => dispatch(closeSidebar())}>
            <img src="/Logo.svg" alt="Logo" />
          </Link>
        </div>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li
              key={item.eventKey}
              className={`${styles.menuItem} ${
                item.paths.some((path) => pathname.startsWith(path))
                  ? styles.active
                  : ""
              }`}
            >
              <Link
                href={item.paths[0]}
                className={styles.menuLink}
                onClick={() => dispatch(closeSidebar())}
              >
                <i className={`menu-icon ${item.icon}`}></i>
                <span>{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default Index;