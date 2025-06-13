// gateway-service/src/middleware/errorHandler.js

function errorHandler(err, req, res) {
    console.error('Gateway Error:', err.message);
  
    // If no specific status is assigned, default to 500
    const statusCode = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the Gateway';
  
    res.status(statusCode).json({
      error: true,
      message
    });
  }
  
  export { errorHandler };
  