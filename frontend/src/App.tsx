import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './app/auth/AuthProvider'
import { AppLayout } from './app/layout/AppLayout'
import { RequireAuth } from './app/auth/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ChatPage } from './pages/ChatPage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { NluPage } from './pages/NluPage'
import { EmbeddingsPage } from './pages/EmbeddingsPage'
import { VoicePage } from './pages/VoicePage'
import { DecisionHubPage } from './pages/DecisionHubPage'
import { ExternalPage } from './pages/ExternalPage'
import { OrchestratorPage } from './pages/OrchestratorPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="nlu" element={<NluPage />} />
          <Route path="embeddings" element={<EmbeddingsPage />} />
          <Route path="voice" element={<VoicePage />} />
          <Route path="decision" element={<DecisionHubPage />} />
          <Route path="external" element={<ExternalPage />} />
          <Route path="orchestrator" element={<OrchestratorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
