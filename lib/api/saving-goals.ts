import { apiRequest } from './client'
import { GENERIC_TITULAR_ID } from './constants'

export async function getSavingGoals() {

  return apiRequest('/api/saving-goals')
}

export async function createSavingGoal(data: any) {

  return apiRequest('/api/saving-goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      titularId: data.titularId ?? GENERIC_TITULAR_ID,
    }),
  })
}

export async function updateSavingGoal(id: string, data: any) {

  return apiRequest(`/api/saving-goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      titularId: data.titularId ?? GENERIC_TITULAR_ID,
    }),
  })
}