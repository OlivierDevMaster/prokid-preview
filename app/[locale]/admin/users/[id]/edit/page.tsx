import { redirect } from 'next/navigation';

export default function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin/users/${params.id}`);
}
