import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useAbastecimentos(params = {}) {
  return useQuery({
    queryKey: ['abastecimentos', params],
    queryFn: async () => {
      const { data } = await api.get('/abastecimentos', { params })
      return data
    },
  })
}

export function useCreateAbastecimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados) => api.post('/abastecimentos', dados).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] })
      queryClient.invalidateQueries({ queryKey: ['maquinas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAbastecimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/abastecimentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
