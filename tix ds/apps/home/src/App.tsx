import { PROJECTS, type Project } from "./projects.js";

/** Figma stamps these as "4 Aug 2026 23:59"; en-GB agrees apart from the comma. */
const UPDATED = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * On the deployed site every prototype is a folder of this same build. Under `pnpm dev`
 * each one is its own Vite server instead, so the card has to leave the origin to reach
 * it — and will only resolve if that server is running.
 */
function hrefFor(project: Project): string {
  return import.meta.env.DEV
    ? `http://localhost:${project.devPort}/`
    : `${import.meta.env.BASE_URL}${project.path}/`;
}

function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function App() {
  return (
    <div className="home">
      <div className="home__column">
        <header className="home__identity">
          {/* Avatar goes here once there's a photo: <img className="home__avatar" src={asset("avatar.jpg")} alt="" width={48} height={48} /> */}
          <h1 className="home__name">
            Tysha’s tiket project
            <br />
            code design prototype
          </h1>
        </header>

        <ul className="home__list">
          {PROJECTS.map((project) => {
            const updated = __PROJECT_UPDATED__[project.id];

            return (
              <li key={project.id}>
                <a className="card" href={hrefFor(project)}>
                  <span className="card__thumb">
                    {project.thumbnail ? (
                      <img src={asset(project.thumbnail)} alt="" loading="lazy" />
                    ) : null}
                  </span>

                  <span className="card__body">
                    <span className="card__title">{project.title}</span>
                    <span className="card__description">{project.description}</span>
                  </span>

                  {updated ? (
                    <time className="card__updated" dateTime={updated}>
                      Latest update {UPDATED.format(new Date(updated)).replace(",", "")}
                    </time>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
