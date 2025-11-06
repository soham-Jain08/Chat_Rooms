# Doubt Solver Hub - Chat Application

A modern chat application built with React, Firebase, and Cloudinary for students and teachers to collaborate and solve doubts.

## 🚀 Features

- Real-time messaging with Firebase Firestore
- Room-based chat system
- File uploads (images, videos, PDFs) via Cloudinary
- Google authentication
- Role-based access (Student/Teacher)
- Modern, responsive UI with smooth animations

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account (optional, for file uploads)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chat-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

**IMPORTANT: Never commit your `.env` file to GitHub!**

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:

   **Firebase Configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project → Settings (⚙️) → Project settings
   - Scroll to "Your apps" → Web app (</> icon)
   - Copy the `firebaseConfig` values

   **Cloudinary Configuration:**
   - Go to [Cloudinary Console](https://console.cloudinary.com/)
   - Copy your **Cloud Name** from Dashboard
   - Go to Settings → Upload → Upload presets
   - Copy your **Upload Preset** name

3. Fill in `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔒 Security

**⚠️ CRITICAL: Protecting Your Credentials**

- ✅ `.env` file is already in `.gitignore` - **DO NOT** commit it
- ✅ Use `.env.example` as a template (this file is safe to commit)
- ✅ Never share your `.env` file
- ✅ If you accidentally committed credentials, **immediately rotate them** in Firebase/Cloudinary

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## 📁 Project Structure

```
chat-app/
├── src/
│   ├── App.jsx          # Welcome page
│   ├── Login.jsx        # Login component
│   ├── Signup.jsx       # Signup component
│   ├── ChatRoom.jsx     # Main chat interface
│   ├── firebase.js      # Firebase configuration
│   ├── config.js        # Cloudinary configuration
│   └── index.css        # Global styles
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── SECURITY.md          # Security guidelines
```

## 🛠️ Build for Production

```bash
npm run build
```

## 🚀 Deploy to Vercel

Your app is ready to deploy! Follow these steps:

### Quick Deploy

1. **Push your code to GitHub** (make sure `.env` is NOT committed)
2. **Go to [Vercel](https://vercel.com)** and sign in
3. **Import your GitHub repository**
4. **Add Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file (copy the values)
   - Make sure variable names start with `VITE_`
5. **Click Deploy** - Vercel will auto-detect Vite and deploy!

### Detailed Instructions

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step deployment guide.

**⚠️ Important:** 
- Never commit your `.env` file
- Add environment variables in Vercel dashboard, not in code
- All variables must start with `VITE_` to work in Vite

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Remember:** Never commit your `.env` file!

## 📄 License

This project is open source and available under the MIT License.
