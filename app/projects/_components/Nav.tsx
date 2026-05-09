"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLang } from "../_lib/lang";
import { ProjectsModal } from "./ProjectsModal";

export function ProjectsNav() {
  const { lang, setLang } = useLang();
  const [allOpen, setAllOpen] = useState(false);
  return (
    <>
      <nav className="projects-nav">
        <Link href="/" aria-label="Home" className="brand-pill">
          <Image
            src="/ben.jpg"
            alt="Atakan Savaş"
            width={28}
            height={28}
            className="brand-avatar"
          />
          <span className="brand-text">
            <span className="brand-name">Atakan Savaş</span>
            <span className="brand-role">{lang === "tr" ? "Kariyer Arşivi" : "Career Archive"}</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            type="button"
            className="nav-all-projects"
            onClick={() => setAllOpen(true)}
          >
            {lang === "tr" ? "tüm projeler" : "all projects"}
          </button>
          <Link href="/cv">cv</Link>
          <Link href="/mesai">mesai</Link>
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            aria-label="Toggle language"
          >
            <span className={`pill ${lang === "tr" ? "active" : ""}`}>TR</span>
            <span className={`pill ${lang === "en" ? "active" : ""}`}>EN</span>
          </button>
        </div>
      </nav>
      <ProjectsModal open={allOpen} onClose={() => setAllOpen(false)} />
    </>
  );
}
