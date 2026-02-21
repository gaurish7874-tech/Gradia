import { AppError } from '../utils/AppError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(400, errors.join('. '));
};

const handleDuplicateFieldsDB = (err) => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  return new AppError(409, `Duplicate value for ${field}.`);
};

const sendError = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  res.status(statusCode).json({
    status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err, message: err.message };
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  sendError(error, res);
};
