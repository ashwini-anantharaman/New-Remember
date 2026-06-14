import { redirect } from "next/navigation";

export default function MemorialOutputsIndexPage({ params }) {
  redirect(`/memorial/${params.id}/manage`);
}
