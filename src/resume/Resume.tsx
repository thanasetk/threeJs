import { Background3D } from "./Background3D";
import { education, experience, languages, profile, skillGroups } from "./data";

const photo = `${import.meta.env.BASE_URL}photo.jpg`;

// Placeholders only — the real phone, address and birthday are not shipped.
const hidden = [
  { label: "Phone", value: "0●●-●●●-●●●●" },
  { label: "Address", value: "●●/●●● ●●●●●● ●●●●● ●●, ●●●●● ●●●●●●, Bangkok ●●●●●" },
  { label: "Birthday", value: "●●● ●●, 19●●" },
];

export function Resume() {
  return (
    <>
      <Background3D />
      <main className="page">
        <header className="hero">
          <img className="avatar" src={photo} alt={`${profile.name.join(" ")}`} width={160} height={160} />
          <p className="eyebrow">{profile.title}</p>
          <h1>
            {profile.name[0]}
            <br />
            <span>{profile.name[1]}</span>
          </h1>
          <p className="lede">{profile.summary}</p>
          <div className="actions">
            <a className="btn primary" href={`mailto:${profile.email}`}>{profile.email}</a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <p className="meta">{profile.location}</p>
          <a className="scroll-hint" href="#experience" aria-label="Scroll to experience">
            <span />
          </a>
        </header>

        <section id="experience" className="panel">
          <h2>Experience</h2>
          <ol className="timeline">
            {experience.map((job) => (
              <li key={`${job.role}-${job.period}`}>
                <div className="job-head">
                  <h3>{job.role}</h3>
                  <span className="period">{job.period}</span>
                </div>
                <p className="company">{job.company}</p>
                <p>{job.summary}</p>
                {job.points.length > 0 && (
                  <ul className="points">
                    {job.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                )}
                {job.environment && (
                  <p className="env"><strong>Environment:</strong> {job.environment}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h2>Skills</h2>
          <div className="skill-grid">
            {skillGroups.map((g) => (
              <div key={g.label} className="skill-group">
                <h3>{g.label}</h3>
                <ul className="chips">
                  {g.items.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="two-col">
          <section className="panel">
            <h2>Education</h2>
            <h3>{education.degree}</h3>
            <p className="company">{education.school}</p>
            <p className="period">{education.period}</p>
          </section>
          <section className="panel">
            <h2>Languages</h2>
            <ul className="plain">
              {languages.map((l) => (
                <li key={l.name}><strong>{l.name}</strong> — {l.level}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="panel contact">
          <h2>Contact</h2>
          <dl>
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd>
            </div>
            {hidden.map((h) => (
              <div key={h.label}>
                <dt>{h.label}</dt>
                <dd className="blurred" aria-label={`${h.label} available on request`}>{h.value}</dd>
              </div>
            ))}
          </dl>
          <p className="note">Phone, address and date of birth are available on request by email.</p>
        </section>

        <footer className="foot">© {new Date().getFullYear()} {profile.name.join(" ")} · Built with React + Three.js</footer>
      </main>
    </>
  );
}
