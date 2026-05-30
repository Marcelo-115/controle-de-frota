import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAbastecimentos, useCreateAbastecimento } from '../hooks/useAbastecimentos'
import { useMaquinas } from '../hooks/useMaquinas'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Button from '../components/ui/Button'
import Input, { Select, Textarea } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const initialForm = {
  maquina_id: '', data_inicial: '', horimetro_inicial: '',
  data_final: '', horimetro_final: '', litros: '', observacao: '',
}

export default function Abastecimentos() {
  const { hasPermission } = useAuth()
  const [filtroMaquina, setFiltroMaquina] = useState('')
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const params = {}
  if (filtroMaquina) params.maquina_id = filtroMaquina

  const { data: abastecimentos = [], isLoading, error, refetch } = useAbastecimentos(params)
  const { data: maquinas = [] } = useMaquinas({ ativa: true })
  const createAbastecimento = useCreateAbastecimento()

  const horas_preview =
    form.horimetro_final && form.horimetro_inicial
      ? (parseFloat(form.horimetro_final) - parseFloat(form.horimetro_inicial)).toFixed(1)
      : null
  const media_preview =
    horas_preview && parseFloat(horas_preview) > 0 && form.litros
      ? (parseFloat(form.litros) / parseFloat(horas_preview)).toFixed(2)
      : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.maquina_id) return alert('Selecione uma máquina')
    try {
      await createAbastecimento.mutateAsync(form)
      setModalOpen(false)
      setForm(initialForm)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao registrar abastecimento')
    }
  }

  if (isLoading) return <LoadingSpinner text="Carregando abastecimentos..." />
  if (error) return <PageError message="Erro ao carregar abastecimentos" onRetry={refetch} />

  const maquinaMap = Object.fromEntries(maquinas.map((m) => [m.id, m.nome]))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Abastecimentos</h1>
        {hasPermission('admin', 'mecanico', 'gerente') && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Registrar
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
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Máquina', 'Período', 'Hor. Inicial', 'Hor. Final', 'Horas', 'Litros', 'Média (L/h)', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {abastecimentos.map((a) => {
              const media = parseFloat(a.media_lh || 0)
              const status = !a.media_lh ? 'sem_dados' : media < 3 ? 'economico' : media <= 4 ? 'normal' : 'alto'
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{maquinaMap[a.maquina_id] || '–'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{a.data_inicial} → {a.data_final}</td>
                  <td className="px-4 py-3">{parseFloat(a.horimetro_inicial).toFixed(1)}h</td>
                  <td className="px-4 py-3">{parseFloat(a.horimetro_final).toFixed(1)}h</td>
                  <td className="px-4 py-3 font-medium">{parseFloat(a.horas_trabalhadas || 0).toFixed(1)}h</td>
                  <td className="px-4 py-3">{parseFloat(a.litros).toFixed(1)}L</td>
                  <td className="px-4 py-3 font-semibold">{media > 0 ? `${media.toFixed(2)}` : '–'}</td>
                  <td className="px-4 py-3"><Badge value={status} /></td>
                </tr>
              )
            })}
            {abastecimentos.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Nenhum abastecimento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Abastecimento" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Máquina *"
            value={form.maquina_id}
            onChange={(e) => setForm({ ...form, maquina_id: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            {maquinas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data inicial *" type="date" value={form.data_inicial} onChange={(e) => setForm({ ...form, data_inicial: e.target.value })} required />
            <Input label="Data final *" type="date" value={form.data_final} onChange={(e) => setForm({ ...form, data_final: e.target.value })} required />
            <Input label="Horímetro inicial *" type="number" step="0.1" value={form.horimetro_inicial} onChange={(e) => setForm({ ...form, horimetro_inicial: e.target.value })} required />
            <Input label="Horímetro final *" type="number" step="0.1" value={form.horimetro_final} onChange={(e) => setForm({ ...form, horimetro_final: e.target.value })} required />
            <Input label="Litros *" type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Prévia</label>
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Horas:</span><span className="font-medium">{horas_preview ?? '–'}h</span></div>
                <div className="flex justify-between mt-1"><span className="text-gray-500">Média:</span><span className="font-bold text-blue-900">{media_preview ?? '–'} L/h</span></div>
              </div>
            </div>
          </div>
          <Textarea label="Observação" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createAbastecimento.isPending}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
