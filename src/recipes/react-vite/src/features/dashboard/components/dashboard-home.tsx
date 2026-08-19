export function DashboardHome() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-page-gradient px-6 py-16 text-foreground">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-normal">Your app workspace is ready.</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Replace this page with your product workflow, data views, and authenticated application
          screens.
        </p>
      </section>
    </main>
  );
}
