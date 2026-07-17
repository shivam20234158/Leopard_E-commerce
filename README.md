
# 🛍️ Leopard – Full-Stack MERN E-Commerce Platform

Leopard is a full-stack e-commerce platform built using the MERN stack. It provides a seamless shopping experience for customers while offering a powerful admin dashboard for managing products, orders, and inventory. The application also integrates AI-powered product recommendations and secure online payments.

## 🚀 Features

### 👤 User Features

- Secure user authentication using **JWT Access & Refresh Tokens**
- Password hashing with **bcrypt**
- HTTP-only cookies for enhanced security
- Browse products with category-based filtering
- Search products by name
- Add and remove items from cart
- AI-powered product recommendations based on budget using **Gemini API**
- Secure checkout with **Stripe**
- Order placement and order history
- Responsive design for desktop and mobile

### 🛠️ Admin Features

- Admin authentication and authorization
- Product Management (Create, Read, Update, Delete)
- Inventory Management
- Order Management
- Sales Analytics Dashboard
- Revenue visualization using **Recharts**

---

## 🧰 Tech Stack

### Frontend

- React.js
- Zustand
- Axios
- Tailwind CSS
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security

- JWT Authentication
- Refresh Tokens
- HTTP-only Cookies
- bcrypt

### Third Party APIs

- Stripe API
- Gemini API

---

## 📂 Project Structure

```
Leopard_E-commerce
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── lib
│   └── server.js
│
├── frontend
│   ├── src
│   ├── public
│   └── vite.config.js
│
└── README.md
```

---

## 🔐 Authentication Flow

- User Signup/Login
- JWT Access Token generation
- Refresh Token stored securely in HTTP-only cookies
- Automatic token refresh
- Protected routes using authentication middleware

---

## 💳 Payment Flow

- Add products to cart
- Proceed to checkout
- Stripe Checkout Session
- Payment Success/Cancel handling
- Order creation after successful payment

---

## 🤖 AI Recommendation System

Users can search products naturally such as:

- Shoes under ₹3000
- Recommend laptops below ₹50000
- Best headphones under ₹5000

The application uses **Gemini API** to understand user intent and return relevant product recommendations.

---

## 📊 Admin Dashboard

Admins can:

- Manage Products
- Manage Inventory
- View Sales Analytics
- Track Orders
- Perform CRUD Operations

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=

MONGO_URI=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

STRIPE_SECRET_KEY=
CLIENT_URL=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🖥️ Installation

Clone the repository

```bash
git clone https://github.com/shivam20234158/Leopard_E-commerce.git
```

Go inside the project

```bash
cd Leopard_E-commerce
```

Install backend dependencies

```bash
cd backend
npm install
```

Install frontend dependencies

```bash
cd ../frontend
npm install
```

Run Backend

```bash
npm run dev
```

Run Frontend

```bash
npm run dev
```

---

## 🔥 Key Highlights

- MERN Stack Application
- RESTful APIs
- JWT Authentication
- Refresh Token Authentication
- HTTP-only Cookies
- Stripe Payment Integration
- Gemini AI Integration
- CRUD Operations
- Admin Dashboard
- Inventory Management
- Responsive UI

---

## 👨‍💻 Author

**Shivam Panwar**

- GitHub: https://github.com/shivam20234158
- LinkedIn: https://linkedin.com/in/shivam-panwar8477

---

## ⭐ If you like this project

Give the repository a ⭐ and feel free to contribute!
