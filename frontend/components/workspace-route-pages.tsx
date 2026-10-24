import {
  ChatPage,
  WorkspacePage,
} from '@/components/workspace-pages'

export function OverviewPage() { return <WorkspacePage type="/" /> }
export function WorkflowsPage() { return <WorkspacePage type="/workflows" /> }
export function AutomationsPage() { return <WorkspacePage type="/automations" /> }
export function SchedulePage() { return <WorkspacePage type="/schedule" /> }
export function ClientsPage() { return <WorkspacePage type="/clients" /> }
export function UsersManagementPage() { return <WorkspacePage type="/users-management" /> }
export function PaymentsPage() { return <WorkspacePage type="/payments" /> }
export function FilesPage() { return <WorkspacePage type="/files" /> }
export function DocsPage() { return <WorkspacePage type="/docs" /> }
export function SettingsPage() { return <WorkspacePage type="/" /> }
export { ChatPage }
