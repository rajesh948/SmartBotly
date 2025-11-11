// ============================================
// Media Storage Service (Cloudinary / S3)
// ============================================

import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

// ============================================
// Configure Cloudinary
// ============================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// Upload Media to Cloudinary
// ============================================

export const uploadMedia = async (
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    publicId?: string;
  } = {}
): Promise<{ url: string; publicId: string }> => {
  try {
    const { folder = 'smartbotly', resourceType = 'auto', publicId } = options;

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: publicId,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    logger.info('Media uploaded successfully', {
      url: result.secure_url,
      publicId: result.public_id,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error('Failed to upload media:', error);
    throw new Error('Media upload failed');
  }
};

// ============================================
// Delete Media from Cloudinary
// ============================================

export const deleteMedia = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(publicId);

    logger.info('Media deleted successfully', { publicId });

    return true;
  } catch (error) {
    logger.error('Failed to delete media:', error);
    return false;
  }
};

// ============================================
// Alternative: AWS S3 Implementation
// ============================================
/*
If you prefer AWS S3 over Cloudinary, uncomment and use this code:

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'smartbotly-media';

export const uploadMediaToS3 = async (
  buffer: Buffer,
  mimeType: string,
  options: {
    folder?: string;
    filename?: string;
  } = {}
): Promise<{ url: string; key: string }> => {
  try {
    const { folder = 'uploads', filename } = options;

    const key = `${folder}/${filename || uuidv4()}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read', // Or 'private' if you want signed URLs
    };

    const result = await s3.upload(params).promise();

    logger.info('Media uploaded to S3', {
      url: result.Location,
      key: result.Key,
    });

    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    logger.error('Failed to upload to S3:', error);
    throw new Error('S3 upload failed');
  }
};

export const deleteMediaFromS3 = async (key: string): Promise<boolean> => {
  try {
    await s3
      .deleteObject({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      .promise();

    logger.info('Media deleted from S3', { key });

    return true;
  } catch (error) {
    logger.error('Failed to delete from S3:', error);
    return false;
  }
};

export const getSignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn, // seconds
    });

    return url;
  } catch (error) {
    logger.error('Failed to generate signed URL:', error);
    throw new Error('Signed URL generation failed');
  }
};
*/
