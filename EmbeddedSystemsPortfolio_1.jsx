import React, { useState } from "react";

/**
 * Embedded Systems Engineer Portfolio — January 2026
 *
 * Design concept: a PCB trace running top to bottom connects each
 * experience "component" like a schematic, since the subject is
 * embedded systems / hardware-adjacent infrastructure work.
 *
 * Fill in the placeholder fields (name, summary, skills, contact)
 * with your own details — those are marked with [brackets].
 */

const FONT_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');
`;

const TOKENS = {
  bg: "#0A0F0D",
  panel: "#101915",
  panelBorder: "#22322A",
  copper: "#C08552",
  copperBright: "#E3A868",
  phosphor: "#6EE7B7",
  text: "#EDEDE3",
  textDim: "#8B978F",
};

const experience = [
  {
    id: "01",
    title: "Asian Hospital and Medical Center",
    org: "Infrastructure and Network",
    dept: "",
    meta: "500 Hours",
    period: "Sep 2025 — Jan 2026",
    active: false,
    detail:
      "Supported infrastructure and network operations in a hospital IT environment, logging 500 hours of hands-on experience.",
  },
  {
    id: "02",
    title: "Crew Member",
    org: "McDonald's",
    dept: "Front-of-house operations",
    meta: "9 months",
    period: "Jun 2023 — Apr 2024",
    active: false,
    detail:
      "Handled high-throughput, time-critical service operations — the kind of process discipline and uptime pressure that maps directly onto systems work.",
  },
];

const skills = [
  "Network Infrastructure",
  "Embedded C / C++",
  "TCP/IP",
  "React",
  "Linux",
  "Git",
];

const contact = {
  phone: "0971 688 613",
  email: "ejosh8650@gmail.com",
  github: "https://github.com/emmanueljosh-lang",
  linkedin: "https://www.linkedin.com/in/emmanuel-josh-57784427b/",
};

function TracePath() {
  // Vertical trace with a small stub + solder pad at each node.
  return (
    <svg
      viewBox="0 0 40 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, top: 0, width: 40, height: "100%" }}
    >
      <line
        x1="20"
        y1="0"
        x2="20"
        y2="100"
        stroke={TOKENS.copper}
        strokeWidth="2"
        opacity="0.55"
      />
    </svg>
  );
}

function Node({ item, index, total }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: 64,
        paddingBottom: index === total - 1 ? 0 : 48,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {index !== total - 1 && <TracePath />}

      {/* solder pad */}
      <div
        style={{
          position: "absolute",
          left: 20 - 9,
          top: 4,
          width: 18,
          height: 18,
          borderRadius: 4,
          background: hover ? TOKENS.phosphor : TOKENS.bg,
          border: `2px solid ${hover ? TOKENS.phosphor : TOKENS.copper}`,
          boxShadow: hover ? `0 0 14px ${TOKENS.phosphor}` : "none",
          transition: "all 180ms ease",
        }}
      />

      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          letterSpacing: 1,
          color: hover ? TOKENS.phosphor : TOKENS.copper,
          marginBottom: 6,
          transition: "color 180ms ease",
        }}
      >
        NODE·{item.id} — {item.period}
      </div>

      <div
        style={{
          background: TOKENS.panel,
          border: `1px solid ${TOKENS.panelBorder}`,
          borderLeft: `3px solid ${hover ? TOKENS.phosphor : TOKENS.copper}`,
          borderRadius: 6,
          padding: "18px 20px",
          transition: "border-color 180ms ease",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 19,
            color: TOKENS.text,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: TOKENS.textDim,
            marginTop: 2,
          }}
        >
          {item.dept ? `${item.org} · ${item.dept}` : item.org}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11.5,
            color: TOKENS.copperBright,
            marginTop: 10,
          }}
        >
          {item.meta}
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            color: TOKENS.textDim,
            marginTop: 10,
            marginBottom: 0,
          }}
        >
          {item.detail}
        </p>
      </div>
    </div>
  );
}

export default function EmbeddedSystemsPortfolio() {
  return (
    <div
      style={{
        minHeight: "100%",
        background: TOKENS.bg,
        color: TOKENS.text,
        padding: "56px 24px 72px",
      }}
    >
      <style>{FONT_IMPORTS}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Hero */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: TOKENS.copper,
            marginBottom: 10,
          }}
        >
          PORTFOLIO · REV. JAN 2026
        </div>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 44px)",
            lineHeight: 1.1,
            margin: 0,
            color: TOKENS.text,
          }}
        >
          Emmanuel Josh
          <br />
          Padagdag Dinsay
          <br />
          <span style={{ color: TOKENS.phosphor }}>Embedded Systems Engineer</span>
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            lineHeight: 1.6,
            color: TOKENS.textDim,
            maxWidth: 520,
            marginTop: 16,
          }}
        >
          Embedded systems-focused engineer with hands-on network and
          infrastructure experience from a hospital IT environment, backed
          by a work ethic built on fast-paced, high-throughput operations.
        </p>

        {/* Skills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
          {skills.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11.5,
                color: TOKENS.textDim,
                border: `1px solid ${TOKENS.panelBorder}`,
                borderRadius: 4,
                padding: "5px 10px",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: TOKENS.panelBorder,
            margin: "48px 0 40px",
          }}
        />

        {/* Experience timeline */}
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: 1.5,
            color: TOKENS.textDim,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Experience Trace
        </div>

        <div>
          {experience.map((item, i) => (
            <Node key={item.id} item={item} index={i} total={experience.length} />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11.5,
            color: TOKENS.textDim,
            lineHeight: 1.9,
          }}
        >
          {contact.phone} · {contact.email}
          <br />
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            style={{ color: TOKENS.textDim, textDecoration: "none" }}
          >
            {contact.github.replace("https://", "")}
          </a>
          {" · "}
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            style={{ color: TOKENS.textDim, textDecoration: "none" }}
          >
            {contact.linkedin.replace("https://", "")}
          </a>
        </div>
      </div>
    </div>
  );
}
