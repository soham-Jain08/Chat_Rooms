import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Participants");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        role,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      alert("Signup successful!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save in Firestore if first-time login
      const docRef = doc(db, "users", user.uid);
      const docSnap = await docRef.get?.(); // Firestore v9 may need getDoc
      if (!docSnap || !docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          role: "Participants",
          createdAt: serverTimestamp(),
        });
      }
      navigate("/chat");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Signup</h2>
      <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="Participants">Participants</option>
        <option value="Admin">Admin</option>
      </select>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn btn-primary" onClick={handleSignup}>Signup</button>
      <button className="btn btn-google" onClick={handleGoogleSignup}>
        <svg className="google-logo" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <path d="M17.64 9.2045c0-.6371-.0573-1.2516-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7955 2.7164v2.2581h2.9087c1.7027-1.5678 2.6836-3.874 2.6836-6.6149z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
            <path d="M3.9636 10.71c-.18-.54-.2822-1.1178-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418l3.0063-2.3318z" fill="#FBBC05"/>
            <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.4264 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6714 5.1627 6.6556 3.5795 9 3.5795z" fill="#EA4335"/>
          </g>
        </svg>
        Signup with Google
      </button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
