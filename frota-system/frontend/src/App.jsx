import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Maquinas from './pages/Maquinas'
import MaquinaDetalhe from './pages/MaquinaDetalhe'
import Abastecimentos from './pages/Abastecimentos'
import Manutencoes from './pages/Manutencoes'
import Operadores from './pages/Operadores'
import Relatorios from './pages/Relatorios'
import Usuarios from './pages/Usuarios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/maquinas" element={<Maquinas />} />
              <Route path="/maquinas/:id" element={<MaquinaDetalhe />} />
              <Route path="/abastecimentos" element={<Abastecimentos />} />
              <Route path="/manutencoes" element={<Manutencoes />} />
              <Route path="/operadores" element={<Operadores />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
