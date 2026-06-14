import AuthLogo from "./AuthLogo.jsx";
import OrganizerNav from "@/components/organizer/shell/OrganizerNav.jsx";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-r-bg px-6 py-10 text-r-text sm:px-[50px] sm:py-[50px]">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col items-center gap-[100px]">
        <OrganizerNav backHref="/" />

        <section className="flex w-full max-w-[434px] flex-col items-center">
          <div className="flex w-full flex-col items-center gap-5 text-center">
            <AuthLogo />
            <div className="flex w-full flex-col items-center gap-5">
              <h1 className="font-[family-name:var(--font-boska)] text-h1 font-bold text-r-text">
                {title}
              </h1>
              <p className="text-body text-r-secondary">{subtitle}</p>
            </div>
          </div>

          <div className="mt-[70px] w-full">{children}</div>

          {footer ? (
            <div className="mt-7 text-center text-body text-r-text">{footer}</div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
