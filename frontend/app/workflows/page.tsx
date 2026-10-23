import { WorkflowsPage } from '@/components/pages/workflows-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <WorkflowsPage preview={parsePreviewState(params.state)} />;
}
