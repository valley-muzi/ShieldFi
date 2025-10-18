@"
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
"@ | Set-Content src/utils/asyncHandler.js
