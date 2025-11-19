interface EventItem {
    _id: string,
    name: string,
    description: string,
    eventDate: string,
    venue: string,
    organizer: string,
    availableTicket: number,
    posterPicture: string,
    __v: number,
    id: string
  }
  
  interface EventJson {
    success: boolean,
    count: number,
    pagination: Object,
    data: EventItem[]
  }

  interface ReservationItem {
    _id?: string;
    event: string;
    eventName?: string;
    ticketAmount: number;
    user?: string;
    status?: string;
  }

  interface UserItem {
    _id: string;
    name: string;
    email: string;
    tel: string;
    role: string;
  }