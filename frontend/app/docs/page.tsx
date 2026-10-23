import { DocsPage } from '@/components/pages/docs-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <DocsPage preview={parsePreviewState(params.state)} />;
}
