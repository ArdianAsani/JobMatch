const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Accepts http/https URLs with a domain that has at least one dot (e.g. company.com)
const URL_REGEX = /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,6}(?::\d+)?(?:\/.*)?$/i

/**
 * Auto-prepend https:// when the user types a URL without a protocol.
 * e.g. "company.com" → "https://company.com"
 */
export function normalizeUrl(url) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed
  }
  return trimmed
}

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
    // Single name field replaces the old first_name / last_name pair
    if (!form.name.trim()) errors.name = 'Full name is required'
  }

  if (role === 'COMPANY') {
    if (!form.companyName.trim()) errors.companyName = 'Company name is required'

    // Industry is required; custom text is required only when "Other" is selected
    if (!form.industry) {
      errors.industry = 'Please select an industry'
    } else if (form.industry === 'Other' && !form.customIndustry.trim()) {
      errors.customIndustry = 'Please specify your industry'
    }

    // Website is optional but must be a valid URL format when filled and checkbox is off
    if (!form.noWebsite && form.website.trim()) {
      if (!URL_REGEX.test(normalizeUrl(form.website))) {
        errors.website = 'Please enter a valid URL (e.g. company.com)'
      }
    }
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
