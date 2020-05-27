# MERN Stripe Payments Demo (ARTICLE COMING SOON)


This is a quick and easy demonstration of how to include payments in your MERN app. We use Stripe to handle the payments, and specifically the stripe elements smart UI components. This example only uses test keys, but to make live transactions all you need to do is activate your stripe account and switch out the appropriate keys.

This app was bootstrapped `with create-react-app`, and depends on react, express, react-bootstrap, axios, and stripe.

## Steps to run this demo

1. **Clone or dowload the repository**

2. **Open your terminal and run `npm install` at the project root**

3. **Sign up for Stripe and log intot he dasboard** [here](https://dashboard.stripe.com/login)

4. **Click the dropdown menu at the top left of the dashboard and create a new account**

5. **After creating your account copy over your keys into the code:**

   In [server.js](/server/server.js) copy your secret key into line 9
    ```javascript
       const stripe = require('str')('YOUR STRIPE SECRET KEY');
     ```
   
    
   Then do the same with your public key on line 21 of [App.js](/src/App.js)
   ```javascript
      <PaymentComponent
          keys={{
              stripe: "YOUR STRIPE PUBLIC KEY HERE"
          }}
      />
      
    ```
    
6. **Run `node server/server.js` to start the development server**

7. **Run `npm run start` to start the react client**

8. **Visit** http://localhost:3000 **to check out the demo**

9. **For any credit card transactions made with the test keys, use the number `4242 4242 4242 4242` with any CCV, expiration date, and zip**

10. **Check out your transactions under "payments" in the stripe dashboard!**
   
