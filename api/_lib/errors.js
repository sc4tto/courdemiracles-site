export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function configError(variable) {
  return new ApiError(
    503,
    "CONFIGURATION_MISSING",
    `Server configuration is incomplete: ${variable}.`,
  );
}

export function assertCondition(condition, status, code, message) {
  if (!condition) throw new ApiError(status, code, message);
}
