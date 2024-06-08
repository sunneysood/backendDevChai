//code using promise
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export default asyncHandler;

/*
Code using try catch statement
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    async fn(req,res,next);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
}; */
