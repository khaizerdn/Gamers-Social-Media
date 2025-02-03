// Handle when the input field loses focus
export const handleBlur = (event, values, setFocused, setErrors, validationFunction) => {
  const { name } = event.target;

  // Set the input field to not focused
  setFocused((prev) => ({ ...prev, [name]: false }));

  // Validate the field using the provided validation function
  const validationErrors = validationFunction(values);

  if (validationErrors[name]) {
    // Set the error if validation fails
    setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
  } else {
    // Clear the error if validation passes
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }
};

// Handle when the input field gains focus
export const handleFocus = (field, setFocused) => {
  setFocused((prev) => ({ ...prev, [field]: true }));
};

// Handle when the input field value changes
export const handleInput = (event, setValues) => {
  const { name, value } = event.target;

  // Check if the input field is "username" and convert to lowercase
  if (name === "username") {
    setValues((prev) => ({ ...prev, [name]: value.toLowerCase() }));
  } else {
    setValues((prev) => ({ ...prev, [name]: value }));
  }
};

// Handle when the for Date input
export const handleInputDate = (event, setValues) => {
  const selectedDate = event.target.value;
  // Split the date into separate components
  const [year, month, day] = selectedDate.split("-");
  // Update state with separate month, day, and year values
  setValues((prev) => ({
    ...prev,
    month: month,
    day: day,
    year: year,
    birthdate: selectedDate, // Optionally, store the full date string as well
  }));
};

