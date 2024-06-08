import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import { fs } from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Error: Local File Path Not available";
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is successfully uploaded to Cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Error while uploading to Cloudinary", error);
    return null;
  }
};

export default uploadOnCloudinary;
