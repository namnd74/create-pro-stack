import { Button } from '@/components/ui/button';

interface StarterHomeProps {
  authHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function StarterHome({
  authHref = '/auth',
  secondaryHref = 'https://ui.shadcn.com/docs',
  secondaryLabel = 'View docs',
}: StarterHomeProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
          PS
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">create-pro-stack</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            A clean starter for modern React apps.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
            Start with official framework scaffolding, shadcn/ui, typed data options, and a simple
            auth-ready structure you can reshape quickly.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <a href={authHref}>Login</a>
          </Button>
          <Button asChild variant="outline">
            <a href={secondaryHref}>{secondaryLabel}</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
