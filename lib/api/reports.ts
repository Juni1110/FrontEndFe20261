const API_URL = 'http://fabrica-2026s1.onrender.com/api/reports'

export async function generateReport(data: any) {

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error generando reporte')
  }

  return response.json()
}