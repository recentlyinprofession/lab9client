import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import Button from "../components/button";
import { GET_LAUNCH } from "./cart-item";
import * as GetCartItemsTypes from "../pages/__generated__/GetCartItems";
import * as BookTripsTypes from "./__generated__/BookTrips";
import CardSection from "./CardSection";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";


export const BOOK_TRIPS = gql`
  mutation BookTrips($launchIds: [ID]!) {
    bookTrips(launchIds: $launchIds) {
      success
      message
      launches {
        id
        isBooked
      }
      clientSecret
    }
  }
`;


interface BookTripsProps extends GetCartItemsTypes.GetCartItems {}

const BookTrips: React.FC<BookTripsProps> = ({ cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    const secret = await bookTrips().then((result:any) => result.data.bookTrips.clientSecret);
    console.log(elements.getElement(CardElement)) 

    const result = await stripe.confirmCardPayment(
      secret.toString(),
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Jenny Rosen",
          },
        },
      }
    );
    if (result.error || !result ) {
      alert(
        "Something wrong happend with your payment, try to reload page and do payment again.")
      console.log(result.error.message);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        alert("Payment succeed!");
      }
    }  
    
  }
  const [
    bookTrips, { data }
  ] = useMutation<
    BookTripsTypes.BookTrips, 
    BookTripsTypes.BookTripsVariables
  > (
    BOOK_TRIPS,
    {
      variables: { launchIds: cartItems },
      refetchQueries: cartItems.map(launchId => ({
        query: GET_LAUNCH,
        variables: { launchId },
      })),
      update(cache) {
        setTimeout(() => cache.writeData({ data: { cartItems: [] } }), 300);
      }
    } 
  );

return data && data.bookTrips && !data.bookTrips.success
    ? <p data-testid="message">{data.bookTrips.message}</p>
    : (<form onSubmit = {handleSubmit}>
      <CardSection/>
      <Button 
        type = "submit"
        data-testid="book-button">
        Book All
      </Button>

      
      </form>
    );
}
export default BookTrips;