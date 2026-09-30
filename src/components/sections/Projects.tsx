import { projects } from "@/data";
import ProjectCard from "@/components/ui/ProjectCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Projects.
 *
 * A server section over client cards: the heading, the lede and the counts are
 * static markup, and only the cards themselves ship JavaScript — for the tilt,
 * the disclosure and the reveal.
 */
export default function Projects() {
  const live = projects.filter((project) => project.status === "Live").length;

  return (
    <section id="projects" aria-labelledby="projects-title" className="section">
      <div className="shell">
        <SectionHeader
          id="projects-title"
          index="03"
          eyebrow="Projects"
          title="Things that"
          highlight="were built"
          lede="Each card opens onto the log: what it was for, how the signal moved, and what came out of it. Versions that did not work are usually the more interesting half."
          aside={
            <dl className="flex gap-6">
              <div>
                <dt className="label">Total</dt>
                <dd className="index mt-1 text-xl text-ink">{projects.length}</dd>
              </div>
              <div>
                <dt className="label">Shipped</dt>
                <dd className="index mt-1 text-xl text-accent">{live}</dd>
              </div>
            </dl>
          }
        />

        <Reveal className="mt-12">
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
