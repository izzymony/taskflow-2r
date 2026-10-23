import { FilesPage } from '@/components/pages/files-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <FilesPage preview={parsePreviewState(params.state)} />;
}
