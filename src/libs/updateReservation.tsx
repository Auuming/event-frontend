import { API_BASE_URL } from "./config";

export default async function updateReservation(token: string, rid: string, ticketAmount: number) {
    const response = await fetch(`${API_BASE_URL}/ticketing/${rid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ticketAmount
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to update reservation');
    }

    return await response.json();
}

