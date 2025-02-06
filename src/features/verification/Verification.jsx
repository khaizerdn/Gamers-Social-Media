import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CodeValidation from './CodeValidation';
import axios from 'axios';
import { handleBlur, handleFocus, handleInput } from '../../utils/InputHandler';

const API_URL = import.meta.env.VITE_API_URL;

function Verification() {
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    verificationCode: "",
  });

  const [focused, setFocused] = useState({
    verificationCode: false,
  });

  const [countdown, setCountdown] = useState(60); // State to hold the countdown
  const [isResendEnabled, setIsResendEnabled] = useState(false); // State to manage resend button state

  const navigate = useNavigate();

  // Handle resend functionality
  const handleResendCode = () => {
    if (!isResendEnabled) return; // Prevent resend if countdown is active

    // Reset countdown and trigger resend code logic
    setCountdown(60);
    setIsResendEnabled(false); // Disable resend button during countdown

    // Logic to send a new verification code
    const email = sessionStorage.getItem('email');
    if (email) {
      // Trigger your resend verification code functionality here
      axios.post(`${API_URL}/resend-code`, { email })
        .then((response) => {
          console.log("Verification code resent:", response.data);
        })
        .catch((err) => {
          console.error("Error while resending verification code:", err);
        });
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendEnabled(true); // Enable resend button once countdown reaches 0
    }
    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [countdown]);

  // Form submission handler with validation
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Run client-side validation
    const validationErrors = CodeValidation(values);

    // If there are validation errors, stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Do not proceed with submission if there are errors
    }

    // Retrieve email from sessionStorage
    const email = sessionStorage.getItem('email');

    if (!email) {
      setErrors({ general: "No email found in session. Please restart the process." });
      return;
    }

    try {
      console.log("Sending:", {
        verificationCode: values.verificationCode,
        email: email,
      });

      const response = await axios.post(`${API_URL}/verify-account`, {
        verificationCode: values.verificationCode,
        email: email,
      });

      console.log("Response:", response.data);

      // Clear email from sessionStorage on success
      sessionStorage.removeItem('email');

      navigate('/success'); // Redirect on success
    } catch (err) {
      console.log("Error response:", err.response?.data || err.message);
      if (err.response) {
        setErrors({
          verificationCode: "Incorrect verification code. Please check your email or resend another code.",
        });
      } else {
        setErrors({ general: "An error occurred while verifying your account." });
      }
    }
  };

  return (
    <div className="container-access">
      <div className="access">
        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="title">Verification</div>
          <div className='note'>Please check your email for verification code.</div>
          {/* Verification Code */}
          <div className="input-section-one">
            <div className={`input-section-one-group ${errors.verificationCode ? 'error' : ''}`}>
              <label htmlFor="verificationCode">Verification Code</label>
              <div className='users-input'>
                <input
                  type="text"
                  placeholder=""
                  name="verificationCode"
                  value={values.verificationCode}
                  onChange={(e) => handleInput(e, setValues)}
                  onFocus={() => handleFocus('verificationCode', setFocused)}
                  onBlur={(e) => handleBlur(e, values, setFocused, setErrors, CodeValidation)}
                />
              </div>
            </div>
            {errors.verificationCode && focused.verificationCode && <div className="text-danger">{errors.verificationCode}</div>}
            {errors.general && <div className="text-danger">{errors.general}</div>}
          </div>

          {/* Submit Button */}
          <div className='input-section-one'>
            <button className="button-loginsignup">Confirm</button>
          </div>

          {/* Resend Button */}
          <div className="button-register">
            <div
              className={`button-register-text ${isResendEnabled ? '' : 'disabled'}`}
              onClick={handleResendCode}
            >
              {isResendEnabled ? 'Resend Code?' : `Resend Code? (Wait ${countdown}s)`}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Verification;
