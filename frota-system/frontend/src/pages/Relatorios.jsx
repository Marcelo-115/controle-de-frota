import { useState } from 'react'
import { FileText, Download, Table } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMaquinas } from '../hooks/useMaquinas'
import api from '../services/api'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const hoje = new Date().toISOString().split('T')[0]
const trintaDiasAtras = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

export default function Relatorios() {
  const [dataInicio, setDataInicio] = useState(trintaDiasAtras)
  const [dataFim, setDataFim] = useState(hoje)
  const [maquinasSelecionadas, setMaquinasSelecionadas] = useState([])
  const [preview, setPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingExport, setLoadingExport] = useState('')

  const { data: maquinas = [] } = useMaquinas()

  const buildParams = () => {
    const p = new URLSearchParams()
    p.set('data_inicio', dataInicio)
    p.set('data_fim', dataFim)
    if (maquinasSelecionadas.length > 0) {
      p.set('maquina_ids', maquinasSelecionadas.join(','))
    }
    return p.toString()
  }

  const handlePreview = async () => {
    setLoadingPreview(true)
    try {
      const { data } = await api.get(`/relatorios/preview?${buildParams()}`)
      setPreview(data)
    } catch {
      alert('Erro ao gerar preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleExport = async (tipo) => {
    setLoadingExport(tipo)
    try {
      const response = await api.get(`/relatorios/${tipo}?${buildParams()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_frota_${dataFim}.${tipo === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert(`Erro ao exportar ${tipo.toUpperCase()}`)
    } finally {
      setLoadingExport('')
    }
  }

  const toggleMaquina = (id) => {
    setMaquinasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Filtros</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <Input label="Data fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máquinas ({maquinasSelecionadas.length === 0 ? 'todas' : `${maquinasSelecionadas.length} selecionada(s)`})
          </label>
          <div className="flex flex-wrap gap-2">
            {maquinas.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMaquina(m.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  maquinasSelecionadas.includes(m.id)
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {m.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handlePreview} loading={loadingPreview}>
            <Table size={16} /> Visualizar dados
          </Button>
          <Button onClick={() => handleExport('excel')} loading={loadingExport === 'excel'}>
            <Download size={16} /> Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} loading={loadingExport === 'pdf'}>
            <FileText size={16} /> Exportar PDF
          </Button>
        </div>
      </div>

      {preview && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Preview — {preview.periodo}</h2>
            <div className="flex gap-6 text-sm text-gray-500">
              <span><strong className="text-gray-900">{preview.total_horas.toFixed(1)}h</strong> horas</span>
              <span><strong className="text-gray-900">{preview.total_litros.toFixed(1)}L</strong> litros</span>
              <span><strong className="text-gray-900">{preview.media_geral.toFixed(2)} L/h</strong> média geral</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Máquina', 'Tipo', 'Horas', 'Litros', 'Média (L/h)', 'Status', 'Abastecimentos'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.maquinas.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{m.tipo}</td>
                    <td className="px-4 py-3">{m.horas.toFixed(1)}</td>
                    <td className="px-4 py-3">{m.litros.toFixed(1)}</td>
                    <td className="px-4 py-3 font-semibold">{m.media != null ? m.media.toFixed(2) : '–'}</td>
                    <td className="px-4 py-3">
                      <Badge value={m.status.toLowerCase().replace(' ', '_') === 'econômico' ? 'economico' : m.status.toLowerCase()}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{m.qtd_abastecimentos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
