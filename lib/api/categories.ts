const API_URL = 'https://fabrica-2026s1.onrender.com/api/categories'

export async function getCategories() {

  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Error obteniendo categorias')
  }

  const data = await response.json()

  return data.map((item: any, index: number) => ({
    id: index.toString(),
    name: item.nombre,
  }))
}