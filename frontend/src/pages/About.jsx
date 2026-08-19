import React from 'react';

const About = () => (
  <div className="min-h-screen px-6 pt-32 pb-24">
    <div className="animate-fade-up mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        About Fraemi Vision
      </h1>

      <div className="mt-6 space-y-5 text-base leading-relaxed text-muted">
        <p>
          Fraemi SRT Translator is a workspace for dubbing studios that need to move subtitle
          files between languages without losing timing discipline.
        </p>
        <p>
          Upload your source <span className="font-mono text-neutral-200">.srt</span> files,
          group them into projects, and translate them individually or in bulk. Every translated
          line is shown alongside its characters-per-second reading speed, so lines that are too
          fast to read get caught before delivery rather than after.
        </p>
        <p>
          Originals are never overwritten — each translation is stored as a separate version you
          can edit and download independently.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Built by</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Students from the Panimalar Engineering College IT Department, for{' '}
          <a
            href="https://fraemivision.in"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand transition-colors hover:text-brand-soft"
          >
            Fraemi Vision
          </a>
          .
        </p>
      </div>
    </div>
  </div>
);

export default About;
