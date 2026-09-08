// @ts-ignore: module may not have type declarations available in this environment
import { Outlet, Link } from "@remix-run/react";

export const Route = RootComponent;

function Header() {
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/programs", label: "Programs" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-bold text-primary">ELC</span>
          <span className="hidden font-heading text-sm font-semibold leading-tight text-foreground sm:inline">
            Excellent<br />Leaders
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-primary font-medium" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Join ELC
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-2xl font-bold">ELC</h3>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Raising leaders, transforming the world.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-primary-foreground/80">
              <li>+233 247 639 270</li>
              <li>excellentleadersc@gmail.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold">Follow Us</h4>
            <p className="mt-2 text-sm text-primary-foreground/80">@elc_global</p>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/10 pt-8 text-center text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Excellent Leaders Consortium. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}