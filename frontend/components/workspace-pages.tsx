'use client';

import React from 'react';
import ChatPage from './pages/chat-page';
import OverviewPage from './pages/overview-page';
import WorkflowsPage from './pages/workflows-page';
import AutomationsPage from './pages/automations-page';
import SchedulePage from './pages/schedule-page';
import ClientsPage from './pages/clients-page';
import UsersManagementPage from './pages/users-management-page';
import PaymentsPage from './pages/payments-page';
import FilesPage from './pages/files-page';
import DocsPage from './pages/docs-page';
import SettingsPage from './pages/settings-page';

type PageType =
  | '/'
  | '/workflows'
  | '/automations'
  | '/schedule'
  | '/clients'
  | '/users-management'
  | '/payments'
  | '/files'
  | '/docs'
  | '/settings';

const PAGES: Record<PageType, (props?: Record<string, unknown>) => React.ReactElement> = {
  '/': (props) => <OverviewPage {...(props ?? {})} />,
  '/workflows': (props) => <WorkflowsPage {...(props ?? {})} />,
  '/automations': (props) => <AutomationsPage {...(props ?? {})} />,
  '/schedule': (props) => <SchedulePage {...(props ?? {})} />,
  '/clients': (props) => <ClientsPage {...(props ?? {})} />,
  '/users-management': (props) => <UsersManagementPage {...(props ?? {})} />,
  '/payments': (props) => <PaymentsPage {...(props ?? {})} />,
  '/files': (props) => <FilesPage {...(props ?? {})} />,
  '/docs': (props) => <DocsPage {...(props ?? {})} />,
  '/settings': (props) => <SettingsPage {...(props ?? {})} />,
};

export function WorkspacePage({ type }: { type: PageType }) {
  const Page = PAGES[type] ?? PAGES['/'];
  return <Page />;
}

export { ChatPage };
