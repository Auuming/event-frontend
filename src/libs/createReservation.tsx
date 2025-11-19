import { API_BASE_URL } from "./config";

export default async function createReservation(token: string, event: string, ticketAmount: number) {
    const response = await fetch(`${API_BASE_URL}/ticketing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            event,
            ticketAmount
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to create reservation');
    }

    return await response.json();
}

