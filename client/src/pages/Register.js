// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';

// // const Register = () => {
// //     const [form, setForm] = useState({ username: '', email: '', password: '' });
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();

// //         // Client-side validation for nicer UX
// //         const gnitsRegex = /^\d{2}251a[a-z0-9]+@gnits\.ac\.in$/i;
// //         if (!gnitsRegex.test(form.email)) {
// //             alert('Please enter a valid GNITS email (example: 23251a05@gnits.ac.in)');
// //             return;
// //         }
// //         if (form.password.length < 6) {
// //             alert('Password must be at least 6 characters long');
// //             return;
// //         }
// //         if (form.username.trim().length < 2) {
// //             alert('Please provide a username');
// //             return;
// //         }

// //         try {
// //             const res = await axios.post('http://localhost:5000/api/auth/register', form);
// //             // Auto-login on successful registration
// //             if (res.data?.token && res.data?.user) {
// //                 localStorage.setItem('token', res.data.token);
// //                 localStorage.setItem('user', JSON.stringify(res.data.user));
// //                 alert('Registration successful! You are now logged in.');
// //                 const role = localStorage.getItem('preferredRole');
// //                 navigate(role === 'seller' ? '/seller-hub' : '/shop');
// //                 return;
// //             }
// //             alert('Registration successful! Please login.');
// //             navigate('/login');
// //         } catch (err) {
// //             // Network / server unreachable
// //             if (!err.response) {
// //                 alert('Cannot reach server. Please start the backend server by running `node index.js` inside the server folder.');
// //                 return;
// //             }

// //             // Duplicate
// //             if (err.response.status === 409) {
// //                 alert(err.response.data.message || 'Email or username already registered');
// //                 return;
// //             }

// //             // Validation errors
// //             if (err.response.status === 400) {
// //                 const details = err.response.data.errors ? Object.values(err.response.data.errors).join('; ') : err.response.data.message;
// //                 alert(details || 'Validation failed');
// //                 return;
// //             }

// //             const msg = err.response?.data?.message || 'Registration failed';
// //             alert(msg);
// //         }
// //     };

// //     return (
// //         <div style={{ padding: '50px', textAlign: 'center' }}>
// //             <h2>Student Registration</h2>
// //             <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
// //                 <input type="text" placeholder="Username" style={inputStyle} onChange={e => setForm({...form, username: e.target.value})} required /><br/>
// //                 <input type="email" placeholder="GNITS Email (e.g. 23251a...)" style={inputStyle} onChange={e => setForm({...form, email: e.target.value})} required /><br/>
// //                 <input type="password" placeholder="Password" style={inputStyle} onChange={e => setForm({...form, password: e.target.value})} required /><br/>
// //                 <button type="submit" style={btnStyle}>Register</button>
// //             </form>
// //             <p style={{ marginTop: '12px', cursor: 'pointer', color: '#004a99' }} onClick={() => navigate('/login')}>Already a member? <span style={{ textDecoration: 'underline' }}>Log In</span></p>
// //         </div>
// //     );
// // };

// // const inputStyle = { padding: '10px', margin: '10px 0', width: '300px', display: 'block' };
// // const btnStyle = { padding: '10px 20px', backgroundColor: '#004a99', color: 'white', border: 'none', cursor: 'pointer' };
// // export default Register;
// // import { Link } from "react-router-dom";

// // const Register = () => {
// //   return (
// //     <div style={styles.container}>
// //       <h2>Create a CampusTrade Account</h2>

// //       <form style={styles.form}>
// //         <input
// //           type="text"
// //           placeholder="Name"
// //           style={styles.input}
// //         />

// //         <input
// //           type="email"
// //           placeholder="Email"
// //           style={styles.input}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Password"
// //           style={styles.input}
// //         />

// //         <button style={styles.button}>Register</button>
// //       </form>

// //       <p>
// //         Already have an account?{" "}
// //         <Link to="/login">Login</Link>
// //       </p>
// //     </div>
// //   );
// // };

// // export default Register;

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import API from "../api/axios";

// const Register = () => {
//     const navigate = useNavigate();
    
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: ""
//     });

//   const handleChange = (e) => {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
  
//   const handleSubmit = async (e) => {
//       e.preventDefault();
      
//       try {
//           await API.post("/auth/register", formData);
//           alert("Registration successful! Please login.");
//           navigate("/login");
//         } catch (error) {
//             alert(error.response?.data?.message || "Registration failed");
//         }
//     };
    
//     return (
//         <div style={styles.container}>
//       <h2>Create Account</h2>

//       <form style={styles.form} onSubmit={handleSubmit}>
//         <input
//           name="name"
//           placeholder="Username"
//           onChange={handleChange}
//           style={styles.input}
//           />

//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           onChange={handleChange}
//           style={styles.input}
//           />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           onChange={handleChange}
//           style={styles.input}
//           />

//         <button style={styles.button}>Register</button>
//       </form>

//       <p>
//         Already have an account? <Link to="/login">Login</Link>
//       </p>
//     </div>
//   );
// };

// export default Register;
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

const Register = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
          await API.post("/auth/register", formData);
          alert("Registration successful! Please login.");
          navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };
    
    return (
        <div className="auth-page page">
      <div className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join the campus marketplace</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full name"
            onChange={handleChange}
            className="auth-input"
            required
            />

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

          <button className="btn btn-primary" type="submit">Register</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;