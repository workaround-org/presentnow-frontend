// Simple REST client for backend API using fetch
// Endpoints based on openapi.yaml
// Dynamic base URL selection: localhost -> http://localhost:8080, otherwise https://{host}

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const runtimeFullHost = typeof window !== 'undefined' ? window.location.host : 'localhost'
const API_BASE = runtimeHost === 'localhost'
    ? 'http://localhost:8080'
    : `https://${runtimeFullHost}`

const ROOT = `${API_BASE}/api/present-now/v1`;

// Helper to build request options
function jsonOptions(method, body) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
    }
}

async function handle(res) {
    if (!res.ok) {
        let detail
        try {
            detail = await res.json()
        } catch (_) {
            detail = await res.text()
        }
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`)
    }
    if (res.status === 204) return null
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
}

// Create or update (save) wish list
// list: { id?, name, description, username?, active?, presentIdeas?, expires? }
export async function saveWishList(list) {
    return handle(await fetch(`${ROOT}/lists`, jsonOptions('POST', list)))
}

// Get all lists for current user
export async function getWishLists() {
    return handle(await fetch(`${ROOT}/lists`))
}

// Get list by id
export async function getWishList(id) {
    return handle(await fetch(`${ROOT}/lists/${id}`))
}

// Create present idea for a list (listId required in payload per schema)
// present: { id?, listId, name, url, description, importance }
export async function savePresent(present) {
    return handle(await fetch(`${ROOT}/present`, jsonOptions('POST', present)))
}

// Update present idea
export async function updatePresent(id, present) {
    return handle(await fetch(`${ROOT}/present/${id}`, jsonOptions('PUT', present)))
}

// Get present by id
export async function getPresent(id) {
    return handle(await fetch(`${ROOT}/present/${id}`))
}

// Delete present
export async function deletePresent(id) {
    await handle(await fetch(`${ROOT}/present/${id}`, {method: 'DELETE'}))
    return true
}

// Convenience helper: create a present for given list id with minimal fields
export async function createPresentForList(listId, {name, url = '', description = '', importance = 0}) {
    return savePresent({listId, name, url, description, importance})
}

// Example usage (remove or adapt in components):
// saveWishList({ name: 'Birthday', description: 'Ideas', username: 'alice', active: true })
//   .then(list => createPresentForList(list.id, { name: 'Headphones', url: 'https://example.com' }))
//   .catch(console.error)
