"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Tableau de bord", href: "/dashboard" },
  { label: "Marchés",         href: "/marches"   },
  { label: "Nations",         href: "/nations"   },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          Chrysus
        </Link>
        <nav className="nav">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${pathname.startsWith(href) ? " nav-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
