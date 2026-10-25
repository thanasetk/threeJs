// Content from Thanaset-Kundilokvanich-Resume.pdf (Oct 2026).
// Phone, address and date of birth are deliberately not in this file: the site is
// public, so the page shows masked placeholders instead of the real values.

export const profile = {
  name: ["Thanaset", "Kundilokvanich"],
  title: "Full Stack Developer",
  summary:
    "Developer with 7+ years building enterprise web apps on Java/Spring and JavaScript, from low-code platform modules to Toyota Daihatsu planning systems — now speeding up delivery with agentic coding.",
  email: "thanasetk01@gmail.com",
  location: "Bangkok, Thailand",
  github: "https://github.com/thanasetk",
};

export type Job = {
  role: string;
  company: string;
  period: string;
  summary: string;
  points: string[];
  environment?: string;
};

export const experience: Job[] = [
  {
    role: "Sr. Developer",
    company: "Avalant Co., Ltd. (Permanent)",
    period: "Aug 2024 – Present",
    summary: "Building modules on a low-code platform (AngularJS, Node.js, SQL); supporting the live product.",
    points: [
      "Build modules from Figma designs",
      "Gather CR requirements and analyze user needs",
      "Support daily issues on the live product",
      "Built custom Claude Code skills and worktree workflows across 5+ repos to speed up delivery",
    ],
    environment:
      "Java, J2EE, Spring Boot, Hibernate, PostgreSQL, Oracle, JavaScript, JSON, AngularJS 1.x, JDK 1.8, CSS/Bootstrap, Node.js, Docker",
  },
  {
    role: "Developer",
    company: "TP Consulting Co., Ltd. (Contract, assigned to DXC Technologies)",
    period: "Jul 2022 – Jul 2024",
    summary: "Built a marketing and engineering planning module for Toyota Daihatsu, on Java Spring Boot and Oracle.",
    points: [
      "Wrote DR docs and built to spec",
      "Built and maintained web apps — HTML, CSS, JavaScript, Fomantic UI",
      "Designed REST APIs for client–server integration",
      "Integrated third-party libraries",
      "Refactored and optimized the codebase",
      "Maintained DB tables, procedures, functions",
      "Modernized legacy pages",
      "Wrote PU docs and automated tests",
      "Built reports with JasperSoft",
      "Deployed to the dev environment",
      "Reviewed code, debugged, managed Git",
      "Ran Agile ceremonies",
    ],
    environment:
      "Java, Spring Boot, MyBatis, Oracle, JavaScript, JDK 1.8, Fomantic UI, Robot Framework, Mockito, JBoss Server, Linux command line",
  },
  {
    role: "Developer",
    company: "Avalant Co., Ltd. (Permanent)",
    period: "Apr 2019 – Jul 2022",
    summary: "Built modules and web pages on OneWeb; supported users end to end.",
    points: [
      "Built web pages and modules on OneWeb",
      "Built microservices with MicroFlow",
      "Created reports with JasperSoft",
      "Solved user problems, fixed bugs, restructured schemas",
      "Tuned database queries for speed",
      "Deployed and supported Dev, UAT, Production",
      "Mentored junior developers",
    ],
    environment: "Java, J2EE, Spring, Hibernate, PostgreSQL, JavaScript, AngularJS 1.x, JDK 1.8, CSS/Bootstrap",
  },
  {
    role: "Intern Developer",
    company: "Avalant Co., Ltd.",
    period: "Dec 2018 – Apr 2019",
    summary: "Trained under senior developers; built and tested software to client requirements.",
    points: [],
  },
];

export const skillGroups: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Java", "TypeScript", "JavaScript", "SQL", "Python"] },
  { label: "Backend", items: ["Spring Boot", "Spring Security", "Hibernate", "MyBatis", "JPA"] },
  { label: "Frontend", items: ["React 18", "AngularJS 1.x", "Node.js"] },
  { label: "Platform", items: ["Docker", "Kubernetes", "Redis", "Keycloak/OAuth2"] },
  { label: "AI-assisted dev", items: ["Claude Code", "ChatGPT", "Gemini", "Custom Claude Code skills", "Git worktree workflows"] },
  { label: "Tools", items: ["Git", "GitLab", "Maven", "Eclipse", "JasperSoft"] },
  { label: "Database", items: ["Oracle", "PostgreSQL", "Redis"] },
  { label: "DevOps / Infra", items: ["Docker Compose", "Linux/SSH ops", "Nginx/Apache"] },
  { label: "Methodology", items: ["Agile", "Scrum", "Multi-tenant product customization", "Release/rollback discipline"] },
];

// Skills that orbit the 3D core. `detail` shows in a tooltip on hover/tap.
export type OrbitSkill = { name: string; detail: string };
export const orbitSkills: OrbitSkill[] = [
  { name: "Java", detail: "7+ yrs · Spring, enterprise apps" },
  { name: "Spring Boot", detail: "4+ yrs · REST APIs & services" },
  { name: "React", detail: "React 18 · this site" },
  { name: "TypeScript", detail: "Personal projects" },
  { name: "Docker", detail: "Compose · build & deploy" },
  { name: "Kubernetes", detail: "Container orchestration" },
  { name: "PostgreSQL", detail: "5+ yrs · schema & tuning" },
  { name: "Oracle", detail: "Toyota Daihatsu systems" },
  { name: "Redis", detail: "Caching & sessions" },
  { name: "AngularJS", detail: "Low-code platform modules" },
  { name: "Node.js", detail: "Services & tooling" },
  { name: "Claude Code", detail: "Custom skills · agentic dev" },
];

// Plain word list kept for any caller that only needs the labels.
export const orbitWords = orbitSkills.map((s) => s.name);

export const education = {
  degree: "Bachelor of Science in Computer Science",
  school: "Naresuan University",
  period: "Jul 2015 – Apr 2019",
};

export const languages = [
  { name: "Thai", level: "Native" },
  { name: "English", level: "Intermediate (Cambridge English Placement Test)" },
];
