import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useMaquinas(params = {}) {
  return useQuery({
    queryKey: ['maquinas', params],
    queryFn: async () => {
      const { data } = await api.get('/maquinas', { params })
      return data
    },
  })
}

export function useMaquina(id) {
  return useQuery({
    queryKey: ['maquinas', id],
    queryFn: async () => {
      const { data } = await api.get(`/maquinas/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateMaquina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados) => api.post('/maquinas', dados).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maquinas'] }),
  })
}

export function useUpdateMaquina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dados }) => api.put(`/maquinas/${id}`, dados).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maquinas'] }),
  })
}

export function useDeleteMaquina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/maquinas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maquinas'] }),
  })
}
