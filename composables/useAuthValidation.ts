/**
 * Authentication validation composable with multi-language support
 *
 * Requirements addressed:
 * - 1.3, 1.4: Real-time validation with specific error messages
 * - 7.1: Password strength requirements enforcement
 * - 8.6: Form validation with instant feedback
 * - 9.1, 9.2: User-friendly error messages with actionable guidance
 */

import { z } from "zod";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

export const useAuthValidation = () => {
  const { t } = useI18n();

  /**
   * Email validation schema
   */
  const emailSchema = z
    .string()
    .min(1, "auth.validation.email.required")
    .email("auth.validation.email.invalid");

  /**
   * Password validation schema with strength requirements
   * Requirement 7.1: minimum 8 characters, uppercase, lowercase, number
   */
  const passwordSchema = z
    .string()
    .min(1, "auth.validation.password.required")
    .min(8, "auth.validation.password.minLength")
    .regex(/[A-Z]/, "auth.validation.password.uppercase")
    .regex(/[a-z]/, "auth.validation.password.lowercase")
    .regex(/[0-9]/, "auth.validation.password.number");

  /**
   * Name validation schema
   */
  const nameSchema = z
    .string()
    .min(1, "auth.validation.name.required")
    .min(2, "auth.validation.name.minLength")
    .regex(
      /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]+$/,
      "auth.validation.name.invalid"
    );

  /**
   * Phone validation schema (optional)
   */
  const phoneSchema = z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
      "auth.validation.phone.invalid"
    );

  /**
   * Registration form validation schema
   */
  const registerSchema = z
    .object({
      name: nameSchema,
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, "auth.validation.password.required"),
      acceptTerms: z
        .boolean()
        .refine((val) => val === true, "auth.validation.terms.required"),
      language: z.enum(["es", "en", "ro", "ru"]).default("es"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "auth.validation.password.mismatch",
      path: ["confirmPassword"],
    });

  /**
   * Login form validation schema
   */
  const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "auth.validation.password.required"),
  });

  /**
   * Password reset request schema
   */
  const forgotPasswordSchema = z.object({
    email: emailSchema,
  });

  /**
   * Password reset form schema
   */
  const resetPasswordSchema = z
    .object({
      token: z.string().min(1, "auth.validation.token.required"),
      password: passwordSchema,
      confirmPassword: z.string().min(1, "auth.validation.password.required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "auth.validation.password.mismatch",
      path: ["confirmPassword"],
    });

  /**
   * Email verification schema
   */
  const verifyEmailSchema = z.object({
    token: z.string().min(1, "auth.validation.token.required"),
  });

  /**
   * Validates form data against a schema and returns translated errors
   */
  const validateForm = <T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult => {
    try {
      schema.parse(data);
      return {
        isValid: true,
        errors: [],
        fieldErrors: {},
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = [];
        const fieldErrors: Record<string, string> = {};

        error.errors.forEach((err) => {
          const field = err.path.join(".");
          const translationKey = err.message;
          const message = t(translationKey);

          const validationError: ValidationError = {
            field,
            message,
            code: err.code,
          };

          errors.push(validationError);
          fieldErrors[field] = message;
        });

        return {
          isValid: false,
          errors,
          fieldErrors,
        };
      }

      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: t("auth.errors.unknownError"),
            code: "unknown",
          },
        ],
        fieldErrors: {},
      };
    }
  };

  /**
   * Real-time email validation
   */
  const validateEmail = (email: string): ValidationResult => {
    return validateForm(emailSchema, email);
  };

  /**
   * Real-time password validation with strength checking
   */
  const validatePassword = (password: string): ValidationResult => {
    return validateForm(passwordSchema, password);
  };

  /**
   * Password strength calculation
   * Returns strength level from 0 (very weak) to 4 (very strong)
   */
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Bonus for longer passwords
    if (password.length >= 16) strength++;

    return Math.min(strength, 4);
  };

  /**
   * Get password strength label
   */
  const getPasswordStrengthLabel = (strength: number): string => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return labels[strength] || labels[0];
  };

  /**
   * Get password strength color
   */
  const getPasswordStrengthColor = (strength: number): string => {
    const colors = ["red", "orange", "yellow", "blue", "green"];
    return colors[strength] || colors[0];
  };

  /**
   * Validate registration form
   */
  const validateRegistration = (data: unknown): ValidationResult => {
    return validateForm(registerSchema, data);
  };

  /**
   * Validate login form
   */
  const validateLogin = (data: unknown): ValidationResult => {
    return validateForm(loginSchema, data);
  };

  /**
   * Validate forgot password form
   */
  const validateForgotPassword = (data: unknown): ValidationResult => {
    return validateForm(forgotPasswordSchema, data);
  };

  /**
   * Validate reset password form
   */
  const validateResetPassword = (data: unknown): ValidationResult => {
    return validateForm(resetPasswordSchema, data);
  };

  /**
   * Validate email verification
   */
  const validateEmailVerification = (data: unknown): ValidationResult => {
    return validateForm(verifyEmailSchema, data);
  };

  /**
   * Check if passwords match
   */
  const validatePasswordMatch = (
    password: string,
    confirmPassword: string
  ): boolean => {
    return password === confirmPassword;
  };

  /**
   * Validate terms acceptance
   */
  const validateTermsAcceptance = (accepted: boolean): ValidationResult => {
    if (!accepted) {
      return {
        isValid: false,
        errors: [
          {
            field: "acceptTerms",
            message: t("auth.validation.terms.required"),
            code: "required",
          },
        ],
        fieldErrors: {
          acceptTerms: t("auth.validation.terms.required"),
        },
      };
    }

    return {
      isValid: true,
      errors: [],
      fieldErrors: {},
    };
  };

  return {
    // Validation functions
    validateForm,
    validateEmail,
    validatePassword,
    validateRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateEmailVerification,
    validatePasswordMatch,
    validateTermsAcceptance,

    // Password strength utilities
    calculatePasswordStrength,
    getPasswordStrengthLabel,
    getPasswordStrengthColor,

    // Schemas (for external use if needed)
    emailSchema,
    passwordSchema,
    nameSchema,
    phoneSchema,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
  };
};
