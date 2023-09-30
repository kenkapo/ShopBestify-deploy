const { Order } = require("../model/Order");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


function discountedPrice(item) {
  return Math.round(item.price * (1 - item.discountPercentage / 100), 2)
}


exports.fetchOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ user: userId });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  } 
};

exports.createOrder = async (req, res) => {
  const order = new Order(req.body);
  try {
    const doc = await order.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllOrders = async (req, res) => {
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let query = Order.find({ deleted: { $ne: true } });
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });


  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  const totalDocs = await totalOrdersQuery.count().exec();
  console.log({ totalDocs });

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    res.set('X-Total-Count', totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};


exports.sendOrder = (req, res) => {

  const { id, items, selectedAddress, totalAmount, totalItems } = req.body;
  const img = "https://i.ibb.co/nkb1cRS/ecommerce-website-logo-removebg-preview.png";

  let config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  }

  let transporter = nodemailer.createTransport(config);


  function genHtml(items_arr)
  {
    var html=[];
    items_arr.forEach(function (item) {
      (html.push(`<tr>
        <td>${item.product.title}</td>
        <td>${item.product.description}</td>
        <td>${item.quantity}</td>
        <td>$${discountedPrice(item.product)}</td>
        <td>$${discountedPrice(item.product) * item.quantity}</td>
    </tr>`))})
    return html.join("");
  }

  const htmlContent = `
    <html>
    <head>
        <title>Invoice</title>
        <style>
            /* Add your custom CSS styles here */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border: 1px solid #ddd;
                box-shadow: 0 2px 5px #ccc;
            }
            .header {
                text-align: center;
            }
            .company-info {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
            }
            .company-logo {
                max-width: 100px;
                text-align: center;
            }
            .company-name {
                font-size: 24px;
                text-align: center;
            }
            .bill-info {
                border-top: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                padding: 10px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f2f2f2;
            }
            .total {
                margin-top: 20px;
                text-align: right;
            }
            .address {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="company-info">
                <img class="company-logo" src=${img} alt="Company Logo">
                <h2 class="company-name">ShopBestify</h2>
            </div>
            <div class="header">
                <h1>Invoice</h1>
            </div>
            <div class="bill-info">
                <p><strong>Bill To:</strong> ${selectedAddress.name}</p>
                <p><strong>Bill To Address:</strong> ${selectedAddress.street}, ${selectedAddress.city},${selectedAddress.pinCode}</p>
                <p><strong>Order Number:</strong> ${id}</p>
                <p><strong>Phone:</strong> ${selectedAddress.phone}</p>
            </div>
            <table >
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    
                    ${genHtml(items)}
                    
                </tbody>
            </table>
            <div class="total">
                <p><strong>Total Items:</strong> ${totalItems}</p>
                <p><strong>Total Amount:</strong> $${totalAmount}</p>
            </div>
        </div>
    </body>
    </html>
    
  `;

  let message = {
    from: { name: "ShopBestify", address: process.env.EMAIL },
    to: selectedAddress.email,
    subject: `Order #${id}`,
    html: htmlContent
  }

  transporter.sendMail(message).then(() => {
    return res.status(201).json({
      msg: "you should receive an email"
    })
  }).catch(error => {
    return res.status(500).json({ error })
  })


}