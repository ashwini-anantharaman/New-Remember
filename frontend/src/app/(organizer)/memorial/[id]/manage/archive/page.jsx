import { redirect } from "next/navigation";

export default function MemorialArchivePage({ params }) {
  redirect(`/memorial/${params.id}/manage`);
}
