import { type ZodType, ZodError } from 'zod';

/**
 * Shared Formik validation adapter for Zod schemas.
 * Conforms to project coding standards (SKILL.md section 3).
 */
export function validateWithZod<T>(schema: ZodType<T>) {
  return (values: unknown) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const formikErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (path && !formikErrors[path]) {
            formikErrors[path] = issue.message;
          }
        }
        return formikErrors;
      }
      return {};
    }
  };
}
