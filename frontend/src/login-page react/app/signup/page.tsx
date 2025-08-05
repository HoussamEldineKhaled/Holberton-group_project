"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PasswordStrength {
  score: number
  strength: "weak" | "fair" | "good" | "strong"
  feedback: string
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const passwordPatterns = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    numbers: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
  }

  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required"
    if (name.trim().length < 2) return "Full name must be at least 2 characters"
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Full name can only contain letters, spaces, hyphens, and apostrophes"
    return ""
  }

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailPattern.test(email)) return "Please enter a valid email address"
    return ""
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"

    const requirements = []
    if (!passwordPatterns.lowercase.test(password)) requirements.push("lowercase letter")
    if (!passwordPatterns.uppercase.test(password)) requirements.push("uppercase letter")
    if (!passwordPatterns.numbers.test(password)) requirements.push("number")
    if (!passwordPatterns.special.test(password)) requirements.push("special character")

    if (requirements.length > 0) {
      return `Password must include: ${requirements.join(", ")}`
    }
    return ""
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return ""
  }

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0

    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (passwordPatterns.lowercase.test(password)) score += 1
    if (passwordPatterns.uppercase.test(password)) score += 1
    if (passwordPatterns.numbers.test(password)) score += 1
    if (passwordPatterns.special.test(password)) score += 1

    let strength: "weak" | "fair" | "good" | "strong"
    let feedback: string

    if (score <= 2) {
      strength = "weak"
      feedback = "Weak password"
    } else if (score <= 3) {
      strength = "fair"
      feedback = "Fair password"
    } else if (score <= 4) {
      strength = "good"
      feedback = "Good password"
    } else {
      strength = "strong"
      feedback = "Strong password"
    }

    return { score, strength, feedback }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Update password strength
    if (field === "password" && typeof value === "string") {
      if (value) {
        setPasswordStrength(calculatePasswordStrength(value))
      } else {
        setPasswordStrength(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}
    newErrors.fullName = validateFullName(formData.fullName)
    newErrors.email = validateEmail(formData.email)
    newErrors.password = validatePassword(formData.password)
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password)

    if (!formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      })
      return
    }

    const hasErrors = Object.values(newErrors).some((error) => error !== "")
    setErrors(newErrors)

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors above",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate email already exists check
      if (formData.email === "existing@example.com") {
        throw new Error("An account with this email already exists")
      }

      toast({
        title: "Success!",
        description: "Account created successfully! Redirecting to login...",
      })

      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500"
      case "fair":
        return "bg-yellow-500"
      case "good":
        return "bg-green-500"
      case "strong":
        return "bg-green-600"
      default:
        return "bg-gray-300"
    }
  }

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case "weak":
        return "w-1/4"
      case "fair":
        return "w-2/4"
      case "good":
        return "w-3/4"
      case "strong":
        return "w-full"
      default:
        return "w-0"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-10 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us today and get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`transition-all duration-200 ${
                  errors.fullName
                    ? "border-red-500 bg-red-50"
                    : formData.fullName && !errors.fullName
                      ? "border-green-500 bg-green-50"
                      : ""
                }`}
                autoComplete="name"
              />
              {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`transition-all duration-200 ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : formData.email && !errors.email
                      ? "border-green-500 bg-green-50"
                      : ""
                }`}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pr-10 transition-all duration-200 ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : formData.password && !errors.password
                        ? "border-green-500 bg-green-50"
                        : ""
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}

              {passwordStrength && formData.password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)} ${getStrengthWidth(passwordStrength.strength)}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pr-10 transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50"
                      : formData.confirmPassword && !errors.confirmPassword
                        ? "border-green-500 bg-green-50"
                        : ""
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors underline bg-transparent border-none cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
