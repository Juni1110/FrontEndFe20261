const API_URL = 'https://fabrica-2026s1.onrender.com/api/transactions'

export async function getTransactions() {

  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Error obteniendo transacciones')
  }

  const data = await response.json()

  return data.map((item: any) => ({
    id: item.transactionId,
    title: item.nombre,
    amount: item.monto,
    description: item.descripcion || '',
    type:
      item.tipo === 'INGRESO'
        ? 'income'
        : item.tipo === 'GASTO'
        ? 'expense'
        : 'goal',
    date: item.fecha,
    category: item.nombreCategoria || 'Sin categoria',
    owner: item.nombreTitular,
  }))
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
    throw new Error('Error creando transaccion')
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
    throw new Error('Error actualizando transaccion')
  }

  return response.json()
}

export async function deleteTransaction(id: string) {

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error eliminando transaccion')
  }
}