import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

  const existinguser = User.findOne({ $or: [{ userName }, { email }] });
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

  const coverImageFileLocalPath = req.files?.coverImage[0]?.path;
  if (coverImageFileLocalPath) {
    const coverImageUpload = await uploadOnCloudinary(coverImageFileLocalPath);
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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

export { registerUser };
