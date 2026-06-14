import Image from "next/image";
import Link from "next/link";
import OrganizerButton from "@/components/organizer/shell/OrganizerButton.jsx";

const features = [
  {
    title: "Gather Memories",
    body: "Invite family and friends to contribute photos, videos, audio recordings, and written memories.",
  },
  {
    title: "Curate Together",
    body: "Review and organize contributions from everyone who knew them. Build a complete picture of their life.",
  },
  {
    title: "Private & Safe",
    body: "Your memorial is private and invitation-only. AI helps flag any inappropriate content.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-r-bg px-6 py-10 text-r-text sm:px-[50px]">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col items-center gap-[100px]">
        <nav className="flex h-10 w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-5">
            <Image src="/brand/remember-logo.png" alt="" width={34} height={36} className="h-9 w-[34px] object-contain" unoptimized />
            <span className="font-[family-name:var(--font-boska)] text-2xl font-medium text-r-text">Remember</span>
          </Link>
          <Link href="/login" className="text-body-2 text-r-text transition-opacity hover:opacity-70">
            Log In / Sign Up
          </Link>
        </nav>

        <section className="flex w-full flex-col items-center text-center">
          <div className="relative size-[200px] sm:size-[248px]">
            <Image
              src="/brand/remember-logo.png"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="mt-[50px] flex w-full max-w-[768px] flex-col items-center gap-5">
            <h1 className="font-[family-name:var(--font-boska)] text-h1 text-r-text">
              Preserve Their Legacy Together
            </h1>
            <p className="max-w-[768px] text-body text-r-secondary">
              Create a private, dignified space where family and friends can share memories of your loved one.
            </p>
          </div>

          <OrganizerButton href="/signup" className="mt-[50px]">
            Create a memorial
          </OrganizerButton>
        </section>

        <section className="grid w-full max-w-[1056px] grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[20px] border border-r-muted bg-r-modal/40 p-8 text-left">
              <h2 className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{feature.title}</h2>
              <p className="mt-3 text-body-2 text-r-secondary">{feature.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
