export const sidebarAdminItems = [
  {
    eventKey: "dashboard",
    icon: "bx bx-home-circle",
    text: "Dashboard",
    paths: ["/admin"],
  },
  {
    eventKey: "Create_Organization",
    icon: "bx bxs-user-account",
    text: "Create Organization",
    paths: ["/admin/create-organization"],
  },
];
export const sidebarOrgAdminItems = [
  {
    eventKey: "Create Socity",
    icon: "bx bxs-user-account",
    text: "Create Society",
    paths: ["/org-admin/new-society"],
  },

  {
    eventKey: "Societies",
    icon: "bx bxs-phone-call",
    text: "Societies",
    paths: ["/org-admin/society", "/org-admin/society/flat"],
  },
  {
    eventKey: "new user",
    icon: "bx bxs-bell-ring",
    text: "Create New User",
    paths: ["/org-admin/new-user"],
  },
  {
    eventKey: "users",
    icon: "bx bxs-bell-ring",
    text: "Users",
    paths: ["/org-admin/users"],
  },
];
export const sidebarUserItems = [
  {
    eventKey: "dashboard",
    icon: "bx bx-home-circle",
    text: "Dashboard",
    paths: ["/org-admin/flate"],
  },
  {
    eventKey: "fans",
    icon: "bx bxs-user-account",
    text: "Fans",
    paths: ["/app/fans"],
  },
  {
    eventKey: "influencers",
    icon: "bx bxs-user-account",
    text: "Influencers",
    paths: ["/app/influencers"],
  },
  {
    eventKey: "requests",
    icon: "bx bxs-user-account",
    text: "Requests",
    paths: ["/app/requests"],
  },

  {
    eventKey: "notifications",
    icon: "bx bxs-bell-ring",
    text: "Notifications",
    paths: ["/app/notifications"],
  },
];
