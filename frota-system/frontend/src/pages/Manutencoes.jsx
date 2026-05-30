import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMaquinas } from '../hooks/useMaquinas'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Button from '../components/ui/Button'
import Input, { Select, Textarea } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const initialForm = {
  maquina_id: '', tipo: 'preventiva', descricao: '', horimetro_na_manutencao: '',
  data_prevista: '', data_realizada: '', custo: '', pecas_substituidas: '', status: 'pendente',
}

export default function Manutencoes() {
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroMaquina, setFiltroMaquina] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const params = {}
  if (filtroStatus) params.status = filtroStatus
  if (filtroMaquina) params.maquina_id = filtroMaquina

  const { data: manutencoes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['manutencoes', params],
    queryFn: () => api.get('/manutencoes', { params }).then((r) => r.data),
  })
  const { data: maquinas = [] } = useMaquinas()

  const createManutencao = useMutation({
    mutationFn: (dados) => api.post('/manutencoes', dados).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manutencoes'] }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/manutencoes/${id}`, { status }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manutencoes'] }),
  })

  const maquinaMap = Object.fromEntries(maquinas.map((m) => [m.id, m.nome]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createManutencao.mutateAsync(form)
      setModalOpen(false)
      setForm(initialForm)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao criar manutenção')
    }
  }

  if (isLoading) return <LoadingSpinner text="Carregando manutenções..." />
  if (error) return <PageError message="Erro ao carregar manutenções" onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manutenções</h1>
        {hasPermission('admin', 'mecanico', 'gerente') && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Nova manutenção
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <select
          value={filtroMaquina}
          onChange={(e) => setFiltroMaquina(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as máquinas</option>
          {maquinas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="space-y-3">
        {manutencoes.length === 0 && (
          <div className="text-center py-12 text-gray-400">Nenhuma manutenção encontrada</div>
        )}
        {manutencoes.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{maquinaMap[m.maquina_id] || '–'}</span>
                  <Badge value={m.tipo} />
                  <Badge value={m.status} />
                </div>
                <p className="text-sm text-gray-600">{m.descricao}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {m.data_prevista && <span>Prevista: {m.data_prevista}</span>}
                  {m.data_realizada && <span>Realizada: {m.data_realizada}</span>}
                  {m.horimetro_na_manutencao && <span>Horímetro: {m.horimetro_na_manutencao}h</span>}
                  {m.custo && <span>Custo: R$ {parseFloat(m.custo).toFixed(2)}</span>}
                </div>
                {m.pecas_substituidas && (
                  <p className="text-xs text-gray-500 mt-1">Peças: {m.pecas_substituidas}</p>
                )}
              </div>
              {hasPermission('admin', 'mecanico', 'gerente') && m.status === 'pendente' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateStatus.mutate({ id: m.id, status: 'realizada' })}
                  loading={updateStatus.isPending}
                >
                  Marcar realizada
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Manutenção" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Máquina *" value={form.maquina_id} onChange={(e) => setForm({ ...form, maquina_id: e.target.value })} required>
            <option value="">Selecione...</option>
            {maquinas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo *" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="revisao">Revisão</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pendente">Pendente</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
            <Input label="Data prevista" type="date" value={form.data_prevista} onChange={(e) => setForm({ ...form, data_prevista: e.target.value })} />
            <Input label="Data realizada" type="date" value={form.data_realizada} onChange={(e) => setForm({ ...form, data_realizada: e.target.value })} />
            <Input label="Horímetro" type="number" step="0.1" value={form.horimetro_na_manutencao} onChange={(e) => setForm({ ...form, horimetro_na_manutencao: e.target.value })} />
            <Input label="Custo (R$)" type="number" step="0.01" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} />
          </div>
          <Textarea label="Descrição *" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required rows={3} />
          <Textarea label="Peças substituídas" value={form.pecas_substituidas} onChange={(e) => setForm({ ...form, pecas_substituidas: e.target.value })} rows={2} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createManutencao.isPending}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
