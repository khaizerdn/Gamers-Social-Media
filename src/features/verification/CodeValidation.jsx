function CodeValidation(values) {
  let errors = {};

  // Verification Code Validation
  if (!values.verificationCode) {
    errors.verificationCode = "Verification code should not be empty.";
  }

  console.log('Validation Errors:', errors); // Debugging
  return errors; // Return the errors object
}

export default CodeValidation;
