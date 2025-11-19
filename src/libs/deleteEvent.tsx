import { API_BASE_URL } from "./config";

export default async function deleteEvent(token: string, eid: string) {
    const response = await fetch(`${API_BASE_URL}/events/${eid}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete event');
    }

    return await response.json();
}

