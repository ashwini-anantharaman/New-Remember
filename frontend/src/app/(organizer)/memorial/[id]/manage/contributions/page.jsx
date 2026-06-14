import { redirect } from "next/navigation";

export default function MemorialContributionsPage({ params }) {
  redirect(`/memorial/${params.id}/manage`);
}
