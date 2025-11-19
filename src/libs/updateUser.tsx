import { API_BASE_URL } from "./config";

export default async function updateUser(token: string, name: string, tel: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            tel
        }),
    });
    if (!response.ok) {
        try {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Failed to update user';
            throw new Error(errorMessage);
        } catch (parseError) {
            if (parseError instanceof Error) {
                throw parseError;
            }
            throw new Error('Failed to update user');
        }
    }

    return await response.json();
}

