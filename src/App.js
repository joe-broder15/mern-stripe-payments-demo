import React from "react";
import ReactDOM from "react-dom";
import PaymentComponent from "./PaymentWidget/PaymentComponent";
import { Container, Jumbotron, Button, Image } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { loadStripe } from "@stripe/stripe-js";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

export default function App() {
    return (
        <Router>
            {/* A <Switch> looks through its children <Route>s and
				renders the first one that matches the current URL. */}
            <Switch>
                <Route path="/payments">
                    <Container>
                        <PaymentComponent
                            keys={{
                                stripe: "YOUR STRIPE PUBLIC KEY HERE"
                            }}
                        />
                    </Container>
                </Route>
                <Route path="/">
					<Container style={{padding:"10px"}}>
						<Jumbotron>
							<h1>Save the Jackalopes</h1>
                            <Image src="jackalope.png" fluid/>
							<h3>
								This is an example homepage for our charity website! 
                                To see the payments in action click the button below!
							</h3>
							<Link to="/payments" type="Button">
								<Button variant="success">Make a payment</Button>
							</Link>
							
                    </Jumbotron>
					</Container>
                    
                </Route>
            </Switch>
        </Router>
    );
}
