import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from "./LoginValidation";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Login({ setIsLoggedIn }) {  // Accept setIsLoggedIn as a prop

  const [values, setValues] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(""); 
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
  
    const validationErrors = Validation(values);
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        await axios.post(`${API_URL}/login`, values, { withCredentials: true });
        setIsLoggedIn(true);
        navigate("/");
      } catch (err) {
        setLoginError("Incorrect email or password.");
      }
    }
  };

  return (
    <div className="container-access">
      <div className="access">
        <form action="" onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="shortcut-logo-mainlogo">LOGO HERE</div>
          <div className="input-section-one">
          <div className='input-section-one-group'>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleInput} 
              className={errors.email ? "input-error" : ""}  // Add class if there's an error
            />
          </div>
          </div>
          <div className="input-section-one">
            <div className='input-section-one-group'>
              <label htmlFor="password">Password</label>
              <div className="password-and-toggle">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="" 
                  name="password"
                  autoComplete="current-password"
                  value={values.password} 
                  onChange={handleInput}
                />
                <div className="toggle-password-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="m12,8.67c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Zm0,0c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Zm0-3.81c-4.47,0-8.33,2.76-10,7.14,1.67,4.38,5.53,7.14,10,7.14s8.33-2.76,10-7.14c-1.67-4.38-5.53-7.14-10-7.14Zm0,12.38c-2.89,0-5.24-2.35-5.24-5.24s2.35-5.24,5.24-5.24,5.24,2.35,5.24,5.24-2.35,5.24-5.24,5.24Zm0-8.57c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="m12,4.86c-4.47,0-8.33,2.76-10,7.14,1.67,4.38,5.53,7.14,10,7.14s8.33-2.76,10-7.14c-1.67-4.38-5.53-7.14-10-7.14Zm0,12.38c-2.89,0-5.24-2.35-5.24-5.24s2.35-5.24,5.24-5.24,5.24,2.35,5.24,5.24-2.35,5.24-5.24,5.24Z"/>

                    </svg>
                  )}
                </div>
              </div>
            </div>
            {loginError && <span className="text-danger">{loginError}</span>}
          </div>
          <button type="submit" className="button-loginsignup">Log In</button>
          <div className="button-register">
            <Link to="/forgotpassword" className="button-register-text">Forgot Password?</Link>
          </div>
          <div className='hr-horizontal-login' />
          <div className="button-register">
            <Link to="/createaccount" className="button-register-text">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
