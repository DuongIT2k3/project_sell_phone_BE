import express from 'express';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  uploadThumbnailImage,
  validateImageType 
} from '../../common/middlewares/uploadImage.js';
import  createResponse  from '../../common/utils/response.js';
import { deleteImage } from '../../common/configs/cloudinary.js';
import handleAsync from '../../common/utils/handleAsync.js';

const router = express.Router();

// Upload ảnh đơn
router.post('/single', uploadSingleImage, validateImageType, handleAsync(async (req, res) => {
  if (!req.uploadedImage) {
    return res.status(400).json(createResponse(false, 400, 'Không có file ảnh được upload', null));
  }

  return res.status(200).json(createResponse(true, 200, 'Upload ảnh thành công', req.uploadedImage));
}));

// Upload nhiều ảnh
router.post('/multiple', uploadMultipleImages, validateImageType, handleAsync(async (req, res) => {
  if (!req.uploadedImages || req.uploadedImages.length === 0) {
    return res.status(400).json(createResponse(false, 400, 'Không có file ảnh được upload', null));
  }

  return res.status(200).json(createResponse(true, 200, 'Upload ảnh thành công', req.uploadedImages));
}));

// Upload thumbnail
router.post('/thumbnail', uploadThumbnailImage, validateImageType, handleAsync(async (req, res) => {
  if (!req.uploadedThumbnail) {
    return res.status(400).json(createResponse(false, 400, 'Không có file thumbnail được upload', null));
  }

  return res.status(200).json(createResponse(true, 200, 'Upload thumbnail thành công', req.uploadedThumbnail));
}));

// Xóa ảnh
router.delete('/:publicId', handleAsync(async (req, res) => {
  const { publicId } = req.params;
  
  // Giải mã publicId nếu cần (vì có thể chứa ký tự đặc biệt)
  const decodedPublicId = decodeURIComponent(publicId);
  
  const result = await deleteImage(decodedPublicId);
  
  if (result.result === 'ok' || result.result === 'not found') {
    return res.status(200).json(createResponse(true, 'Xóa ảnh thành công'));
  } else {
    return res.status(400).json(createResponse(false, 'Không thể xóa ảnh'));
  }
}));

export default router;
