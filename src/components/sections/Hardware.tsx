import { hardwareComponents } from "@/data";
import HardwareBench from "@/components/ui/HardwareBench";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * "Beyond the screen".
 *
 * The parts that never appear in a screenshot: the boards, the sensors and the
 * actuators, each one selectable and each one saying what it is actually good
 * for — including the gotchas, which are the reason the list is worth reading.
 */
export default function Hardware() {
  const categories = new Set(hardwareComponents.map((component) => component.category));

  return (
    <section id="hardware" aria-labelledby="hardware-title" className="section">
      <div className="shell">
        <SectionHeader
          id="hardware-title"
          index="04"
          eyebrow="Beyond the screen"
          title="The parts"
          highlight="on the bench"
          lede="Hardware work doesn't screenshot well, so here it is as a board instead. Tap any part for what it does and where it usually goes wrong."
          aside={
            <dl className="flex gap-6">
              <div>
                <dt className="label">Parts</dt>
                <dd className="index mt-1 text-xl text-ink">{hardwareComponents.length}</dd>
              </div>
              <div>
                <dt className="label">Groups</dt>
                <dd className="index mt-1 text-xl text-accent">{categories.size}</dd>
              </div>
            </dl>
          }
        />

        <Reveal className="mt-12">
          <HardwareBench />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-dim">
            Everything listed here is something that has been wired up, powered
            and debugged rather than something that has been read about. Where a
            part has a catch worth knowing — a threshold that has to be tuned, a
            reading that drifts, a jumper one row off — it is on the card.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
