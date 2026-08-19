'use client';

import { useEffect, useState } from 'react';
import { Layers2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StarterHomeProps {
  authHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function StarterHome({
  authHref = '/auth',
  secondaryHref = 'https://ui.shadcn.com/docs',
  secondaryLabel = 'Read the docs',
}: StarterHomeProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem('theme', nextTheme);
  };

  return (
    <main className="min-h-dvh bg-page-gradient px-6 py-6 text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex min-h-14 items-center justify-between gap-4 rounded-full border border-border/70 bg-card/65 px-4 shadow-sm backdrop-blur">
          <a href="/" className="inline-flex items-center gap-3 text-foreground">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
              <Layers2 className="size-4" aria-hidden="true" />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-normal sm:text-base">
                Create Pro Stack
              </span>
              <span className="hidden rounded-full border border-border bg-background/70 px-2 py-0.5 text-[0.625rem] font-medium uppercase leading-none text-muted-foreground sm:inline-flex">
                CLI
              </span>
            </span>
          </a>
          <nav aria-label="Primary" className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button asChild>
              <a href={authHref}>Login</a>
            </Button>
          </nav>
        </header>

        <section className="flex flex-1 items-center justify-center py-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 text-center">
            <div className="inline-flex rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground shadow-sm backdrop-blur">
              Next.js or Vite. shadcn/ui. Typed data stacks.
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
                Start sharp. Stay flexible.
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A clean React starter with official scaffolding, polished defaults, and just enough
                structure to build the product your way.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <a href={authHref}>Open auth</a>
              </Button>
              <Button asChild variant="outline">
                <a href={secondaryHref}>{secondaryLabel}</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
