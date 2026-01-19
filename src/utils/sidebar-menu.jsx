export const sidebarAdminItems = [
  {
    eventKey: "dashboard",
    icon: "bx bx-bar-chart-alt-2", // Dashboard icon
    text: "Dashboard",
    paths: ["/admin/dashboard"],
  },
  {
    eventKey: "Create_Organization",
    icon: "bx bx-building", // Organization icon
    text: "Create Organization",
    paths: ["/admin/create-organization"],
  },
];

export const sidebarOrgAdminItems = [
  // {
  //     eventKey: "Create Socity",
  //     icon: "bx bx-building-house", // Society icon
  //     text: "Create Society",
  //     paths: ["/org-admin/new-society"],
  // },
  {
    eventKey: "Societies",
    icon: "bx bx-buildings", // Societies list
    text: "Societies",
    paths: ["/org-admin/society", "/org-admin/society/flat"],
  },
  // {
  //     eventKey: "new user",
  //     icon: "bx bx-user-plus", // New user icon
  //     text: "Create New User",
  //     paths: ["/org-admin/new-user"],
  // },
  // {
  //     eventKey: "users",
  //     icon: "bx bx-user", // Users icon
  //     text: "Users",
  //     paths: ["/org-admin/users"],
  // },
  // {
  //     eventKey: "report",
  //     icon: "bx bx-bar-chart-square", // Sales report
  //     text: "Sales Report",
  //     paths: ["/org-admin/report"],
  // },
  // {
  //     eventKey: "broker-report",
  //     icon: "bx bx-id-card", // Broker icon
  //     text: "Broker Report",
  //     paths: ["/org-admin/broker-report"],
  // },
  // {
  //     eventKey: "bank-report",
  //     icon: "bx bx-building", // Bank icon
  //     text: "Bank Report",
  //     paths: ["/org-admin/bank-report"],
  // },
  {
    eventKey: "Sale",
    icon: "bx bx-rupee", // Sale icon
    text: "Sale",
    paths: ["/org-admin/sale"],
  },
];

export const sidebarUserItems = [
  {
    eventKey: "Societies",
    icon: "bx bx-buildings", // Societies list
    text: "Societies",
    paths: ["/user/societies", "/user/societies/flat"],
  },
  {
    eventKey: "Sale",
    icon: "bx bx-shopping-bag", // User sale icon
    text: "Sale",
    paths: ["/user/sale"],
  },
];
