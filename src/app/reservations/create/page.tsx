'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, Button, Alert, Select, MenuItem } from "@mui/material";
import createReservation from "@/libs/createReservation";
import getEvents from "@/libs/getEvents";
import getReservations from "@/libs/getReservations";

export default function CreateReservationPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "");
    const [ticketCount, setTicketCount] = useState<number>(1);
    const [existingReservations, setExistingReservations] = useState<ReservationItem[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventsData = await getEvents();
                setEvents(eventsData.data || []);
                
                if (session?.user?.token) {
                    const reservationsData = await getReservations(session.user.token as string);
                    setExistingReservations(reservationsData.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, [session]);

    const handleCreate = async () => {
        if (!selectedEvent) {
            setError("Please select an event");
            return;
        }
        if (ticketCount < 1 || ticketCount > 5) {
            setError("Ticket count must be between 1 and 5");
            return;
        }

        // Check total tickets for this event by this member
        const totalTicketsForEvent = existingReservations
            .filter(r => r.event === selectedEvent)
            .reduce((sum, r) => sum + r.ticketAmount, 0);
        
        if (totalTicketsForEvent + ticketCount > 5) {
            setError(`You can only reserve a maximum of 5 tickets per event. You already have ${totalTicketsForEvent} tickets reserved for this event.`);
            return;
        }

        if (!session?.user?.token) {
            setError("Please sign in to create a reservation");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await createReservation(session.user.token as string, selectedEvent, ticketCount);
            router.push("/mybooking");
        } catch (err: any) {
            setError(err.message || "Failed to create reservation");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
                <Alert severity="warning">Please sign in to create a reservation</Alert>
            </main>
        );
    }

    if (session.user?.role !== 'member') {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
                <Alert severity="error">Only members can create reservations</Alert>
            </main>
        );
    }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
            <h1 className="text-black text-2xl font-medium">Create Reservation</h1>
            <div className="bg-slate-100 rounded-lg px-10 py-8 flex flex-col justify-center items-center gap-5 w-full max-w-[400px]">
                {error && <Alert severity="error" className="w-full">{error}</Alert>}
                
                {!eventId && (
                    <Select 
                        variant="standard" 
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="">Select an event</MenuItem>
                        {events.map((event) => {
                            const totalReserved = existingReservations
                                .filter(r => r.event === event.id)
                                .reduce((sum, r) => sum + r.ticketAmount, 0);
                            const remaining = 5 - totalReserved;
                            return (
                                <MenuItem key={event.id} value={event.id}>
                                    {event.name} {remaining > 0 ? `(Available: ${event.availableTicket}, You can reserve up to ${remaining} more)` : '(Max tickets reached)'}
                                </MenuItem>
                            );
                        })}
                    </Select>
                )}

                {selectedEvent && (() => {
                    const selectedEventData = events.find(e => e.id === selectedEvent);
                    const totalReserved = existingReservations
                        .filter(r => r.event === selectedEvent)
                        .reduce((sum, r) => sum + r.ticketAmount, 0);
                    const maxAllowed = Math.min(5 - totalReserved, selectedEventData?.availableTicket || 0);
                    return (
                        <>
                            {selectedEventData && (
                                <div className="text-sm text-gray-600">
                                    Available tickets: {selectedEventData.availableTicket} | 
                                    You've reserved: {totalReserved} | 
                                    You can reserve up to: {maxAllowed} more
                                </div>
                            )}
                            <TextField 
                                variant="standard" 
                                label="Ticket Count (Max 5)"
                                type="number"
                                value={ticketCount}
                                onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1, max: 5 }}
                                fullWidth
                            />
                        </>
                    );
                })()}

                <Button 
                    variant="contained" 
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-indigo-600"
                >
                    {loading ? "Creating..." : "Create Reservation"}
                </Button>
            </div>
        </main>
    );
}

