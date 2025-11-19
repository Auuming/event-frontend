'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { TextField, Button, Alert } from "@mui/material";
import updateReservation from "@/libs/updateReservation";
import getReservations from "@/libs/getReservations";

export default function EditReservationPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const rid = params.rid as string;
    
    const [ticketCount, setTicketCount] = useState<number>(1);
    const [currentReservation, setCurrentReservation] = useState<ReservationItem | null>(null);
    const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchReservation = async () => {
            if (!session?.user?.token) return;
            
            try {
                const data = await getReservations(session.user.token as string);
                const reservations = data.data || [];
                setAllReservations(reservations);
                const reservation = reservations.find((r: ReservationItem) => r._id === rid);
                if (reservation) {
                    setCurrentReservation(reservation);
                    setTicketCount(reservation.ticketAmount);
                } else {
                    setError("Reservation not found");
                }
            } catch (err) {
                setError("Failed to load reservation");
            } finally {
                setLoadingData(false);
            }
        };
        fetchReservation();
    }, [session, rid]);

    const handleUpdate = async () => {
        if (ticketCount < 1 || ticketCount > 5) {
            setError("Ticket count must be between 1 and 5");
            return;
        }

        if (!currentReservation) return;

        // Check total tickets for this event by this member (excluding current reservation)
        const totalTicketsForEvent = allReservations
            .filter(r => r.event === currentReservation.event && r._id !== rid)
            .reduce((sum, r) => sum + r.ticketAmount, 0);
        
        if (totalTicketsForEvent + ticketCount > 5) {
            setError(`You can only reserve a maximum of 5 tickets per event. You already have ${totalTicketsForEvent} tickets reserved for this event (excluding this reservation).`);
            return;
        }

        if (!session?.user?.token) {
            setError("Please sign in to update a reservation");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await updateReservation(session.user.token as string, rid, ticketCount);
            router.push("/mybooking");
        } catch (err: any) {
            setError(err.message || "Failed to update reservation");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
                <Alert severity="warning">Please sign in to edit a reservation</Alert>
            </main>
        );
    }

    if (loadingData) {
        return <div>Loading...</div>;
    }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
            <h1 className="text-black text-2xl font-medium">Edit Reservation</h1>
            <div className="bg-slate-100 rounded-lg px-10 py-8 flex flex-col justify-center items-center gap-5 w-full max-w-[400px]">
                {error && <Alert severity="error" className="w-full">{error}</Alert>}
                
                <TextField 
                    variant="standard" 
                    label="Ticket Count (Max 5)"
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 5 }}
                    fullWidth
                />

                <Button 
                    variant="contained" 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-indigo-600"
                >
                    {loading ? "Updating..." : "Update Reservation"}
                </Button>
            </div>
        </main>
    );
}

