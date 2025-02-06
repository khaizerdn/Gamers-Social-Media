import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleBlur, handleFocus, handleInput } from '../../utils/inputHandler';
import inputValidation from '../../utils/inputValidation';

function ForgotPassword() {
  // State management for form values and errors
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
  });

  const [focused, setFocused] = useState({
    email: false,
    verificationCode: false,
    password: false,
    confirmPassword: false,
  });

  const [step, setStep] = useState(1); // Step 1: Verify Email, Step 2: Verify Code, Step 3: Reset Password
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Step 1: Email Submission
  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    // Validate email input
    const validationErrors = inputValidation({ email: values.email });
    if (validationErrors.email) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/check-email', { email: values.email });
      
      if (response.data.success) {
        setStep(2);  // Move to the next step if the email is valid
      } else {
        setErrors({ email: response.data.error || 'This email is not registered.' });
      }
    } catch (error) {
      if (error.response) {
        // The server responded with an error
        setErrors({ email: error.response.data.error || 'An error occurred while checking the email.' });
      } else if (error.request) {
        // No response received from the server (network issue)
        setErrors({ email: 'Network error. Please try again later.' });
      } else {
        // Other errors (e.g., configuration issues)
        setErrors({ email: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  // Step 2: Code Verification
  const handleCodeSubmit = async (event) => {
    event.preventDefault();

    // Validate code input
    const validationErrors = inputValidation({ verificationCode: values.verificationCode });
    if (validationErrors.verificationCode) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/fp-verifycode', {
        email: values.email,
        verificationCode: values.verificationCode,
      });

      if (response.data.success) {
        setStep(3);
      } else {
        setErrors({ verificationCode: response.data.error || 'Invalid verification code.' });
      }
    } catch (err) {
      if (err.response) {
        // Server responded with a status code out of the 2xx range
        setErrors({
          verificationCode:
            err.response.data.error || 'Incorrect verification code. Please check your email or resend another code.',
        });
      } else {
        // Network or other unexpected errors
        setErrors({
          general: 'An error occurred while verifying your account. Please try again later.',
        });
      }
    }

  };

  // Step 3: Password Reset
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    // Validate password and confirmPassword
    const validationErrors = inputValidation(values);
    if (validationErrors.password || validationErrors.confirmPassword) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/reset-password', {
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        navigate('/login');
      } else {
        setErrors({ general: response.data.error || 'Failed to reset password.' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while resetting the password.' });
    }
  };

  return (
    <div className="container-access">
      <div className="access">
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} autoComplete="off" noValidate>
            <div className="title">Forgot Password</div>
            <div className='note'>Please enter your email to search for your account.</div>
            <div className="input-section-one">
              <div className={`input-section-one-group ${errors.email ? 'error' : ''}`}>
                <label htmlFor="email">Email</label>
                <div className="users-input">
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={(e) => handleInput(e, setValues)}
                    onFocus={() => handleFocus('email', setFocused)}
                    onBlur={(e) => handleBlur(e, values, setFocused, setErrors, inputValidation)}
                  />
                </div>
              </div>
              {errors.email && focused.email && <div className="text-danger">{errors.email}</div>}
            </div>
            <button className="button-loginsignup" type="submit">Search</button>
            <div className='hr-horizontal-login' />
            <div className="button-register">
              <Link to="/" className="button-register-text">Remember your password?</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} autoComplete="off" noValidate>
            <div className="title">Verify Code</div>
            <div className='note'>Please check your email for verification code.</div>
            <div className="input-section-one">
              <div className={`input-section-one-group ${errors.verificationCode ? 'error' : ''}`}>
                <label htmlFor="verificationCode">Verification Code</label>
                <div className="users-input">
                  <input
                    type="text"
                    name="verificationCode"
                    value={values.verificationCode}
                    onChange={(e) => handleInput(e, setValues)}
                    onFocus={() => handleFocus('verificationCode', setFocused)}
                    onBlur={(e) => handleBlur(e, values, setFocused, setErrors, inputValidation)}
                  />
                </div>
              </div>
              {errors.verificationCode && focused.verificationCode && <div className="text-danger">{errors.verificationCode}</div>}
            </div>
            <button className="button-loginsignup" type="submit">Confirm</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} autoComplete="off" noValidate>
            <div className="title">Create New Password</div>
            <div className='note'>Please create your new password.</div>
            <div className="input-section-one">
              <div className={`input-section-one-group ${errors.password ? 'error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="password-and-toggle">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    name="password"
                    value={values.password}
                    onChange={(e) => handleInput(e, setValues)}
                    onFocus={() => handleFocus('password', setFocused)}
                    onBlur={(e) => handleBlur(e, values, setFocused, setErrors, inputValidation)}
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
            <div className="input-section-one">
              <div className={`input-section-one-group ${errors.confirmPassword ? 'error' : ''}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="users-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={(e) => handleInput(e, setValues)}
                    onFocus={() => handleFocus('confirmPassword', setFocused)}
                    onBlur={(e) => handleBlur(e, values, setFocused, setErrors, inputValidation)}
                  />
                </div>
              </div>
              {errors.confirmPassword && focused.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
            </div>
            <button className="button-loginsignup" type="submit">Confirm</button>
          </form>
        )}

        {errors.general && <div className="text-danger">{errors.general}</div>}
      </div>
    </div>
  );
}

export default ForgotPassword;
