import { apiRequest } from './client'

export async function getSavingGoals() {

  return apiRequest('/api/saving-goals')
}

export async function createSavingGoal(data: any) {

  return apiRequest('/api/saving-goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateSavingGoal(id: string, data: any) {

  return apiRequest(`/api/saving-goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}