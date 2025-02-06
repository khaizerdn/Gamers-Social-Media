function Validation(values) {
  let error = {};
  
  const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Email Validation
  if (values.email.trim() === "") {
    error.email = "Email should not be empty.";
  } else if (!email_pattern.test(values.email)) {
    error.email = "Invalid email format.";
  }

  // Password Validation
  if (values.password === "") {
    error.password = "Password should not be empty.";
  }

  return error;
}

export default Validation;
