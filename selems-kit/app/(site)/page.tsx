import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";

// Phase 0 token test page. Replaced by the real Home page in Stage 3.
export const metadata = { robots: { index: false, follow: false } };

const swatches = [
  ["ink", "bg-ink"],
  ["ink-2", "bg-ink-2"],
  ["slate", "bg-slate"],
  ["stone", "bg-stone"],
  ["paper", "bg-paper"],
  ["mist", "bg-mist"],
  ["line", "bg-line"],
  ["muted", "bg-muted"],
  ["body", "bg-body"],
  ["amber", "bg-amber"],
  ["amber-dark", "bg-amber-dark"],
  ["amber-soft", "bg-amber-soft"],
  ["amber-tint", "bg-amber-tint"],
  ["velvet", "bg-velvet"],
] as const;

export default function TokenTestPage() {
  return (
    <main className="container-site py-16">
      <p className="eyebrow">Ijapo Extension · Akure, Ondo State</p>
      <h1 className="font-display text-hero mt-4">
        A hotel and suites in Akure, kept to an international standard.
      </h1>
      <p className="lede mt-6">
        Token test page. Rooms from {formatNaira(3_500_000)} a night.
      </p>

      <section aria-labelledby="buttons" className="mt-12">
        <h2 id="buttons" className="font-display text-section">
          Buttons
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="amber" size="cta">
            Book a room
          </Button>
          <Button variant="line" size="cta">
            See rooms &amp; prices
          </Button>
          <Button variant="amber" size="cta-sm">
            Book
          </Button>
          <Button variant="line" size="cta-sm">
            Details
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 bg-ink p-6">
          <Button variant="amber" size="cta">
            Check availability
          </Button>
          <Button variant="light" size="cta">
            See rooms &amp; prices
          </Button>
        </div>
      </section>

      <section aria-labelledby="colours" className="mt-12">
        <h2 id="colours" className="font-display text-section">
          Colours
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map(([name, cls]) => (
            <li key={name} className="text-sm">
              <span className={`block h-16 border border-line ${cls}`} />
              <span className="mt-2 block text-muted">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="mt-12 bg-paper p-8">
        <h2 id="type" className="font-display text-section">
          Type
        </h2>
        <p className="font-display text-card-title mt-4">VIP Suite</p>
        <p className="mt-2 font-semibold tabular-nums">{formatNaira(7_000_000)} / night</p>
        <span className="mt-4 inline-block bg-amber-soft px-2 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-amber-dark">
          Suite
        </span>
      </section>
    </main>
  );
}
