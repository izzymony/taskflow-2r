import { PaymentsPage } from '@/components/pages/payments-page';
import { parsePreviewState } from '@/lib/preview';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <PaymentsPage preview={parsePreviewState(params.state)} />;
}
