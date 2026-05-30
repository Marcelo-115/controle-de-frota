const variants = {
  economico: 'bg-green-100 text-green-800',
  normal: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-red-100 text-red-800',
  sem_dados: 'bg-gray-100 text-gray-600',
  pendente: 'bg-yellow-100 text-yellow-800',
  realizada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-100 text-gray-500',
  preventiva: 'bg-blue-100 text-blue-800',
  corretiva: 'bg-red-100 text-red-800',
  revisao: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-900 text-white',
  mecanico: 'bg-orange-100 text-orange-800',
  gerente: 'bg-indigo-100 text-indigo-800',
  diretoria: 'bg-purple-100 text-purple-800',
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-gray-100 text-gray-600',
}

const labels = {
  economico: 'Econômico',
  normal: 'Normal',
  alto: 'Alto',
  sem_dados: 'Sem dados',
  pendente: 'Pendente',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  revisao: 'Revisão',
}

export default function Badge({ value, children, className = '' }) {
  const key = (value || '').toLowerCase()
  const cls = variants[key] || 'bg-gray-100 text-gray-700'
  const label = children || labels[key] || value

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {label}
    </span>
  )
}
