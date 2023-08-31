import React from "react";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { doc, updateDoc, serverTimestamp, getFirestore } from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBvPlBYpUcHDYwZvoW3qunshaxQY54gFMg",
  authDomain: "chatroom-7c61c.firebaseapp.com",
  projectId: "chatroom-7c61c",
  storageBucket: "chatroom-7c61c.appspot.com",
  messagingSenderId: "1041643796394",
  appId: "1:1041643796394:web:ec86fda5614c81e49f5dd3",
  measurementId: "G-CVDRM6RXSV",
});

const auth = firebase.auth();
const firestore = firebase.firestore;

//Note: This app was built following a fireship tutorial: https://www.youtube.com/watch?v=zQyrwxMPm88&ab_channel=Fireship

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header"></header>

      <section>{user ? <Chatroom /> : <Signin />}</section>
    </div>
  );
}

function Signin() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Signin with Google</button>;
}

function SignOut() {
  return auth.currentUser && <button onClick={() => auth.SignOut}>Sign Out</button>;
}

function Chatroom() {
  const messagesRef = firestore().collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const dummy = useRef();

  const sendMessage = async (e) => {
    //creates message from formvalue
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage} className="form">
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button className="sendMessage" type="submit" disabled={!formValue}>
          Send Message
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={"message ${messageClass}"}>
      <img src={photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"} />
      <p>{text}</p>
    </div>
  );
}

export default App;
