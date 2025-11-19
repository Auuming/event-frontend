'use client'
import { useAppSelector, AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { removeReservation } from "@/redux/features/bookSlice"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import getReservations from "@/libs/getReservations"
import deleteReservation from "@/libs/deleteReservation"
import Link from "next/link"

export default function ReservationList() {
    const { data: session } = useSession()
    const dispatch = useDispatch<AppDispatch>()
    const [reservations, setReservations] = useState<ReservationItem[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchReservations = async () => {
            if (session?.user?.token) {
                try {
                    const data = await getReservations(session.user.token as string)
                    setReservations(data.data || [])
                } catch (err) {
                    console.error('Failed to fetch reservations:', err)
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }
        fetchReservations()
    }, [session])
    
    const handleDelete = async (reservation: ReservationItem) => {
        if (!session?.user?.token || !reservation._id) return
        
        try {
            await deleteReservation(session.user.token as string, reservation._id)
            setReservations(reservations.filter(r => r._id !== reservation._id))
            dispatch(removeReservation(reservation))
        } catch (err) {
            console.error('Failed to delete reservation:', err)
            alert('Failed to delete reservation')
        }
    }
    
    if (loading) return <div>Loading...</div>
    if (!session) return <div>Please sign in to view your reservations</div>
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                {session.user?.role === 'admin' ? 'All Reservations' : 'My Reservations'}
            </h1>
            {reservations.length === 0 ? (
                <div>No reservations found</div>
            ) : (
                reservations.map((reservation) => {
                    // Handle event as either string or object
                    const eventName = reservation.eventName || 
                        (typeof reservation.event === 'string' ? reservation.event : 
                        (reservation.event as any)?.name || 'Unknown Event');
                    
                    return (
                    <div className="bg-slate-200 rounded px-5 py-2 my-2 text-black" key={reservation._id}>
                        <div className="text-xl">Event: {eventName}</div>
                        <div className="text-sm">Tickets: {reservation.ticketAmount}</div>
                        {reservation.status && (
                            <div className="text-sm">Status: {reservation.status}</div>
                        )}
                        <div className="mt-2 flex gap-2">
                            <Link 
                                href={`/reservations/${reservation._id}/edit`}
                                className="block rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-white shadow-sm"
                            >
                                Edit
                            </Link>
                            <button 
                                className="block rounded-md bg-red-600 hover:bg-red-700 px-3 py-2 text-white shadow-sm"
                                onClick={() => handleDelete(reservation)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    );
                })
            )}
        </div>
    )
}