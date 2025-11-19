import { API_BASE_URL } from "./config";

export default async function deleteReservation(token: string, rid: string) {
    const response = await fetch(`${API_BASE_URL}/ticketing/${rid}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete reservation');
    }

    return await response.json();
}

