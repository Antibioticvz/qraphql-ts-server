import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  // console.log(err);
  const errors: Array<{ path: string; message: string }> = [];
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message
    });
  });

  return errors;
};