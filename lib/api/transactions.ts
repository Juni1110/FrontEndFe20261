import { apiRequest } from './client'

export async function getTransactions() {

  const data = await apiRequest('/api/transactions')

return data.map((item: any) => {

  let transactionType = 'goal'

  if (item.tipo === 'INGRESO') {
    transactionType = 'income'
  } else if (item.tipo === 'GASTO') {
    transactionType = 'expense'
  }

  return {
    id: item.transactionId,
    title: item.nombre,
    amount: item.monto,
    description: item.descripcion || '',
    type: transactionType,
    date: item.fecha,
    category: item.nombreCategoria || 'Sin categoria',
    owner: item.nombreTitular,
  }
})
}

export async function createTransaction(data: any) {

  return apiRequest('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateTransaction(id: string, data: any) {

  return apiRequest(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteTransaction(id: string) {

  return apiRequest(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
}