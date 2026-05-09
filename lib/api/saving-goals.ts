const API_URL = 'http://fabrica-2026s1.onrender.com/api/saving-goals'

export async function getSavingGoals() {

  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Error obteniendo metas')
  }

  return response.json()
}

export async function createSavingGoal(data: any) {

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error creando meta')
  }

  return response.json()
}

export async function updateSavingGoal(id: string, data: any) {

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error actualizando meta')
  }

  return response.json()
}