# 🌾 Kisan Bazar - Agriculture Marketplace

Kisan Bazar is a full-stack web application designed to bridge the gap between farmers and consumers. It empowers farmers to sell fresh produce directly to buyers, ensuring fair prices and transparency.

## 🚀 Key Features

### 🛡️ Farmer Verification & Trust
- **Verification System**: Farmers must submit proof (RTC/Kisan Card) during registration.
- **Admin Verification**: Admins can verify/unverify farmers from the dashboard.
- **Badge System**:
  - **Verified**: Green checkmark for verified farmers.
  - **Trusted**: Blue shield for high-rated farmers (>4.5 stars, >10 reviews).

### ⭐ Rate & Review
- Consumers can rate (1-5 stars) and review farmers.
- Average ratings and review counts are prominently displayed on profiles.

### 💰 Pricing & Bulk Discounts
- Farmers can set **Bulk Discounts** (e.g., "Buy 10kg, get 15% off").
- Discounts are automatically calculated in the cart and order summary.

### 👮 Admin Dashboard
- **User Management**: View, verify, or delete users/farmers.
- **Order Overview**: Track order statuses and revenue.
- **Statistics**: Visual breakdown of users and orders.

### 🛒 Shopping Experience
- **Smart Cart**: Validates stock and prevents mixing items from different farms (optional).
- **Invoicing**: Automatic PDF invoice generation for orders.
- **Order History**: Detailed tracking of past purchases.

### 📚 Knowledge Hub
- **Farmer Resources**: Dedicated section with weather updates and farming guides.

---

## 🛠️ Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Tools**: PDFKit (Invoicing), React Icons, React Toastify

---

## ⚙️ Usage & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB URI

### 1. Clone the Repository
```bash
git clone https://github.com/Shaman071/Kisaan-Bazar.git
cd kisanbazar-master
```

### 2. Environment Setup
Create a `.env` file in the `api` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Install Dependencies
**Root/API**:
```bash
cd api
npm install
```

**Client**:
```bash
cd client
npm install
```

### 4. Seed Database (Optional)
Populate the database with sample farmers, products, and categories.
```bash
node api/seed_comprehensive.js
```

### 5. Run the Application
**Backend**:
```bash
cd api
npm run dev
```

**Frontend**:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to browse the app.

---

## 👥 Contributors
- **B G Shaman**
- **Bimal K L**
- **Abhay Praveen Hegde**
- **Akshay Vinayak Hegde**

---

## 📄 License
This project is licensed under the ISC License.
