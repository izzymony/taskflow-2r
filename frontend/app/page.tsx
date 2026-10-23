import { OverviewPage } from '@/components/pages/overview-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <OverviewPage preview={parsePreviewState(params.state)} />;
}
