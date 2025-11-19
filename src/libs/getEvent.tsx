import { API_BASE_URL } from "./config";

export default async function getEvent(eid:string) {
    const response = await fetch(`${API_BASE_URL}/events/${eid}`)
    if (!response.ok) {
        throw new Error("Failed to fetch event")
    }
    return await response.json()
}