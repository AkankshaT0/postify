# 📱 Postify

Postify is a full-stack social media web application where users can create, edit, delete, like, comment on, and share posts. It includes secure authentication, user profiles, follow/unfollow, notifications, image uploads, search, tags, and pagination.

## 🚀 Features

- 🔐 User Registration & Login
- 🔑 JWT Authentication & Authorization
- 📝 Create, Edit & Delete Posts
- ❤️ Like / Unlike Posts
- 💬 Comments
- 👥 Follow / Unfollow Users
- 🔔 Notifications
- 🖼️ Image Upload with Cloudinary
- 🔍 Search & Tags
- 📄 Pagination & Sorting
- 👤 User Profiles
- 📊 User Dashboard
- 📱 Responsive Bootstrap UI

## 🛠️ Tech Stack

**Frontend:** EJS, HTML, CSS, Bootstrap, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**Image Storage:** Cloudinary  
**Tools:** Git, GitHub, Render

## 📂 Project Structure

```text
Postify/
├── models/
├── routes/
├── middleware/
├── config/
├── utils/
├── views/
├── public/
├── index.js
├── package.json
└── .env

⚙️ Installation

Clone the repository:

git clone https://github.com/AkankshaT0/postify.git
cd postify

Install dependencies:

npm install

Create a .env file:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Start the application:

npm run dev

Open:

http://localhost:3000
🌐 Deployment

The application can be deployed using:

Render – Backend & EJS application
MongoDB Atlas / Cloud MongoDB – Database
Cloudinary – Image storage


👩‍💻 Author -- Akanksha Tambe
