import { SchedulePage } from '@/components/pages/schedule-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <SchedulePage preview={parsePreviewState(params.state)} />;
}
