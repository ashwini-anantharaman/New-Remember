import MemorialCreateForm from "@/components/memorial/MemorialCreateForm.jsx";
import OrganizerShell from "@/components/organizer/shell/OrganizerShell.jsx";
import OrganizerPageHeader from "@/components/organizer/shell/OrganizerPageHeader.jsx";

export default function MemorialCreatePage() {
  return (
    <OrganizerShell backHref="/dashboard" contentClassName="items-center gap-[100px]">
      <OrganizerPageHeader
        title="Create a memorial"
        subtitle="Share essential details of your loved one's life."
      />

      <section className="flex w-full max-w-[886px] flex-col items-center">
        <MemorialCreateForm />
      </section>
    </OrganizerShell>
  );
}
