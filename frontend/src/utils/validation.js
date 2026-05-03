const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(email, password) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address'
  if (!password) errors.password = 'Password is required'
  return errors
}

export function validateRegisterForm(form, role) {
  const errors = {}
  if (role === 'CANDIDATE') {
    if (!form.firstName.trim()) errors.firstName = 'First name is required'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required'
  }
  if (role === 'COMPANY') {
    if (!form.companyName.trim()) errors.companyName = 'Company name is required'
  }
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_REGEX.test(form.email)) errors.email = 'Enter a valid email address'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
