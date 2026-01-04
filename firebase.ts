
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAm38vwvf-4ytq7oTnhAqLpH9mJ_UQy1g4",
  authDomain: "svg-studio-8bedb.firebaseapp.com",
  projectId: "svg-studio-8bedb",
  storageBucket: "svg-studio-8bedb.firebasestorage.app",
  messagingSenderId: "745700748254",
  appId: "1:745700748254:web:dbdc4dbcaf631650f28b4f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const collections = {
  products: collection(db, "products"),
  orders: collection(db, "orders"),
  settings: collection(db, "settings"),
  banners: collection(db, "banners"),
  users: collection(db, "users"),
  categories: collection(db, "categories")
};

export { doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc, addDoc, getDoc };
