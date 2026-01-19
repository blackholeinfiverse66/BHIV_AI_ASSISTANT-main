import { Routes, Route } from 'react-router-dom'
// import { AuthProvider } from './app/auth/AuthProvider'
// import { AppLayout } from './app/layout/AppLayout'
// import { LoginPage } from './pages/LoginPage' // Commented out unused import
import { ChatPage } from './pages/ChatPage'
// import { TasksPage } from './pages/TasksPage'
// import { TaskDetailPage } from './pages/TaskDetailPage'
// import { NluPage } from './pages/NluPage'
// import { EmbeddingsPage } from './pages/EmbeddingsPage'
// import { VoicePage } from './pages/VoicePage'
// import { DecisionHubPage } from './pages/DecisionHubPage'
// import { ExternalPage } from './pages/ExternalPage'
// import { SettingsPage } from './pages/SettingsPage'
// import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      {/* <Route path="/home" element={<Navigate to="/" replace />} /> */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  )
}
