import { API_BASE_URL } from "./config";

export default async function deleteUser(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        try {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Failed to delete user';
            throw new Error(errorMessage);
        } catch (parseError) {
            if (parseError instanceof Error) {
                throw parseError;
            }
            throw new Error('Failed to delete user');
        }
    }

    return await response.json();
}

