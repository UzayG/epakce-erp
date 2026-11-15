/**
 * FormRequest Validation Middleware
 * Directly mirrors Laravel's FormRequest:
 *   - Runs before Controller
 *   - Validates rules
 *   - Automatically returns HTTP 422 with structured JSON error list
 */

function validate(rules) {
  return function (req, res, next) {
    const body = req.body || {};
    const errors = {};

    for (const [field, ruleList] of Object.entries(rules)) {
      const val = body[field];

      for (const rule of ruleList) {
        if (rule === 'required') {
          if (val === undefined || val === null || val === '') {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} alanı zorunludur.`);
          }
        } else if (rule === 'numeric') {
          if (val !== undefined && isNaN(Number(val))) {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} alanı sayısal (numeric) olmalıdır.`);
          }
        } else if (rule === 'min:1') {
          if (Number(val) < 1) {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} değeri en az 1 olmalıdır.`);
          }
        } else if (rule === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (val && !emailRegex.test(val)) {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} geçerli bir e-posta adresi olmalıdır.`);
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'Verilen veri doğrulanamadı (The given data was invalid).',
        errors: errors
      });
    }

    next();
  };
}

module.exports = {
  validate
};
