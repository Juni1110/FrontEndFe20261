import { NextRequest, NextResponse } from 'next/server'

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
  const targetUrl = `${BACKEND_API_BASE_URL}/api/${path}${requestUrl.search}`

  const headers = new Headers()
  const accept = request.headers.get('accept')
  const contentType = request.headers.get('content-type')
  const authorization = request.headers.get('authorization')

  if (accept) headers.set('accept', accept)
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)

  const backendOrigin = new URL(BACKEND_API_BASE_URL).origin
  headers.set('origin', backendOrigin)

  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.text()

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
