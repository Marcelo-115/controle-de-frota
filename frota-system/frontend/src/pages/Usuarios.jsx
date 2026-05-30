import { useState } from 'react'
import { Plus, UserCog } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const initialForm = { nome: '', email: '', senha: '', perfil: 'mecanico', ativo: true }

const perfilLabels = {
  admin: 'Administrador',
  mecanico: 'Mecânico',
  gerente: 'Gerente',
  diretoria: 'Diretoria',
}

export default function Usuarios() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data: usuarios = [], isLoading, error, refetch } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios').then((r) => r.data),
  })

  const createUsuario = useMutation({
    mutationFn: (dados) => api.post('/usuarios', dados).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setModalOpen(false)
      setForm(initialForm)
    },
  })

  const toggleAtivo = useMutation({
    mutationFn: (id) => api.patch(`/usuarios/${id}/toggle-ativo`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createUsuario.mutateAsync(form)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao criar usuário')
    }
  }

  if (isLoading) return <LoadingSpinner text="Carregando usuários..." />
  if (error) return <PageError message="Erro ao carregar usuários" onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo usuário
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Usuário', 'Email', 'Perfil', 'Status', 'Ações'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-medium">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge value={u.perfil}>{perfilLabels[u.perfil]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge value={u.ativo ? 'ativo' : 'inativo'}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAtivo.mutate(u.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhum usuário encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Usuário" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Senha *" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required placeholder="Mínimo 6 caracteres" />
          <Select label="Perfil *" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
            <option value="mecanico">Mecânico</option>
            <option value="gerente">Gerente</option>
            <option value="diretoria">Diretoria</option>
            <option value="admin">Administrador</option>
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createUsuario.isPending}>Criar usuário</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
