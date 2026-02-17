// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';

// // const Login = () => {
// //     const [form, setForm] = useState({ email: '', password: '' });
// //     const navigate = useNavigate();

// //     const handleLogin = async (e) => {
// //     e.preventDefault();
// //     try {
// //         const res = await axios.post('http://localhost:5000/api/users/login', form);
// //         localStorage.setItem('user', JSON.stringify(res.data));

// //         // Check the role stored during the Landing page click
// //         const role = localStorage.getItem('preferredRole');
        
// //         if (role === 'seller') {
// //             navigate('/seller-hub');
// //         } else {
// //             navigate('/shop');
// //         }
// //     } catch (err) {
// //         alert("Login failed! 500 Error? Check your backend terminal.");
// //     }
// // };

// //   return (
// //         <form onSubmit={handleLogin}>
// //             <input 
// //                 type="email" 
// //                 placeholder="College Email" 
// //                 onChange={(e) => setForm({ ...form, email: e.target.value })} 
// //                 required 
// //             />
// //             <input 
// //                 type="password" 
// //                 placeholder="Password" 
// //                 onChange={(e) => setForm({ ...form, password: e.target.value })} 
// //                 required 
// //             />
// //             <button type="submit">Login</button>
// //         </form>
// //     );
// // };


// // export default Login;
// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import API from "../api/axios";
// // import { useAuth } from "../app/authContext";
// // const Login = () => {
// //   const navigate = useNavigate();

// //   const [formData, setFormData] = useState({
// //     email: "",
// //     password: ""
// //   });

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const res = await API.post("/auth/login", formData);

// //       // Save token
// //       localStorage.setItem("token", res.data.token);

// //       alert("Login successful!");
// //       navigate("/marketplace");
// //     } catch (error) {
// //       alert(error.response?.data?.message || "Login failed");
// //     }
// //   };

// //   return (
// //     <div style={styles.container}>
// //       <h2>Login</h2>

// //       <form style={styles.form} onSubmit={handleSubmit}>
// //         <input
// //           name="email"
// //           type="email"
// //           placeholder="Email"
// //           onChange={handleChange}
// //           style={styles.input}
// //         />

// //         <input
// //           name="password"
// //           type="password"
// //           placeholder="Password"
// //           onChange={handleChange}
// //           style={styles.input}
// //         />

// //         <button style={styles.button}>Login</button>
// //       </form>

// //       <p>
// //         Don’t have an account? <Link to="/register">Register</Link>
// //       </p>
// //     </div>
// //   );
// // };

// // export default Login;
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import API from "../api/axios";
// import { useAuth } from "../app/authContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // ✅ USE THIS

//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await API.post("/auth/login", formData);

//       // ✅ SET AUTH CONTEXT
//       login(
//         {
//           id: res.data.userId,
//           name: res.data.username
//         },
//         res.data.token
//       );

//       navigate("/marketplace");
//     } catch (error) {
//       alert(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2>Login</h2>

//       <form style={styles.form} onSubmit={handleSubmit}>
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           onChange={handleChange}
//           style={styles.input}
//         />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           onChange={handleChange}
//           style={styles.input}
//         />

//         <button style={styles.button}>Login</button>
//       </form>

//       <p>
//         Don’t have an account? <Link to="/register">Register</Link>
//       </p>
//     </div>
//   );
// };

// export default Login;


// const styles = {
//   container: {
//     maxWidth: "400px",
//     margin: "80px auto",
//     textAlign: "center",
//     fontFamily: "Arial"
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "15px",
//     marginTop: "20px"
//   },
//   input: {
//     padding: "10px",
//     fontSize: "16px"
//   },
//   button: {
//     padding: "10px",
//     backgroundColor: "#000",
//     color: "#fff",
//     border: "none",
//     cursor: "pointer"
//   }
// };
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../app/authContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ USE THIS

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);

      // ✅ SET AUTH CONTEXT (fixed to match backend response)
      login(
        {
          id: res.data.user.id,
          name: res.data.user.name
        },
        res.data.token
      );

      navigate("/marketplace");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to CampusTrade</h2>
        <p className="auth-subtitle">Sign in to access your campus marketplace</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="College email"
            onChange={handleChange}
            className="auth-input"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="auth-input"
            required
          />

          <button className="btn btn-primary" type="submit">Login</button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
