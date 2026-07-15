import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-fd-muted-foreground">
        NOREXUS Documentation
      </p>
      <h1 className="mb-5 text-4xl font-semibold tracking-tight md:text-6xl">
        CLI, Auth, and ID docs for NOREXUS.
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-balance text-fd-muted-foreground md:text-lg">
        A plain Fumadocs site for the terminal-first CLI and identity services.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-md border bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
        >
          Open docs
        </Link>
        <Link
          href="/docs/cli"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          CLI
        </Link>
      </div>
    </div>
  );
}
