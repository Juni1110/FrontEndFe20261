import { NextRequest, NextResponse } from 'next/server'
import { GENERIC_TITULAR_ID } from '@/lib/api/constants'

const BACKEND_API_BASE_URL = (process.env.BACKEND_API_BASE_URL || 'https://fabrica-2026s1.onrender.com')
  .replace(/\/+$/, '')

export async function GET(request: NextRequest) {
  return proxy(request)
}

export async function POST(request: NextRequest) {
  return proxy(request)
}

export async function PUT(request: NextRequest) {
  return proxy(request)
}

export async function PATCH(request: NextRequest) {
  return proxy(request)
}

export async function DELETE(request: NextRequest) {
  return proxy(request)
}

async function proxy(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const path = requestUrl.pathname.replace(/^\/api\//, '')
  const targetUrl = buildTargetUrl(BACKEND_API_BASE_URL, path, requestUrl.searchParams)

  const headers = new Headers()
  const accept = request.headers.get('accept')
  const contentType = request.headers.get('content-type')
  const authorization = request.headers.get('authorization')

  if (accept) headers.set('accept', accept)
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)

  const backendOrigin = new URL(BACKEND_API_BASE_URL).origin
  headers.set('origin', backendOrigin)

  const noBodyMethods = ['GET', 'HEAD', 'DELETE']
  const rawBody = noBodyMethods.includes(request.method)
    ? undefined
    : await request.text()

  const body = normalizePayload(path, rawBody, request.method)

  // DELETE/GET/HEAD must not send a body — drop Content-Type to keep the request clean
  if (noBodyMethods.includes(request.method)) {
    headers.delete('content-type')
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

function buildTargetUrl(baseUrl: string, path: string, searchParams: URLSearchParams) {
  const normalized = new URLSearchParams(searchParams)

  // Backend uses /api/v1/... — add the v1 prefix when it's missing
  const versionedPath = path.startsWith('v1/') ? path : `v1/${path}`

  const needsTitularId = versionedPath.startsWith('v1/transactions') || versionedPath.startsWith('v1/reports')
  const needsSavingGoalsTitularId = versionedPath.startsWith('v1/saving-goals')

  if ((needsTitularId || needsSavingGoalsTitularId) && !normalized.has('titularId')) {
    normalized.set('titularId', GENERIC_TITULAR_ID)
  }

  if (needsTitularId && !normalized.has('titular_id')) {
    normalized.set('titular_id', GENERIC_TITULAR_ID)
  }

  const queryString = normalized.toString()
  const suffix = queryString ? '?' + queryString : ''

  return baseUrl + '/api/' + versionedPath + suffix
}

function normalizePayload(path: string, rawBody: string | undefined, method: string) {
  if (!rawBody || !['POST', 'PUT', 'PATCH'].includes(method)) {
    return rawBody
  }

  const versionedPath = path.startsWith('v1/') ? path : `v1/${path}`
  const needsCategoryTitularId = versionedPath.startsWith('v1/categories')
  const needsSavingGoalsTitularId = versionedPath.startsWith('v1/saving-goals')

  if (!needsCategoryTitularId && !needsSavingGoalsTitularId) {
    return rawBody
  }

  try {
    const parsed = JSON.parse(rawBody)

    if (parsed && typeof parsed === 'object') {
      const hasTitularId = typeof parsed.titularId === 'string' && parsed.titularId.trim().length > 0

      if (!hasTitularId) {
        parsed.titularId = GENERIC_TITULAR_ID
      }

      if (needsCategoryTitularId) {
        const hasTitularIdSnake = typeof parsed.titular_id === 'string' && parsed.titular_id.trim().length > 0
        if (!hasTitularIdSnake) {
          parsed.titular_id = GENERIC_TITULAR_ID
        }
      }

      return JSON.stringify(parsed)
    }
  } catch {
    // Keep the original body if it is not valid JSON.
  }

  return rawBody
}
