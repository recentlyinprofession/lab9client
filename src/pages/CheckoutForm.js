import React from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import CardSection from "./CardSection";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  let hasError, errorMessage, message;

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmCardPayment(
      "pi_1Gm0CSGE8fibwm8dTBxJILlo_secret_ETkNbykKqTD4qYHIUXMEny0aZ",
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Jenny Rosen",
          },
        },
      }
    );

    if (result.error) {
      hasError = true;
      errorMessage =
        "Some wrong happend with your payment, try to reload page and do payment again.";
      console.log(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === "succeeded") {
        hasError = false;
        message = "Payment succeed!";
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardSection />
      <button disabled={!stripe}>Confirm order</button>
      {hasError ? <h3>{errorMessage}</h3> : <h3>{message}</h3>}
    </form>
  );
}
