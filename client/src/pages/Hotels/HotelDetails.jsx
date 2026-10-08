import Rooms from '../Rooms/Rooms.jsx'

/**
 * HotelDetails renders the Room / Hotel Detailed View page
 * using the property ID passed from the URL route.
 */
export default function HotelDetails({ hotelId }) {
  return <Rooms hotelId={hotelId} />
}