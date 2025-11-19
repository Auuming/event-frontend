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
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchReservation = async () => {
            if (!session?.user?.token) return;
            
            try {
                const data = await getReservations(session.user.token as string);
                const reservations = data.data || [];
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
        const isMember = session?.user?.role === 'member';
        
        // Frontend check: For members, ticket count must be between 1 and 5
        // For admins: ticket count must be at least 1 (no upper limit)
        if (ticketCount < 1) {
            setError("Ticket count must be at least 1");
            return;
        }
        
        if (isMember && ticketCount > 5) {
            setError("Ticket count must be between 1 and 5");
            return;
        }

        if (!currentReservation) return;

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
            // Parse backend error messages and show user-friendly messages
            const errorMessage = err.message || "Failed to update reservation";
            if (errorMessage.includes("Cannot request more than 5 tickets per event")) {
                setError("You cannot reserve more than 5 tickets per event in total");
            } else if (errorMessage.includes("Not enough tickets available")) {
                setError("Not enough tickets available for this event");
            } else {
                setError(errorMessage);
            }
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
                    label={session?.user?.role === 'admin' ? "Ticket Count" : "Ticket Count (Max 5)"}
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                    inputProps={{ 
                        min: 1, 
                        ...(session?.user?.role === 'member' ? { max: 5 } : {})
                    }}
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

