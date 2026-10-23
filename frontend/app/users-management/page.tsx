import { UsersManagementPage } from '@/components/pages/users-management-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <UsersManagementPage preview={parsePreviewState(params.state)} />;
}
