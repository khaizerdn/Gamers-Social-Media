function Validation(values) {
  let error = {};
  
  // Only check for empty fields.
  if (values.email.trim() === "") {
    error.email = "Email should not be empty.";
  }
  
  if (values.password === "") {
    error.password = "Password should not be empty.";
  }
  
  return error;
}

export default Validation;
