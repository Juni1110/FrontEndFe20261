const API_URL = 'https://fabrica-2026s1.onrender.com/api/transactions'

export async function getTransactions() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Error obteniendo transacciones')
  }

  return response.json()
}

export async function createTransaction(data: any) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(errorText)
    throw new Error('Error creando transacción')
  }

  return response.json()
}

export async function updateTransaction(id: string, data: any) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error actualizando transacción')
  }

  return response.json()
}

export async function deleteTransaction(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error eliminando transacción')
  }
}