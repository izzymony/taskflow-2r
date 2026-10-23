import { AutomationsPage } from '@/components/pages/automations-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <AutomationsPage preview={parsePreviewState(params.state)} />;
}
