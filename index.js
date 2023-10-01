const express = require('express');
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//console.log(typeof process.env.STRIPE_SECRET_KEY);
const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const currentUserRouter = require("./routes/CurrentUser");
const PORT = process.env.PORT || 8080;
function discountedPrice(item) {
    return Math.round(item.price * (1 - item.discountPercentage / 100), 2)
}

//middlewares

app.use(cors({
    exposedHeaders: ['X-Total-Count']
}))
app.use(express.json()); // to parse req.body


app.use('/products', productsRouter.router);
app.use('/categories', categoriesRouter.router)
app.use('/brands', brandsRouter.router)
app.use('/users', usersRouter.router)
app.use('/auth', authRouter.router)
app.use('/cart', cartRouter.router)
app.use('/orders', ordersRouter.router)
app.use("/currentuser", currentUserRouter.router);

main().catch(err => console.log(err));

async function main() {
    //await mongoose.connect(process.env.MONGO_URL);
    await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
    console.log('database connected')
}



app.post("/api/create-checkout-session", async (req, res) => {
    const order = req.body;
    console.log("order is->");
    console.log(order);
    //console.log(order.products);

    const lineItems = order.products.payload.items.map((item) => ({
        price_data: {
            currency: "usd",
            product_data: {
                name: item.product.title,
                images: [item.product.thumbnail]
            },
            unit_amount: discountedPrice(item.product) * 100,
        },
        quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        //success_url: `http://localhost:3000/order-success/${order.products.payload.id}`,
        //cancel_url: `http://localhost:3000/payment-failed`
        success_url: `https://shopbestify.onrender.com/order-success/${order.products.payload.id}`,
        cancel_url: `https://shopbestify.onrender.com/payment-failed`,
    });

    res.json({ id: session.id })
})

app.use(express.static(path.resolve(__dirname, process.env.PUBLIC_DIR)));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
});


app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})
