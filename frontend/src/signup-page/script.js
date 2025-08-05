class SignupForm {
  constructor() {
    this.form = document.getElementById("signupForm")
    this.fullNameInput = document.getElementById("fullName")
    this.emailInput = document.getElementById("email")
    this.passwordInput = document.getElementById("password")
    this.confirmPasswordInput = document.getElementById("confirmPassword")
    this.agreeTermsCheckbox = document.getElementById("agreeTerms")
    this.togglePasswordBtn = document.getElementById("togglePassword")
    this.toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword")
    this.signupButton = document.getElementById("signupButton")
    this.toast = document.getElementById("toast")
    this.toastMessage = document.getElementById("toastMessage")
    this.passwordStrength = document.getElementById("passwordStrength")
    this.strengthFill = document.getElementById("strengthFill")
    this.strengthText = document.getElementById("strengthText")

    this.init()
  }

  init() {
    this.bindEvents()
    this.setupValidation()
  }

  bindEvents() {
    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

    // Password toggles
    this.togglePasswordBtn.addEventListener("click", () => this.togglePassword("password"))
    this.toggleConfirmPasswordBtn.addEventListener("click", () => this.togglePassword("confirmPassword"))

    // Real-time validation
    this.fullNameInput.addEventListener("blur", () => this.validateFullName())
    this.emailInput.addEventListener("blur", () => this.validateEmail())
    this.passwordInput.addEventListener("input", () => this.validatePassword())
    this.passwordInput.addEventListener("blur", () => this.validatePassword())
    this.confirmPasswordInput.addEventListener("blur", () => this.validateConfirmPassword())
    this.agreeTermsCheckbox.addEventListener("change", () => this.validateTerms())

    // Clear validation on input
    this.fullNameInput.addEventListener("input", () => this.clearValidation("fullName"))
    this.emailInput.addEventListener("input", () => this.clearValidation("email"))
    this.confirmPasswordInput.addEventListener("input", () => this.clearValidation("confirmPassword"))

    // Password strength indicator
    this.passwordInput.addEventListener("input", () => this.updatePasswordStrength())
  }

  setupValidation() {
    // Email validation pattern
    this.emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Password requirements
    this.passwordMinLength = 8
    this.passwordPatterns = {
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      numbers: /\d/,
      special: /[!@#$%^&*(),.?":{}|<>]/,
    }
  }

  validateFullName() {
    const fullName = this.fullNameInput.value.trim()

    if (!fullName) {
      this.showFieldError("fullName", "Full name is required")
      return false
    }

    if (fullName.length < 2) {
      this.showFieldError("fullName", "Full name must be at least 2 characters")
      return false
    }

    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
      this.showFieldError("fullName", "Full name can only contain letters, spaces, hyphens, and apostrophes")
      return false
    }

    this.showFieldSuccess("fullName")
    return true
  }

  validateEmail() {
    const email = this.emailInput.value.trim()

    if (!email) {
      this.showFieldError("email", "Email is required")
      return false
    }

    if (!this.emailPattern.test(email)) {
      this.showFieldError("email", "Please enter a valid email address")
      return false
    }

    this.showFieldSuccess("email")
    return true
  }

  validatePassword() {
    const password = this.passwordInput.value

    if (!password) {
      this.showFieldError("password", "Password is required")
      this.passwordStrength.classList.remove("show")
      return false
    }

    if (password.length < this.passwordMinLength) {
      this.showFieldError("password", `Password must be at least ${this.passwordMinLength} characters`)
      return false
    }

    // Check password strength requirements
    const requirements = []
    if (!this.passwordPatterns.lowercase.test(password)) {
      requirements.push("lowercase letter")
    }
    if (!this.passwordPatterns.uppercase.test(password)) {
      requirements.push("uppercase letter")
    }
    if (!this.passwordPatterns.numbers.test(password)) {
      requirements.push("number")
    }
    if (!this.passwordPatterns.special.test(password)) {
      requirements.push("special character")
    }

    if (requirements.length > 0) {
      this.showFieldError("password", `Password must include: ${requirements.join(", ")}`)
      return false
    }

    this.showFieldSuccess("password")
    this.passwordStrength.classList.add("show")
    return true
  }

  validateConfirmPassword() {
    const password = this.passwordInput.value
    const confirmPassword = this.confirmPasswordInput.value

    if (!confirmPassword) {
      this.showFieldError("confirmPassword", "Please confirm your password")
      return false
    }

    if (password !== confirmPassword) {
      this.showFieldError("confirmPassword", "Passwords do not match")
      return false
    }

    this.showFieldSuccess("confirmPassword")
    return true
  }

  validateTerms() {
    if (!this.agreeTermsCheckbox.checked) {
      this.showToast("Please agree to the Terms of Service and Privacy Policy", "error")
      return false
    }
    return true
  }

  updatePasswordStrength() {
    const password = this.passwordInput.value

    if (!password) {
      this.passwordStrength.classList.remove("show")
      return
    }

    this.passwordStrength.classList.add("show")

    let score = 0
    let feedback = ""

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Character variety checks
    if (this.passwordPatterns.lowercase.test(password)) score += 1
    if (this.passwordPatterns.uppercase.test(password)) score += 1
    if (this.passwordPatterns.numbers.test(password)) score += 1
    if (this.passwordPatterns.special.test(password)) score += 1

    // Update strength indicator
    this.strengthFill.className = "strength-fill"

    if (score <= 2) {
      this.strengthFill.classList.add("weak")
      feedback = "Weak password"
    } else if (score <= 3) {
      this.strengthFill.classList.add("fair")
      feedback = "Fair password"
    } else if (score <= 4) {
      this.strengthFill.classList.add("good")
      feedback = "Good password"
    } else {
      this.strengthFill.classList.add("strong")
      feedback = "Strong password"
    }

    this.strengthText.textContent = feedback
  }

  showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName)
    const errorElement = document.getElementById(`${fieldName}Error`)

    input.classList.add("invalid")
    input.classList.remove("valid")
    errorElement.textContent = message
    errorElement.classList.add("show")
  }

  showFieldSuccess(fieldName) {
    const input = document.getElementById(fieldName)
    const errorElement = document.getElementById(`${fieldName}Error`)

    input.classList.add("valid")
    input.classList.remove("invalid")
    errorElement.classList.remove("show")
  }

  clearValidation(fieldName) {
    const input = document.getElementById(fieldName)
    const errorElement = document.getElementById(`${fieldName}Error`)

    input.classList.remove("invalid", "valid")
    errorElement.classList.remove("show")
  }

  togglePassword(fieldName) {
    const input = document.getElementById(fieldName)
    const toggleBtn = fieldName === "password" ? this.togglePasswordBtn : this.toggleConfirmPasswordBtn
    const eyeIcon = toggleBtn.querySelector(".eye-icon")

    const type = input.getAttribute("type") === "password" ? "text" : "password"
    input.setAttribute("type", type)

    // Update icon
    if (type === "text") {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    // Validate all fields
    const isFullNameValid = this.validateFullName()
    const isEmailValid = this.validateEmail()
    const isPasswordValid = this.validatePassword()
    const isConfirmPasswordValid = this.validateConfirmPassword()
    const isTermsValid = this.validateTerms()

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
      this.showToast("Please fix the errors above", "error")
      return
    }

    // Show loading state
    this.setLoadingState(true)

    try {
      // Simulate API call
      await this.simulateSignup()

      // Success
      this.showToast("Account created successfully! Redirecting to login...", "success")

      // Simulate redirect after 2 seconds
      setTimeout(() => {
        // Replace with your actual redirect logic
        window.location.href = "../index.html"
      }, 2000)
    } catch (error) {
      this.showToast(error.message, "error")
    } finally {
      this.setLoadingState(false)
    }
  }

  async simulateSignup() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const formData = {
      fullName: this.fullNameInput.value.trim(),
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
    }

    // Simulate email already exists check
    if (formData.email === "existing@example.com") {
      throw new Error("An account with this email already exists")
    }

    // Simulate successful signup
    console.log("User registered:", formData)
    return { success: true, user: formData }
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.signupButton.classList.add("loading")
      this.signupButton.disabled = true
    } else {
      this.signupButton.classList.remove("loading")
      this.signupButton.disabled = false
    }
  }

  showToast(message, type = "success") {
    this.toastMessage.textContent = message
    this.toast.className = `toast ${type}`
    this.toast.classList.add("show")

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.toast.classList.remove("show")
    }, 4000)
  }
}

// Initialize the signup form when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SignupForm()
})

// Additional utility functions
function generateUsername(fullName) {
  return (
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 15) + Math.floor(Math.random() * 1000)
  )
}

function checkPasswordStrength(password) {
  let score = 0

  // Length
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

  return {
    score,
    strength: score <= 2 ? "weak" : score <= 3 ? "fair" : score <= 4 ? "good" : "strong",
  }
}

// Keyboard accessibility
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName === "BUTTON") {
    e.target.click()
  }
})
