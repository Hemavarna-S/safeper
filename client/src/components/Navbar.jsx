import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm8 0h8v-9h-8v9Zm0-16v5h8V4h-8Z"
  },
  {
    to: "/new-permit",
    label: "New Permit",
    icon: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z"
  },
  {
    to: "/permits",
    label: "Permits",
    icon: "M7 3h7l4 4v14H7V3Zm6 1.7V8h3.3L13 4.7ZM9 11v2h7v-2H9Zm0 4v2h7v-2H9Z"
  },
  {
    to: "/workers",
    label: "Workers",
    icon: "M8.5 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm7 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2 20c.5-3.4 3-6 6.5-6s6 2.6 6.5 6H2Zm11.7-5.3c.7-.5 1.6-.7 2.6-.7 2.9 0 5 2.2 5.5 5h-4.9a7.6 7.6 0 0 0-3.2-4.3Z"
  }
];

function Navbar() {
  return (
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="SafePermit dashboard">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 2.4 19.4 5v6.1c0 4.7-3 8.9-7.4 10.5-4.4-1.6-7.4-5.8-7.4-10.5V5L12 2.4Zm0 4.2-4.1 1.5v3c0 3 1.6 5.8 4.1 7.2 2.5-1.4 4.1-4.2 4.1-7.2v-3L12 6.6Zm3.1 3.6-3.9 4.1-2.1-2.1 1.1-1.1 1 1 2.8-3 1.1 1.1Z" />
          </svg>
        </span>
        <span>
          <strong>SafePermit</strong>
          <small>Work clearance hub</small>
        </span>
      </NavLink>

      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link is-active" : "nav-link"
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
