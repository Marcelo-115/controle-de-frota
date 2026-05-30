import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Truck, ChevronRight } from 'lucide-react'
import { useMaquinas, useCreateMaquina } from '../hooks/useMaquinas'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const initialForm = {
  nome: '', tipo: '', localizacao: '', ano_fabricacao: '',
  placa_ou_serie: '', horimetro_atual: '', alerta_manutencao_horas: 250,
}

export default function Maquinas() {
  const { hasPermission } = useAuth()
  const [busca, setBusca] = useState('')
  const [filtroAtiva, setFiltroAtiva] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data: maquinas = [], isLoading, error, refetch } = useMaquinas(
    filtroAtiva !== '' ? { ativa: filtroAtiva === 'true' } : {}
  )
  const createMaquina = useCreateMaquina()

  const maquinasFiltradas = maquinas.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (m.tipo || '').toLowerCase().includes(busca.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createMaquina.mutateAsync({
        ...form,
        ano_fabricacao: form.ano_fabricacao ? parseInt(form.ano_fabricacao) : null,
        horimetro_atual: form.horimetro_atual || 0,
        alerta_manutencao_horas: parseInt(form.alerta_manutencao_horas),
      })
      setModalOpen(false)
      setForm(initialForm)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao criar máquina')
    }
  }

  if (isLoading) return <LoadingSpinner text="Carregando máquinas..." />
  if (error) return <PageError message="Erro ao carregar máquinas" onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Máquinas</h1>
        {hasPermission('admin', 'gerente') && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Nova máquina
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar máquina ou tipo..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filtroAtiva}
          onChange={(e) => setFiltroAtiva(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="true">Ativas</option>
          <option value="false">Inativas</option>
        </select>
      </div>

      <div className="grid gap-3">
        {maquinasFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500">Nenhuma máquina encontrada</div>
        )}
        {maquinasFiltradas.map((m) => (
          <Link
            key={m.id}
            to={`/maquinas/${m.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Truck size={20} className="text-blue-900" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{m.nome}</p>
                <p className="text-sm text-gray-500">
                  {m.tipo || 'Sem tipo'} · {m.localizacao || 'Sem localização'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Horímetro</p>
                <p className="font-semibold text-gray-900">{parseFloat(m.horimetro_atual).toFixed(1)}h</p>
              </div>
              <Badge value={m.ativa ? 'ativo' : 'inativo'}>
                {m.ativa ? 'Ativa' : 'Inativa'}
              </Badge>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Máquina" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <Input label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Trator, Bob Cat, etc." />
            <Input label="Localização" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
            <Input label="Ano de fabricação" type="number" value={form.ano_fabricacao} onChange={(e) => setForm({ ...form, ano_fabricacao: e.target.value })} />
            <Input label="Placa / Série" value={form.placa_ou_serie} onChange={(e) => setForm({ ...form, placa_ou_serie: e.target.value })} />
            <Input label="Horímetro atual" type="number" step="0.1" value={form.horimetro_atual} onChange={(e) => setForm({ ...form, horimetro_atual: e.target.value })} />
            <Input label="Alerta manutenção (horas)" type="number" value={form.alerta_manutencao_horas} onChange={(e) => setForm({ ...form, alerta_manutencao_horas: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMaquina.isPending}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
