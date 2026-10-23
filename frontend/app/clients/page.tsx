import { ClientsPage } from '@/components/pages/clients-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <ClientsPage preview={parsePreviewState(params.state)} />;
}
