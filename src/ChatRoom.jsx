import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, getDocs, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isCloudinaryConfigured } from "./config";

export default function ChatRoom() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionError, setConnectionError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showParticipants, setShowParticipants] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Whether the current user has any rooms
  const hasRooms = rooms.length > 0;

  // Cloudinary base endpoint (computed without useMemo to avoid removed state)
  const cloudinaryEndpoint = isCloudinaryConfigured()
    ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`
    : "";

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async user => {
      if (!user) return navigate("/login");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setCurrentUser(userDoc.data());
    });

    // Subscribe to the user's rooms via roomMembers
    let unsubscribeRooms = () => {};
    auth.onAuthStateChanged(user => {
      if (!user) return;
      const rmQ = query(collection(db, "roomMembers"), where("userId", "==", user.uid));
      unsubscribeRooms = onSnapshot(rmQ, async (snap) => {
        const roomIds = [...new Set(snap.docs.map(d => d.data().roomId))];
        // Fetch room documents
        const roomDocs = await Promise.all(roomIds.map(async (id) => await getDoc(doc(db, "rooms", id))));
        const fetchedRooms = roomDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
        setRooms(fetchedRooms);
        if (!selectedRoom && fetchedRooms.length > 0) {
          setSelectedRoom(fetchedRooms[0]);
        }
      });
    });

    return () => { unsubscribeRooms(); unsubscribeAuth(); }
  }, []);

  // Subscribe to messages: if room selected → scoped; else → legacy global chat
  useEffect(() => {
    // If the user hasn't joined any rooms, don't subscribe to any messages.
    if (!hasRooms) {
      setMessages([]);
      return;
    }

    // Only subscribe to messages for the currently selected room. Global (all-room) feed is disabled.
    if (!selectedRoom?.id) {
      setMessages([]);
      return;
    }

    const qRef = query(
      collection(db, "messages"),
      where("roomId", "==", selectedRoom.id),
      orderBy("createdAt")
    );

    // Primary subscription with orderBy
    const unsubscribe = onSnapshot(
      qRef,
      snapshot => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // Scroll to bottom after message update
        queueMicrotask(() => endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }));
      },
      err => {
        console.error("Realtime messages error:", err);
        // Fall back without orderBy if index is required or another precondition fails
        if (err?.code === "failed-precondition" || err?.message?.includes("index")) {
          const fallbackRef = query(collection(db, "messages"), where("roomId", "==", selectedRoom.id));
          return onSnapshot(fallbackRef, snap => {
            const docs = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || 0;
                const tb = b.createdAt?.toMillis?.() || 0;
                return ta - tb;
              });
            setMessages(docs);
            queueMicrotask(() => endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }));
          });
        }
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [selectedRoom?.id, hasRooms]);

  // Subscribe to participants for the selected room
  useEffect(() => {
    if (!selectedRoom) { setRoomParticipants([]); return; }
    const q = query(collection(db, "roomMembers"), where("roomId", "==", selectedRoom.id));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const members = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const userDoc = await getDoc(doc(db, "users", data.userId));
          const userData = userDoc.data() || {};
          return { id: d.id, userId: data.userId, name: userData.name, role: userData.role };
        })
      );
      setRoomParticipants(members);
    });
    return () => unsubscribe();
  }, [selectedRoom?.id]);

  const generateRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (currentUser.role !== "Admin") { alert("Only admins can create rooms."); return; }
    const code = generateRoomCode();
    const roomRef = await addDoc(collection(db, "rooms"), {
      name: newRoomName.trim() || "New Room",
      code,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "roomMembers"), {
      roomId: roomRef.id,
      userId: user.uid,
      joinedAt: serverTimestamp(),
    });
    setSelectedRoom({ id: roomRef.id, name: newRoomName.trim() || "New Room", code });
    setNewRoomName("");
    setShowMobileSidebar(false);
  };

  const handleJoinRoom = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const q = query(collection(db, "rooms"), where("code", "==", code));
    const snap = await getDocs(q);
    if (snap.empty) { alert("Invalid room code."); return; }
    const roomDoc = snap.docs[0];
    await addDoc(collection(db, "roomMembers"), {
      roomId: roomDoc.id,
      userId: user.uid,
      joinedAt: serverTimestamp(),
    });
    setSelectedRoom({ id: roomDoc.id, ...roomDoc.data() });
    setJoinCode("");
    setShowMobileSidebar(false);
  };

  const canManageRoom = (room) => {
    const user = auth.currentUser;
    if (!user || !room) return false;
    return currentUser.role === "Admin" || room.createdBy === user.uid;
  };

  const handleDeleteRoom = async (room) => {
    if (!room) return;
    if (!canManageRoom(room)) { alert("You don't have permission to delete this room."); return; }
    const confirmDelete = confirm(`Delete room "${room.name}"? This will remove its messages and memberships.`);
    if (!confirmDelete) return;

    // Delete roomMembers
    const membersSnap = await getDocs(query(collection(db, "roomMembers"), where("roomId", "==", room.id)));
    await Promise.all(membersSnap.docs.map(d => deleteDoc(d.ref)));

    // Delete messages of this room
    const msgsSnap = await getDocs(query(collection(db, "messages"), where("roomId", "==", room.id)));
    await Promise.all(msgsSnap.docs.map(d => deleteDoc(d.ref)));

    // Delete the room document
    await deleteDoc(doc(db, "rooms", room.id));

    // Update local UI
    const remaining = rooms.filter(r => r.id !== room.id);
    setRooms(remaining);
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(remaining[0] || null);
    }
  };

  const handleSend = async () => {
    if (!hasRooms) {
      alert("Please join a team to send messages.");
      return;
    }

    if (!selectedRoom?.id) {
      alert("Please select a room to send messages.");
      return;
    }

    if (!text.trim()) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Get fresh user data if needed
    let senderName = currentUser.name;
    let senderRole = currentUser.role;
    
    if (!senderName || !senderRole) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      senderName = userData?.name || "Unknown User";
      senderRole = userData?.role || "Unknown Role";
    }
    
    await addDoc(collection(db, "messages"), {
      text,
      uid: user.uid,
      roomId: selectedRoom?.id || null,
      senderName: senderName,
      senderRole: senderRole,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!hasRooms) {
      alert("Please join a team to upload files.");
      e.target.value = "";
      return;
    }

    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);

    // Check file size (limit to 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size too large. Please choose a file smaller than 10MB.");
      return;
    }

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to upload files.");
      return;
    }

    console.log("User authenticated:", user.uid);
    console.log("Current user data:", currentUser);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setConnectionError("");
      if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
      }
      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      
      // Determine resource type based on file type
      let resourceType = "image"; // default
      if (file.type.startsWith("video/")) {
        resourceType = "video";
      } else if (file.type.includes("pdf") || file.name.endsWith(".pdf")) {
        resourceType = "raw";
      } else if (file.type.includes("pptx") || file.name.endsWith(".pptx")) {
        resourceType = "raw";
      }

      console.log("Uploading to Cloudinary with resource type:", resourceType);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      // Upload to Cloudinary
      const cloudinaryUrl = `${cloudinaryEndpoint}/${resourceType}/upload`;
      
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} ${errText}`);
      }

      const data = await response.json();
      console.log("Cloudinary response:", data);

      if (!data.secure_url) {
        throw new Error("No secure URL returned from Cloudinary");
      }

      setUploadProgress(100);

      // Get fresh user data if needed
      let senderName = currentUser.name;
      let senderRole = currentUser.role;
      
      if (!senderName || !senderRole) {
        console.log("Fetching fresh user data...");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        senderName = userData?.name || "Unknown User";
        senderRole = userData?.role || "Unknown Role";
        console.log("Fresh user data:", { senderName, senderRole });
      }
      
      console.log("Saving message to Firestore...");
      
      // Save message with Cloudinary URL to Firestore
      await addDoc(collection(db, "messages"), {
        text: text || "",
        file: data.secure_url,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        uid: user.uid,
        roomId: selectedRoom?.id || null,
        senderName: senderName,
        senderRole: senderRole,
        createdAt: serverTimestamp()
      });
      
      console.log("Message saved successfully");
      
      setText(""); // Clear text after sending
      e.target.value = ""; // Clear file input
      setIsUploading(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error("File upload error:", error);
      console.error("Error details:", error);
      setConnectionError(error.message || "Upload failed");
      alert(`File upload failed: ${error.message}. Please check your Cloudinary configuration.`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="chat-container">
      <header>
        <div className="header-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h2>{selectedRoom ? selectedRoom.name : "Chat Rooms"}</h2>
        </div>
        <div className="profile-info">
          <div className="profile-details">
            <p className="user-name">{currentUser.name}</p>
            <p className="user-role">{currentUser.role}</p>
          </div>
          <div ref={endOfMessagesRef} />
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="chat-body">
        {showMobileSidebar && <div className="mobile-sidebar-overlay" onClick={() => setShowMobileSidebar(false)}></div>}
        <aside className={`sidebar ${showMobileSidebar ? 'mobile-sidebar-open' : ''}`}>
          <button 
            className="mobile-sidebar-close" 
            onClick={() => setShowMobileSidebar(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          {!isCloudinaryConfigured() && (
            <div className="sidebar-section">
              <p className="muted">Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env</p>
            </div>
          )}
          {currentUser.role === "Admin" && (
            <div className="sidebar-section">
              <h4>Create Room</h4>
              <input placeholder="Room name" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
              <button className="btn btn-primary" onClick={handleCreateRoom}>Create</button>
            </div>
          )}
          <div className="sidebar-section">
            <h4>Join by Code</h4>
            <input placeholder="Enter code" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <button className="btn btn-primary" onClick={handleJoinRoom}>Join</button>
          </div>
          <div className="sidebar-section">
            <h4>Your Rooms</h4>
            <div className="room-list">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`room-item ${selectedRoom?.id === room.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowMobileSidebar(false);
                  }}
                >
                  <div className="room-name">{room.name}</div>
                  {room.code && <div className="room-code">Code: {room.code}</div>}
                {canManageRoom(room) && (
                  <div>
                    <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); }}>Delete</button>
                  </div>
                )}
                </div>
              ))}
              {rooms.length === 0 && <p className="muted">No rooms yet</p>}
            </div>
          </div>
        </aside>

        <section className="chat-main">
          <div className="messages">
            {!hasRooms ? (
              <div className="no-messages-placeholder">
                <p className="muted">Please join a team to view messages.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="no-messages-placeholder">
                <p className="muted">No messages in this room yet.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isCurrentUser = msg.uid === auth.currentUser.uid;
                return (
                  <div key={msg.id} className={`message-row ${isCurrentUser ? "message-right" : "message-left"}`}>
                    <div className="message-bubble">
                      <div className="sender-info">
                        <span className="sender-name">{msg.senderName || "Unknown User"}</span>
                        <span className="sender-role">({msg.senderRole || "Unknown Role"})</span>
                        {isCurrentUser && <span className="you-indicator">(You)</span>}
                      </div>

                      {msg.text && <p className="message-text">{msg.text}</p>}

                      {msg.file && (
                        <div className="file-container">
                          {msg.fileType.startsWith("image") && (
                            <img src={msg.file} alt="Uploaded image" className="message-file" />
                          )}

                          {msg.fileType.startsWith("video") && (
                            <video src={msg.file} controls className="message-file" />
                          )}

                          {(msg.fileType.includes("pdf") || msg.fileName?.endsWith(".pdf")) && (
                            <div className="file-link-container">
                              <a href={msg.file} target="_blank" rel="noopener noreferrer" className="message-file-link">
                                📄 {msg.fileName || "View PDF"}
                              </a>
                            </div>
                          )}

                          {(msg.fileType.includes("pptx") || msg.fileName?.endsWith(".pptx")) && (
                            <div className="file-link-container">
                              <a href={msg.file} target="_blank" rel="noopener noreferrer" className="message-file-link">
                                📊 {msg.fileName || "View PPT"}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="input-area">
            {!hasRooms ? (
              <div className="no-rooms-message">
                <p className="muted">Please join a team to send messages.</p>
              </div>
            ) : (
              <>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file-input"
                    accept="image/*,video/*,.pdf,.pptx"
                    onChange={handleFile}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-input" className="file-input-label">
                    📎
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  disabled={isUploading}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  className="btn btn-send"
                  onClick={handleSend}
                  disabled={isUploading}
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : "Send"}
                </button>
                {isUploading && (
                  <div className="upload-progress" style={{width: `${uploadProgress}%`}}></div>
                )}
              </>
            )}
          </div>
        </section>

        {showParticipants && (
          <aside className="participants">
            <div className="participants-header">
              <h4>Participants</h4>
            </div>
            <div className="participants-list">
              {roomParticipants.map(p => (
                <div key={p.userId} className="participant-item">
                  <div className="participant-name">{p.name}</div>
                  <div className="participant-role">{p.role}</div>
                </div>
              ))}
              {roomParticipants.length === 0 && <p className="muted">No participants</p>}
            </div>
          </aside>
        )}
      </div>

    </div>
  );
}
