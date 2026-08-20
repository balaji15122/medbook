/**
 * Helper to send successful API responses
 */
export const sendSuccess = (res, statusCode = 200, message = "Success", data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    if (typeof data === "object" && !Array.isArray(data)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Helper to send error API responses
 */
export const sendError = (res, statusCode = 500, message = "Server Error", error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error) {
    response.error = typeof error === "string" ? error : error.message || error;
  }

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
