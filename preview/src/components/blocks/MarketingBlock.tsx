import { ArrowRight, Zap, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning fast",
    desc: "Built on Vite and optimized for production. Zero unnecessary re-renders and tree-shaking by default.",
  },
  {
    icon: Shield,
    title: "Accessible by default",
    desc: "Every component ships with ARIA attributes, keyboard navigation, and screen-reader support out of the box.",
  },
  {
    icon: Layers,
    title: "Fully composable",
    desc: "Mix, match, and extend. Each primitive is headless at heart — bring your own styles or use ours.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The theme system is exactly what I needed. Switching from Fluent to a dark minimal aesthetic took less than 30 seconds.",
    author: "Alex Kim",
    role: "Senior Frontend Engineer, Vercel",
    initials: "AK",
  },
  {
    quote: "Finally a component library that doesn't fight you when you want to change the radius or tweak the color palette.",
    author: "Sam Rivera",
    role: "Design Systems Lead, Linear",
    initials: "SR",
  },
];

export function MarketingBlock() {
  return (
    <div className="min-h-full overflow-y-auto">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          Now in public beta
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Components that adapt<br />to your brand
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A theme-first component library built on shadcn/ui, Tailwind v4, and Radix primitives.
          Switch between design systems without touching a single component.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            View on GitHub
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">
            Everything you need
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Opinionated defaults with escape hatches everywhere. Ship fast, customize later.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} interactive className="border bg-card">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-1">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          Loved by developers
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.author} className="bg-card">
              <CardContent className="pt-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground mb-4">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 JustThemeSwitcher. MIT license.</p>
          <div className="flex gap-5">
            {["Docs", "GitHub", "Changelog", "Privacy"].map((link) => (
              <button key={link} className="hover:text-foreground transition-colors cursor-pointer">
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
