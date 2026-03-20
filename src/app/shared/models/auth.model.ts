// src/app/shared/models/auth.model.ts

export interface LoginCredentials {
    email:      string;
    password:   string;
    rememberMe: boolean;
  }
  
  export interface RegisterData {
    fullName:        string;
    email:           string;
    password:        string;
    confirmPassword: string;
    role:            'freelancer' | 'employer';
    agreeToTerms:    boolean;
  }
  
  export interface AuthUser {
    id:        string;
    fullName:  string;
    email:     string;
    role:      'freelancer' | 'employer';
    avatar?:   string;
    token:     string;
    expiresAt: number;  // Unix timestamp
  }
  
  export interface AuthResponse {
    success: boolean;
    user?:   AuthUser;
    token?:  string;
    message?: string;
  }
  
  export interface ValidationError {
    field:   string;
    message: string;
  }
  
  // Form field validation state
  export interface FieldState {
    touched:  boolean;
    dirty:    boolean;
    valid:    boolean;
    error:    string;
  }