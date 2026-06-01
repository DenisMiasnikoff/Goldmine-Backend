# Goldmine Backend 🏆

REST API for the Goldmine social platform. Built with Node.js, Express, TypeScript and MongoDB.

## 🛠️ Tech Stack
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Nodemailer

## 🚀 API Endpoints

### Auth
- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `POST /api/v1/users/forgotPassword`
- `PATCH /api/v1/users/resetPassword/:token`

### Users
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/updateMe`
- `DELETE /api/v1/users/deleteMe`
- `GET /api/v1/users/profile/:username`
- `PATCH /api/v1/users/equipItem/:itemId`

### Dungeons
- `GET /api/v1/dungeons`
- `POST /api/v1/dungeons`
- `GET /api/v1/dungeons/:id`
- `PATCH /api/v1/dungeons/:id`
- `PATCH /api/v1/dungeons/:id/subscribe`
- `GET /api/v1/dungeons/my-dungeons`

### Posts
- `GET /api/v1/posts`
- `GET /api/v1/dungeons/:dungeonId/posts`
- `POST /api/v1/dungeons/:dungeonId/posts`
- `GET /api/v1/posts/:id`
- `PATCH /api/v1/posts/:id/upvote`
- `GET /api/v1/posts/search?q=query`

### Comments
- `GET /api/v1/posts/:postId/comments`
- `POST /api/v1/posts/:postId/comments`
- `PATCH /api/v1/posts/:postId/comments/:commentId/upvote`

### Items
- `GET /api/v1/items`
- `POST /api/v1/items/buy/:itemId`

## 🚦 Getting Started

```bash
git clone https://github.com/DenisMiasnikoff/Goldmine-Back
cd Goldmine-Back
npm install
npm run dev
```

Create `dev-data/config.env`:
DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
PORT=5000
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password

## 📝 License
MIT