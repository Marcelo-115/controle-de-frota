import { useState } from 'react'
import { Truck, Droplets, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useDashboard } from '../hooks/useDashboard'
import { KpiCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import LoadingSpinner, { PageError } from '../components/ui/LoadingSpinner'

const periodos = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
]

export default function Dashboard() {
  const [periodo, setPeriodo] = useState(30)
  const { data, isLoading, error, refetch } = useDashboard(periodo)

  if (isLoading) return <LoadingSpinner text="Carregando dashboard..." />
  if (error) return <PageError message="Erro ao carregar dashboard" onRetry={refetch} />

  const mediaFmt = data.media_geral_frota != null ? `${data.media_geral_frota.toFixed(2)} L/h` : '–'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {periodos.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodo === p.value ? 'bg-white shadow text-blue-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Máquinas ativas"
          value={data.total_maquinas_ativas}
          icon={Truck}
          color="blue"
        />
        <KpiCard
          label="Horas trabalhadas"
          value={`${data.total_horas_periodo.toFixed(1)}h`}
          icon={Clock}
          color="purple"
        />
        <KpiCard
          label="Total de litros"
          value={`${data.total_litros_periodo.toFixed(1)}L`}
          icon={Droplets}
          color="yellow"
        />
        <KpiCard
          label="Média geral frota"
          value={mediaFmt}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {data.maquinas_em_alerta_manutencao.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-600" size={18} />
            <h2 className="font-semibold text-red-800">
              Alertas de manutenção ({data.maquinas_em_alerta_manutencao.length})
            </h2>
          </div>
          <div className="space-y-2">
            {data.maquinas_em_alerta_manutencao.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                <span className="text-sm font-medium text-gray-900">{m.nome}</span>
                <span className="text-sm text-red-600 font-medium">
                  {m.horas_vencidas}h vencidas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Consumo por máquina</h2>
          <div className="space-y-2">
            {data.consumo_por_maquina.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.nome}</p>
                  <p className="text-xs text-gray-400">
                    {m.total_horas?.toFixed(1)}h · {m.total_litros?.toFixed(1)}L
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {m.media_lh != null ? `${m.media_lh.toFixed(2)} L/h` : '–'}
                  </span>
                  <Badge value={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Histórico mensal (litros)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.historico_consumo_mensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'litros' ? `${value.toFixed(1)} L` : `${value.toFixed(1)} h`,
                  name === 'litros' ? 'Litros' : 'Horas',
                ]}
              />
              <Bar dataKey="litros" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
