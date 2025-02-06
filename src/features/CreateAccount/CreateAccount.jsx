import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputValidation from '../../utils/InputValidation';
import axios from 'axios';
import { handleBlur, handleFocus, handleInput, handleInputDate } from '../../utils/InputHandler';

const API_URL = import.meta.env.VITE_API_URL;

function CreateAccount() {
  // State management for form values and errors
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    gender: "",
    month: "",
    day: "",
    year: "",
  });

  const [focused, setFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    username: false,
    gender: false,
    birthdate: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form submission handler with validation
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Step 1: Client-side validation
    const validationErrors = InputValidation(values);

    // Step 2: Check if username and email are available on the server
    try {
      const availabilityCheck = await axios.post(
        `${API_URL}/check-availability`,
        {
          username: values.username,
          email: values.email,
        }
      );
      console.log("Availability check response:", availabilityCheck.data);
    } catch (availabilityError) {
      if (availabilityError.response && availabilityError.response.data.errors) {
        Object.assign(validationErrors, availabilityError.response.data.errors);
      } else {
        validationErrors.general = "An error occurred while checking availability.";
      }
    }

    // Step 3: If there are errors, stop the process and show errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Errors found:", validationErrors);
      return;
    }

    // Step 4: Store email in sessionStorage
    sessionStorage.setItem("email", values.email);

    // Step 5: If no errors, proceed to account creation
    try {
      navigate("/verification")
      const accountRes = await axios.post(
        `${API_URL}/createaccount`,
        values
      );
      console.log("Account creation response:", accountRes.data);
      ;
    } catch (accountCreationError) {
      console.error("Error during account creation:", accountCreationError);
      setErrors({
        general: "An error occurred during account creation. Please try again.",
      });
    }
  };


  return (
    <div className="container-access">
      <div className="access">
        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="title">Create Account</div>
          {/* First Name */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.firstName ? 'error' : ''}`}>
              <label htmlFor="firstName">First Name</label>
              <div className='users-input'>
                <input
                  type="text"
                  placeholder=""
                  name="firstName"
                  value={values.firstName}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('firstName', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.firstName && focused.firstName && <div className="text-danger">{errors.firstName}</div>}
          </div>

          {/* Last Name */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.lastName ? 'error' : ''}`}>
              <label htmlFor="lastName">Last Name</label>
              <div className='users-input'>
                <input
                  type="text"
                  placeholder=""
                  name="lastName"
                  value={values.lastName}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('lastName', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.lastName && focused.lastName && <div className="text-danger">{errors.lastName}</div>}
          </div>


          {/* Gender */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.gender ? 'error' : ''}`}>
              <label htmlFor="access">Gender</label>
              <div className='users-input'>
                <div className="access-dropdown">
                  <select
                    name="gender"
                    value={values.gender}
                    onChange={(e) => handleInput(e, setValues)}
                    onFocus={() => handleFocus('gender', setFocused)}
                    onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                  >
                    <option value="" disabled hidden></option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="preferNotToSay">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
            {errors.gender && focused.gender && <div className="text-danger">{errors.gender}</div>}
          </div>

          {/* Birthdate (Month/Day/Year) */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.birthdate ? 'error' : ''}`}>
              <label htmlFor="birthdate">Birthdate</label>
              <div className='users-input'>
                <input
                  type="date"
                  name="birthdate"
                  value={values.birthdate}
                  onChange={(e) => handleInputDate(e, setValues)}
                  onFocus={() => handleFocus('birthdate', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.birthdate && focused.birthdate && <div className="text-danger">{errors.birthdate}</div>}
          </div>

          {/* Username */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.username ? 'error' : ''}`}>
              <label htmlFor="username">Username</label>
              <div className='users-input'>
                <input
                  type="text"
                  placeholder=""
                  name="username"
                  value={values.username}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('username', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.username && focused.username && <div className="text-danger">{errors.username}</div>}
          </div>

          {/* Email */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email</label>
              <div className='users-input'>
                <input
                  type="email"
                  placeholder=""
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('email', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.email && focused.email && <div className="text-danger">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="password-and-toggle">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  name="password"
                  autoComplete="new-password" 
                  value={values.password}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('password', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
                <div className="toggle-password-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="m12,8.67c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Zm0,0c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Zm0-3.81c-4.47,0-8.33,2.76-10,7.14,1.67,4.38,5.53,7.14,10,7.14s8.33-2.76,10-7.14c-1.67-4.38-5.53-7.14-10-7.14Zm0,12.38c-2.89,0-5.24-2.35-5.24-5.24s2.35-5.24,5.24-5.24,5.24,2.35,5.24,5.24-2.35,5.24-5.24,5.24Zm0-8.57c-1.84,0-3.33,1.49-3.33,3.33s1.49,3.33,3.33,3.33,3.33-1.49,3.33-3.33-1.49-3.33-3.33-3.33Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="m12,4.86c-4.47,0-8.33,2.76-10,7.14,1.67,4.38,5.53,7.14,10,7.14s8.33-2.76,10-7.14c-1.67-4.38-5.53-7.14-10-7.14Zm0,12.38c-2.89,0-5.24-2.35-5.24-5.24s2.35-5.24,5.24-5.24,5.24,2.35,5.24,5.24-2.35,5.24-5.24,5.24Z" />

                    </svg>
                  )}
                </div>
              </div>
            </div>
            {errors.password && focused.password && <div className="text-danger">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.confirmPassword ? 'error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="users-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('confirmPassword', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, InputValidation)}
                />
              </div>
            </div>
            {errors.confirmPassword && focused.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
          </div>

          {/* Submit Button */}
          <div className='input-section-one'>
            <button className="button-loginsignup">Create Account</button>
          </div>
          {/* Terms and Agreement */}
          <div className="agreement">
            By creating an account, you agree to the{' '}
            <Link to="/terms-of-service" className="link">Terms of Service</Link>,{' '}
            <Link to="/privacy-policy" className="link">Privacy Policy</Link>, including{' '}
            <Link to="/cookies-policy" className="link">Cookie Policy</Link>.
          </div>
          <div className='hr-horizontal-login' />
          <div className="button-register">
            <Link to="/" className="button-register-text">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;
