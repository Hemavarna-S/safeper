import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 5a2 2 0 0 1 2-2h5v8H4V5Zm0 10h7v6H6a2 2 0 0 1-2-2v-4Zm9 6v-8h7v6a2 2 0 0 1-2 2h-5Zm0-10V3h5a2 2 0 0 1 2 2v6h-7Z" />
      </svg>
    )
  },
  {
    label: "New Permit",
    path: "/new-permit",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
      </svg>
    )
  },
  {
    label: "Permits",
    path: "/permits",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Zm2 5h8V6H8v2Zm0 4h8v-2H8v2Zm0 4h5v-2H8v2Z" />
      </svg>
    )
  },
  {
    label: "QR Scanner",
    path: "/scanner",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h6v6H4V4Zm2 2v2h2V6H6Zm8-2h6v6h-6V4Zm2 2v2h2V6h-2ZM4 14h6v6H4v-6Zm2 2v2h2v-2H6Zm10-2h2v2h2v4h-4v-2h-2v-2h2v-2Zm-4 0h2v2h-2v-2Zm6-2h2v2h-2v-2Zm-6 6h2v2h-2v-2Z" />
      </svg>
    )
  },
  {
    label: "Workers",
    path: "/workers",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 1 1 16 0H4Z" />
      </svg>
    )
  }
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink className="sidebar-brand" to="/" aria-label="SafePermit dashboard">
        <span className="sidebar-brand__mark" aria-hidden="true">SP</span>
        <span>
          <strong>SafePermit</strong>
          <small>Control OS</small>
        </span>
      </NavLink>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? "sidebar-link is-active" : "sidebar-link"
            }
            end={item.path === "/"}
            key={item.path}
            to={item.path}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-status" aria-label="System status">
        <span className="status-dot" aria-hidden="true" />
        <div>
          <strong>Live sync</strong>
          <small>Permit data online</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
