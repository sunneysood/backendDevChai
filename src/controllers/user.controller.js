import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refeshToken = user.generateRefreshToken();

    user.refeshToken = refeshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refeshToken };
    //tokens returned post generation
  } catch (error) {
    throw new ApiError(
      500,
      "Error while generating Access or Refresh tokens. Kindly try again"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  //res.status(200).json({ message: "ok" });
  /* 1. Get user details from frontend
   2. Validations on details entered by user
   3. dedude or user already exists : basis email or username
   4. check if avatar or images provided by user
   5. upload images / avatar to cloudinary
   6. ensure user avatar is uploaded successfully on cloudinary
   7. create user object and send entry to db
   8. remove password and request token field from return request
   9. check for user creation and error handling
   10. return response to front end 
   */
  //1. Get user details from frontend

  const { fullName, email, userName, password } = req.body;
  /*if (fullName === "") {
    throw new ApiError(400, "Full name is Empty, this field is required");
  }*/

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Full name is Empty, this field is required.");
  }

  const existinguser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existinguser) {
    throw new ApiError(
      409,
      "User name or Email already associated with another account."
    );
  }

  const avatarFileLocalPath = req.files?.avatar[0]?.path;
  if (!avatarFileLocalPath) {
    throw new ApiError(
      400,
      "Avatar is mandatory inpurt. Kindly upload your avatar."
    );
  }

  const avatarUpload = await uploadOnCloudinary(avatarFileLocalPath);
  if (!avatarUpload) {
    throw new ApiError(
      400,
      "Avatar upload failed and this is mandatory inpurt. Kindly re-upload your avatar."
    );
  }

  let coverImageUpload = "";
  const coverImageFileLocalPath = req.files?.coverImage[0]?.path;
  if (coverImageFileLocalPath) {
    coverImageUpload = await uploadOnCloudinary(coverImageFileLocalPath);
  }

  const user = await User.create({
    fullName,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload.url,
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Server Error: Error while registering the User.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  /* 1. request body get data
2. decide if using username or email or both for login
3. find user in mongodb
4. check password
5. if accepted, generate access and refresh token
6. send secure cookies */

  //console.log("I am inside user controller module");
  //console.log(req.body);

  const { email, userName, password } = req.body;

  if (!(email || userName)) {
    throw new ApiError(400, "User Name or Email is required.");
  }

  //logger.info(email + " " + userName);

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  logger.info(user);

  if (!user) {
    throw new ApiError(404, "User not found. Kindly register");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(
      401,
      "User name or email or password is incorrect. Kindly retry"
    );
  }

  const { accessToken, refeshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Sending cookies to user
  const options = { httpOnly: true, secure: true };

  // sending final response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refeshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refeshToken },
        "User Login Successful"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export { registerUser, loginUser, logOutUser };
