import { apiRequest } from './client'

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Comida' },
  { id: '2', name: 'Transporte' },
  { id: '3', name: 'Salario' },
  { id: '4', name: 'Entretenimiento' },
  { id: '5', name: 'Salud' },
  { id: '6', name: 'Educación' },
  { id: '7', name: 'Metas de Ahorro' },
  { id: '8', name: 'Cosas de Servicios' },
]

export async function createCategory(name: string, titularId: string) {

  return apiRequest('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: name,
      titularId,
      titular_id: titularId,
    }),
  })
}

export async function getCategories() {

  try {
    const data = await apiRequest('/api/categories')

    return data.map((item: any, index: number) => ({
      id: index.toString(),
      name: item.nombre,
    }))
  } catch (error) {
    console.warn('Fallo cargando categorías desde el backend, usando categorías de respaldo.', error)

    return FALLBACK_CATEGORIES
  }
}