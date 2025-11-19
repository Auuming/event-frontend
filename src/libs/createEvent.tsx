import { API_BASE_URL } from "./config";

export default async function createEvent(token: string, name: string, description: string, eventDate: string, venue: string, organizer: string, availableTicket: number, posterPicture: string) {
    const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            description,
            eventDate,
            venue,
            organizer,
            availableTicket,
            posterPicture
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to create event');
    }

    return await response.json();
}

