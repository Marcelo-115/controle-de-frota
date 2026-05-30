import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useDashboard(periodoDias = 30) {
  return useQuery({
    queryKey: ['dashboard', periodoDias],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/resumo', {
        params: { periodo_dias: periodoDias },
      })
      return data
    },
    staleTime: 60_000,
  })
}
