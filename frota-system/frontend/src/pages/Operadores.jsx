import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const initialForm = { nome: '', cpf: '', telefone: '' }

export default function Operadores() {
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data: operadores = [], isLoading, error, refetch } = useQuery({
    queryKey: ['operadores'],
    queryFn: () => api.get('/operadores').then((r) => r.data),
  })

  const createOperador = useMutation({
    mutationFn: (dados) => api.post('/operadores', dados).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operadores'] })
      setModalOpen(false)
      setForm(initialForm)
    },
  })

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }) => api.put(`/operadores/${id}`, { ativo: !ativo }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operadores'] }),
  })

  if (isLoading) return <LoadingSpinner text="Carregando operadores..." />
  if (error) return <PageError message="Erro ao carregar operadores" onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Operadores</h1>
        {hasPermission('admin', 'gerente') && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Novo operador
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operadores.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Nenhum operador cadastrado</div>
        )}
        {operadores.map((op) => (
          <div key={op.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users size={18} className="text-blue-900" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{op.nome}</p>
                <Badge value={op.ativo ? 'ativo' : 'inativo'}>
                  {op.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            {op.cpf && <p className="text-sm text-gray-500">CPF: {op.cpf}</p>}
            {op.telefone && <p className="text-sm text-gray-500">Tel: {op.telefone}</p>}
            {hasPermission('admin', 'gerente') && (
              <button
                onClick={() => toggleAtivo.mutate({ id: op.id, ativo: op.ativo })}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                {op.ativo ? 'Desativar' : 'Ativar'}
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Operador">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await createOperador.mutateAsync(form)
            } catch (err) {
              alert(err.response?.data?.detail || 'Erro ao criar operador')
            }
          }}
          className="space-y-4"
        >
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
          <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(61) 99999-9999" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createOperador.isPending}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
