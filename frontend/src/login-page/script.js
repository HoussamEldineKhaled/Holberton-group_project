class LoginForm {
  constructor() {
    this.form = document.getElementById("loginForm")
    this.emailInput = document.getElementById("email")
    this.passwordInput = document.getElementById("password")
    this.togglePasswordBtn = document.getElementById("togglePassword")
    this.loginButton = document.getElementById("loginButton")
    this.forgotPasswordLink = document.getElementById("forgotPasswordLink")
    this.toast = document.getElementById("toast")
    this.toastMessage = document.getElementById("toastMessage")

    this.init()
  }

  init() {
    this.bindEvents()
    this.setupValidation()
  }

  bindEvents() {
    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

    // Password toggle
    this.togglePasswordBtn.addEventListener("click", () => this.togglePassword())

    // Forgot password link
    this.forgotPasswordLink.addEventListener("click", (e) => this.handleForgotPassword(e))

    // Real-time validation
    this.emailInput.addEventListener("blur", () => this.validateEmail())
    this.passwordInput.addEventListener("blur", () => this.validatePassword())

    // Clear validation on input
    this.emailInput.addEventListener("input", () => this.clearValidation("email"))
    this.passwordInput.addEventListener("input", () => this.clearValidation("password"))
  }

  setupValidation() {
    // Email validation pattern
    this.emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Password requirements (minimum 6 characters)
    this.passwordMinLength = 6
  }

  validateEmail() {
    const email = this.emailInput.value.trim()
    const errorElement = document.getElementById("emailError")

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
    const errorElement = document.getElementById("passwordError")

    if (!password) {
      this.showFieldError("password", "Password is required")
      return false
    }

    if (password.length < this.passwordMinLength) {
      this.showFieldError("password", `Password must be at least ${this.passwordMinLength} characters`)
      return false
    }

    this.showFieldSuccess("password")
    return true
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

  togglePassword() {
    const type = this.passwordInput.getAttribute("type") === "password" ? "text" : "password"
    this.passwordInput.setAttribute("type", type)

    // Update icon (you can replace this with actual icon switching)
    const eyeIcon = this.togglePasswordBtn.querySelector(".eye-icon")
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
    const isEmailValid = this.validateEmail()
    const isPasswordValid = this.validatePassword()

    if (!isEmailValid || !isPasswordValid) {
      this.showToast("Please fix the errors above", "error")
      return
    }

    // Show loading state
    this.setLoadingState(true)

    try {
      // Simulate API call
      await this.simulateLogin()

      // Success
      this.showToast("Login successful! Redirecting...", "success")

      // Simulate redirect after 2 seconds
      setTimeout(() => {
        // Replace with your actual redirect logic
        console.log("Redirecting to dashboard...")
        // window.location.href = '/dashboard';
      }, 2000)
    } catch (error) {
      this.showToast(error.message, "error")
    } finally {
      this.setLoadingState(false)
    }
  }

  async simulateLogin() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const email = this.emailInput.value.trim()
    const password = this.passwordInput.value

    // Simulate authentication logic
    // In a real app, you would send this to your backend
    if (email === "demo@example.com" && password === "password123") {
      return { success: true, user: { email } }
    } else {
      throw new Error("Invalid email or password")
    }
  }

  handleForgotPassword(e) {
    e.preventDefault()

    // You can implement forgot password logic here
    this.showToast("Forgot password functionality would be implemented here", "info")

    // Example: Open forgot password modal or redirect
    console.log("Opening forgot password flow...")
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.loginButton.classList.add("loading")
      this.loginButton.disabled = true
    } else {
      this.loginButton.classList.remove("loading")
      this.loginButton.disabled = false
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

// Initialize the login form when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginForm()
})

// Additional utility functions
function validateEmailFormat(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function generateSecurePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Keyboard accessibility
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName === "BUTTON") {
    e.target.click()
  }
})
