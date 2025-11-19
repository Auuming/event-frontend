import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ReservationState = {
    reservationItems: ReservationItem[]
}

const initialState:ReservationState = { reservationItems:[] }

export const reservationSlice = createSlice({
    name: "reservations",
    initialState,
    reducers: {
        addReservation: (state, action:PayloadAction<ReservationItem>)=>{
            const newReservation = action.payload;

            const existingIndex = state.reservationItems.findIndex(
                (item) =>
                item.event === newReservation.event &&
                item._id === newReservation._id
            );

            if (existingIndex !== -1) {
                state.reservationItems[existingIndex] = newReservation;
            } else {
                state.reservationItems.push(newReservation);
            }
        },
        removeReservation: (state, action:PayloadAction<ReservationItem>)=>{
            const remainItem = state.reservationItems.filter( obj => {
                return obj._id !== action.payload._id
            } )
            state.reservationItems = remainItem
        },
        setReservations: (state, action:PayloadAction<ReservationItem[]>)=>{
            state.reservationItems = action.payload
        },
    }
})

export const { addReservation, removeReservation, setReservations } = reservationSlice.actions
export default reservationSlice.reducer