import { apiRequest } from './client'

export async function generateReport(data: any) {

  return apiRequest('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}