import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Droplets, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../services/api'
import { useMaquina } from '../hooks/useMaquinas'
import { useAbastecimentos, useCreateAbastecimento } from '../hooks/useAbastecimentos'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input, { Textarea } from '../components/ui/Input'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'
import { KpiCard } from '../components/ui/Card'

const initialForm = {
  data_inicial: '', horimetro_inicial: '', data_final: '', horimetro_final: '', litros: '', observacao: '',
}

export default function MaquinaDetalhe() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data: maquina, isLoading: loadingMaquina, error: errorMaquina } = useMaquina(id)
  const { data: abastecimentos = [], isLoading: loadingAbast } = useAbastecimentos({ maquina_id: id })
  const { data: manutencoes = [] } = useQuery({
    queryKey: ['manutencoes', id],
    queryFn: () => api.get('/manutencoes', { params: { maquina_id: id } }).then((r) => r.data),
  })

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
    try {
      await createAbastecimento.mutateAsync({ ...form, maquina_id: id })
      setModalOpen(false)
      setForm(initialForm)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao registrar abastecimento')
    }
  }

  if (loadingMaquina) return <LoadingSpinner text="Carregando..." />
  if (errorMaquina) return <PageError message="Máquina não encontrada" />

  const totalLitros = abastecimentos.reduce((s, a) => s + parseFloat(a.litros || 0), 0)
  const totalHoras = abastecimentos.reduce((s, a) => s + parseFloat(a.horas_trabalhadas || 0), 0)
  const mediaGeral = totalHoras > 0 ? (totalLitros / totalHoras).toFixed(2) : null

  const graficoData = [...abastecimentos]
    .reverse()
    .map((a) => ({
      data: a.data_final,
      media: parseFloat(a.media_lh || 0),
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/maquinas" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{maquina.nome}</h1>
          <p className="text-sm text-gray-500">{maquina.tipo} · {maquina.localizacao}</p>
        </div>
        <Badge value={maquina.ativa ? 'ativo' : 'inativo'} className="ml-auto">
          {maquina.ativa ? 'Ativa' : 'Inativa'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Horímetro atual" value={`${parseFloat(maquina.horimetro_atual).toFixed(1)}h`} icon={Settings} color="blue" />
        <KpiCard label="Total abastecimentos" value={abastecimentos.length} icon={Droplets} color="yellow" />
        <KpiCard label="Total litros" value={`${totalLitros.toFixed(1)}L`} icon={Droplets} color="purple" />
        <KpiCard label="Média geral" value={mediaGeral ? `${mediaGeral} L/h` : '–'} icon={Droplets} color="green" />
      </div>

      {graficoData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Evolução do consumo (L/h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={graficoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v.toFixed(2)} L/h`, 'Média']} />
              <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="4 4" />
              <ReferenceLine y={4} stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="media" stroke="#1e3a5f" strokeWidth={2} dot={{ fill: '#1e3a5f', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">Abastecimentos</h2>
          {hasPermission('admin', 'mecanico', 'gerente') && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Registrar
            </Button>
          )}
        </div>
        {loadingAbast ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Período', 'Hor. Inicial', 'Hor. Final', 'Horas', 'Litros', 'Média', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {abastecimentos.map((a) => {
                  const media = parseFloat(a.media_lh || 0)
                  const status = media < 3 ? 'economico' : media <= 4 ? 'normal' : 'alto'
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{a.data_inicial} → {a.data_final}</td>
                      <td className="px-4 py-3">{parseFloat(a.horimetro_inicial).toFixed(1)}h</td>
                      <td className="px-4 py-3">{parseFloat(a.horimetro_final).toFixed(1)}h</td>
                      <td className="px-4 py-3 font-medium">{parseFloat(a.horas_trabalhadas || 0).toFixed(1)}h</td>
                      <td className="px-4 py-3">{parseFloat(a.litros).toFixed(1)}L</td>
                      <td className="px-4 py-3 font-semibold">{media > 0 ? `${media.toFixed(2)} L/h` : '–'}</td>
                      <td className="px-4 py-3"><Badge value={status} /></td>
                    </tr>
                  )
                })}
                {abastecimentos.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum abastecimento registrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Abastecimento" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data inicial *" type="date" value={form.data_inicial} onChange={(e) => setForm({ ...form, data_inicial: e.target.value })} required />
            <Input label="Data final *" type="date" value={form.data_final} onChange={(e) => setForm({ ...form, data_final: e.target.value })} required />
            <Input label="Horímetro inicial *" type="number" step="0.1" value={form.horimetro_inicial} onChange={(e) => setForm({ ...form, horimetro_inicial: e.target.value })} required />
            <Input label="Horímetro final *" type="number" step="0.1" value={form.horimetro_final} onChange={(e) => setForm({ ...form, horimetro_final: e.target.value })} required />
            <Input label="Litros *" type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Prévia do cálculo</label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Horas:</span><span className="font-medium">{horas_preview ?? '–'}h</span></div>
                <div className="flex justify-between mt-1"><span className="text-gray-500">Média:</span><span className="font-semibold text-blue-900">{media_preview ?? '–'} L/h</span></div>
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
