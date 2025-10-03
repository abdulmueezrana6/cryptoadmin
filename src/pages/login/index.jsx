import { collection, doc, getDoc, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";

const Login = () => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    try{ 
      const result = await getDoc(doc(db, "key", inputValue));
      console.log(result.exists())
      if (result.exists()) {
        // If the input matches the admin code, redirect to the admin page
        localStorage.setItem("logined", true);
        navigate("/admin");
      } else {
        setError("Invalid Code. Please try again!");
      }
    } 
    catch(e) 
    { 
      console.log(e); 
    }
  };

  useEffect(() => {
    if(localStorage.getItem("logined") === 'true') {
        navigate("/admin");
    }
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        Admin Page
      </h1>
      {error && (
        <div className="p-4 rounded bg-red-200 text-red-800">{error}</div>
      )}
      <div className="flex gap-4">
        <input
          type="password"
          placeholder="Enter your code"
          className="w-1/2 p-2 border rounded outline-none focus:ring focus:border-blue-500"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
