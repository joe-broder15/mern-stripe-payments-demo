import React, { useState } from "react";
import { useHistory, Redirect, Link } from "react-router-dom";
import {
    CardElement,
    useElements,
    useStripe,
    Elements,
} from "@stripe/react-stripe-js";
import { Form, Modal, Button } from "react-bootstrap";
import Field from "./Field";
//css provided by stripe to format elements

const axios = require("axios");

//credit card element specific styling
const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
			fontSize: "18px",
			color: "#424770",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": {
                   color: '#cccccc',
            },
            "::placeholder": {
                   color: '#888',
            },
        },
        invalid: {
            iconColor: "red",
            color: "red",
        },
    },
};

//scredit card button sub component
const CardField = ({onChange}) => (
    <div className="FormRow">
      <CardElement options={CARD_OPTIONS} onChange={onChange} />
    </div>
  );

//submit button sub component
const SubmitButton = ({ processing, error, children, disabled }) => (
    <button
        className={`SubmitButton ${error ? "SubmitButton--error" : ""}`}
        type="submit"
        disabled={processing || disabled}
    >
        {processing ? "Processing..." : children}
    </button>
);

//component declaration
export default function CreditCardForm(props) {

    let history = useHistory();

    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false)
    const [cardComplete, setCardComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [price, setPrice] = useState(0);
    const [billingDetails, setBillingDetails] = useState({
        email: '',
        name: '',
        address: {    
            line1: '',
            line2: '',
        }
    });

    //resets state on completion
    const reset = () => {
        setError(null);
        setProcessing(false);
        setPaymentMethod('');
        setPrice(0);
        setSuccess(false);
        setCardComplete(false);
        setBillingDetails({
        email: '',
        name: '',
        address: {
            line1: '',
            line2: ''
        }
        });
    };

    /*
	This code runs when a card transaction is submitted
	There are three main components to this function:
		
		1. create a new stripe payment method using the form data
		
		2. get a payment intent from the server using the speficied price

		3. confirm the payment intent using the new payment method

		4. send a confiemation to the server if the payment succeeded
	*/
    const handleSubmit = async (event) => {
        //prevent default form values
        event.preventDefault();

        ///if stripe api is loaded
        if (!stripe || !elements) {
            return;
        }

        //handle errors
        if (error) {
            console.log(error);
            elements.getElement("card").focus();
            return;
        }

        if(price == 0) {
            return;
        }

        //start processing animation on submit button
        if (cardComplete) {
            setProcessing(true);
        } else {
            return;
        }
		//STEP 1:
        //create new payment method based on card and form information
        const payload = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement),
            billing_details: billingDetails
        });

        //handle errors, otherwise set the new payment method in state
        if (payload.error) {
            setError(payload.error);
            return;
        } 
		
		//STEP 2:
        //create a new payment request and get irs client secret + id from the server
        const intentData = await axios
            .post("http://localhost:7000/stripe", {
                //include the bet amount
                price: price,
            })
            .then(
                (response) => {
                    //SUCCESS: put client secret and id into an object and return it
                    return {
                        secret: response.data.client_secret,
                        id: response.data.intent_id,
                    };
                },
                (error) => {
                    //ERROR: log the error and return
                    setError(error)
                    return error;
                }
            );
		
		//STEP 3:
        //confirm the payment and use the new payment method
        const result = await stripe.confirmCardPayment(intentData.secret, {
            payment_method: payload.paymentMethod.id,
        });

        //handle errors again
        if (result.error) {
            setError(result.error);
            return
        }
		
		//STEP 4:
        // The payment has been processed! send a confirmation to the server
        if (result.paymentIntent.status === "succeeded") {
            const confirmedPayment = await axios
                .post("http://localhost:7000/confirm-payment", {
                    //include id of payment
                    payment_id: intentData.id,
                    payment_type: "stripe",
                    //send any other data here
                })
                .then(
                    (response) => {
                        //SUCCESS: return the response message
                        return response.data.success;
                    },
                    (error) => {
                        //ERROR:
                        console.log(error);
                        setError(error)
                        return error;
                    }
                );

            //reset the state and show the success message
            if (confirmedPayment) {

                //reset the form
                
                reset();
                /*
                 YOUR APPLICATION SPECIFIC CODE HERE:
                 for this example all we do is render a modal
                */
                setSuccess(true);
            }
        }
    }

    

    //render
    return (
        // the credit card form
        <Form className="Form" onSubmit={handleSubmit}>

            {/* Error modal */}
            <Modal show={error!=null}>
                <Modal.Header>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{error}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={(event)=>{setError(null)}}>Close</Button>    
                </Modal.Footer>
            </Modal>


            {/* success banner, only shows after confirmation */}
            <Modal show={success}>
                <Modal.Header>
                    <Modal.Title>Payment Succeeded</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your card payment has been confirmed
                </Modal.Body>
                <Modal.Footer>
                        <Button variant="success" onClick={ () =>{history.push("/")}}>Close</Button>
                    
                </Modal.Footer>
            </Modal>

            {/* Bet amount field */}
            <Field
                label="Donation Amount"
                id="bet"
                type="number"
                placeholder="0"
                required
                autoComplete="tel"
                min="1"
                value={price}
                onChange={(event) => {
                    if (event.target.value >= 0){
                        setPrice(event.target.value);
                    }
                }}
            />

            {/* Credit Card Payment Form */}
            <fieldset className="FormGroup">
                {/* name field */}
                <Field
                    label="Name"
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                    value={billingDetails.name}
                    onChange={(event) => {
                        setBillingDetails({...billingDetails, name: event.target.value});
                    }}
                />
                {/* email field */}
                <Field
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="janedoe@gmail.com"
                    required
                    autoComplete="email"
                    value={billingDetails.email}
                    onChange={(event) => {
                        setBillingDetails({...billingDetails, email: event.target.value});
                    }}
                />
                {/* address fields */}
                <Field
                    label="Billing Address"
                    id="line1"
                    type="address-line1"
                    placeholder="1234 your street"
                    required
                    autoComplete="address-line1"
                    value={billingDetails.address.line1}
                    onChange={(event) => {
                        setBillingDetails({...billingDetails, 
                            address: {
                                line1: event.target.value, 
                                line2: billingDetails.address.line2
                            }
                        });
                    }}
                />
                {/* address line 2 */}
                <Field
                    label=""
                    id="line2"
                    type="address-line2"
                    placeholder="building/suite number"
                    autoComplete="address-line2"
                    value={billingDetails.address.line2}
                    onChange={(event) => {
                        setBillingDetails({...billingDetails, 
                            address: {
                                line1: billingDetails.address.line1, 
                                line2: event.target.value, 
                            }
                        });
                    }}
                />
            </fieldset>

            {/* credit card field and submit button */}
            <fieldset className="FormGroup">
                {/* card */}
                <CardField
                    onChange={(event) => {
                        setError(event.error);
                        setCardComplete(event.complete);
                    }}
                />
                
            </fieldset>
            {/* submit */}
            <SubmitButton
                    processing={processing}
                    error={error}
                    disabled={!stripe}
                >
                    Make Payment
            </SubmitButton>
        </Form>
    );
    
}
