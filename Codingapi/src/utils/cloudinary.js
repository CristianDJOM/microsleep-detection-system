const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "cloud_name",
  api_key: "api_key",
  api_secret: "api_secret",
  secure: true,
});
//subir fotos de repuestos
async function uploadImage(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "repuestos",
  });
}
//subir fotos de servicios
async function uploadImageService(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "servicios",
  });
}
//subir fotos de empleados
async function uploadImageStaff(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "empleados",
  });
}
//eliminar
async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, uploadImageService, uploadImageStaff, deleteImage };