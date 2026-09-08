/**
 * Standard API response envelope used by the NestJS backend.
 * See technical architecture, section 56 "Standard API Response".
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Field-level validation errors: { price: "Price must be greater than 0" } */
export type FieldErrors = Record<string, string>;

/**
 * Normalised error shape every failed request is converted into,
 * so screens never have to inspect raw axios errors.
 */
export class ApiError extends Error {
  status: number;
  errors?: FieldErrors;

  constructor(message: string, status: number, errors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}
