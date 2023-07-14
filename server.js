require("dotenv").config();

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

const paypal = require("@paypal/checkout-server-sdk");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

const sepupBalance = new Map([
  [1, { price: 100, name: "Balance $100" }],
  [2, { price: 200, name: "Balance $100" }],
]);

app.get("/", (req, res) => {
  res.render("index", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  });
});

app.post("/topup-account", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  const total = req.body.items.reduce((sum, item) => {
    return sum + sepupBalance.get(item.id).price;
  }, 0);
  console.log(req.body);
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
        amount: {
          currency_code: "USD",
          value: total.toString(),
        },
        shipping: {
          address: {
            address_line_1: "123 Shipping Street",
            admin_area_2: "Shipping City",
            admin_area_1: "Shipping State",
            postal_code: "12345",
            country_code: "US",
          },
        },
      },
    ],

    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          payment_method_selected: "PAYPAL",
          brand_name: "SERPUP",
          locale: "en-US",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: "http://localhost:3000/",
          cancel_url: "http://localhost:3000/",
        },
      },
    },
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000);
