// Simple REST client for backend API using fetch
// Endpoints based on openapi.yaml
// Dynamic base URL selection: localhost -> http://localhost:8080, otherwise https://{host}

import authService from '@/auth/authService'

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const runtimeFullHost = typeof window !== 'undefined' ? window.location.host : 'localhost'
const API_BASE = runtimeHost === 'localhost'
    ? 'http://localhost:8080'
    : `https://${runtimeFullHost}`

const ROOT = `${API_BASE}/api/present-now/v1`;

// Helper to build request options with authentication
async function jsonOptions(method: string, body?: any): Promise<RequestInit> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    }
    
    // Add authorization header if user is authenticated
    const token = await authService.getAccessToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    
    return {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    }
}

async function handle(res: Response): Promise<any> {
    // Check for 204 No Content first (before trying to read body)
    if (res.status === 204) return null
    
    if (!res.ok) {
        let detail
        try {
            const text = await res.text()
            try {
                detail = JSON.parse(text)
            } catch {
                detail = text
            }
        } catch (_) {
            detail = 'Unknown error'
        }
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${JSON.stringify(detail)}`)
    }
    
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
}

// Create or update (save) wish list
// list: { id?, name, description, username?, active?, presentIdeas?, expires? }
export async function saveWishList(list: any) {
    return handle(await fetch(`${ROOT}/lists`, await jsonOptions('POST', list)))
}

// Get all lists for current user
export async function getWishLists() {
    return handle(await fetch(`${ROOT}/lists`, await jsonOptions('GET', undefined)))
}

// Update wish list
export async function updateWishList(id: string, wishListUpdate: any) {
    return handle(await fetch(`${ROOT}/lists/${id}`, await jsonOptions('PUT', wishListUpdate)))
}

// Delete wish list
export async function deleteWishList(id: string) {
    await handle(await fetch(`${ROOT}/lists/${id}`, await jsonOptions('DELETE', undefined)))
    return true
}

// Create present idea for a list (listId required in payload per schema)
// present: { id?, listId, name, url, description, importance }
export async function savePresent(present: any) {
    return handle(await fetch(`${ROOT}/present`, await jsonOptions('POST', present)))
}

// Update present idea
export async function updatePresent(id: string, present: any) {
    return handle(await fetch(`${ROOT}/present/${id}`, await jsonOptions('PUT', present)))
}

// Get present by id
export async function getPresent(id: string) {
    return handle(await fetch(`${ROOT}/present/${id}`, await jsonOptions('GET', undefined)))
}

// Delete present
export async function deletePresent(id: string) {
    await handle(await fetch(`${ROOT}/present/${id}`, await jsonOptions('DELETE', undefined)))
    return true
}

// Convenience helper: create a present for given list id with minimal fields
export async function createPresentForList(listId: string, {name, url = '', description = '', importance = 0}: {name: string, url?: string, description?: string, importance?: number}) {
    return savePresent({listId, name, url, description, importance})
}

// Claim a present idea
export async function claimPresent(id: string, claimerName?: string) {
    // If claimerName is provided, send it in the body
    const body = claimerName ? { claimerName } : undefined
    return handle(await fetch(`${ROOT}/present/${id}/claim`, await jsonOptions('POST', body)))
}

// Unclaim a present idea
export async function unclaimPresent(id: string) {
    return handle(await fetch(`${ROOT}/present/${id}/claim`, await jsonOptions('DELETE', undefined)))
}

// Public endpoints (no authentication required)
export async function getFrontendConfig() {
    return handle(await fetch(`${ROOT}/public/config`))
}

export async function getPublicWishList(id: string) {
    return handle(await fetch(`${ROOT}/public/lists/${id}`))
}

export async function getPublicPresent(id: string) {
    return handle(await fetch(`${ROOT}/public/present/${id}`))
}

// Public claim endpoint - uses the regular claim endpoint without auth
// The endpoint works without authentication for public users
export async function publicClaimPresent(id: string, claimerName?: string) {
    const body = claimerName ? { claimerName } : undefined
    return handle(await fetch(`${ROOT}/public/${id}/claim`, await jsonOptions('POST', body)))
}

// Example usage (remove or adapt in components):
// saveWishList({ name: 'Birthday', description: 'Ideas', username: 'alice', active: true })
//   .then(list => createPresentForList(list.id, { name: 'Headphones', url: 'https://example.com' }))
//   .catch(console.error)
