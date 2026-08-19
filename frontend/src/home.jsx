import React from 'react';
import { Link } from 'react-router-dom';
import { Languages, Gauge, FolderKanban, ArrowRight } from 'lucide-react';
import { useAuth } from './context/auth-context';

const FEATURES = [
  {
    Icon: Languages,
    title: 'AI-assisted translation',
    body: 'Translate a whole project of .srt files into your target language in one pass, then refine the wording by hand.',
  },
  {
    Icon: Gauge,
    title: 'Reading speed you can see',
    body: 'Every subtitle line shows its characters-per-second, colour-coded, so you catch unreadable lines before delivery.',
  },
  {
    Icon: FolderKanban,
    title: 'Organised by project',
    body: 'Group source files and every translated variant under one project. Originals are never overwritten.',
  },
];

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="ambient grid-texture relative isolate overflow-hidden px-6 pt-36 pb-28 sm:pt-44 sm:pb-36">
        {/* Smoke texture, kept subtle and purely decorative — the ambient
            gradient carries the look on its own if this fails to load. */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/bg.avif')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-ink/60 to-ink"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Subtitle tooling for dubbing studios
          </span>

          <h1 className="animate-fade-up stagger-1 mt-7 text-[2.75rem] leading-[1.05] font-extrabold tracking-tight text-white sm:text-7xl">
            Your vision,
            <br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-br from-brand-soft via-brand to-brand-deep bg-clip-text text-transparent">
              amplified
            </span>
          </h1>

          <p className="animate-fade-up stagger-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Upload your <span className="font-mono text-neutral-200">.srt</span> files, translate
            them with AI, and fine-tune every line in an editor built for subtitle timing — not a
            plain text box.
          </p>

          <div className="animate-fade-up stagger-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={currentUser ? '/dashboard' : '/signup'}
              className="glow-brand group inline-flex w-full items-center justify-center gap-2 rounded-full
                         bg-brand px-7 py-3.5 text-sm font-bold text-black transition-all
                         hover:bg-brand-soft sm:w-auto"
            >
              {currentUser ? 'Go to dashboard' : 'Get started free'}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            {!currentUser && (
              <Link
                to="/signin"
                className="inline-flex w-full items-center justify-center rounded-full border border-line
                           bg-surface/70 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur
                           transition-colors hover:border-white/20 hover:bg-surface-2 sm:w-auto"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="surface-lit rounded-2xl border border-line bg-surface p-6
                         transition-colors hover:border-white/15"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                <Icon size={19} />
              </span>
              <h2 className="mt-5 text-base font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
