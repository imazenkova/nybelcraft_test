import * as MINIO from 'minio';

const MINIO_S3_BUCKET_NAME = 'bucket';
export const USER_AVATAR_PREFIX = 'USER_AVATAR_PREFIX'

export const s3: MINIO.Client = new MINIO.Client({
    endPoint: process.env.S3_HOST,
    useSSL: false,
    port: +process.env.S3_PORT,
    accessKey: process.env.S3_MINIO_ROOT_USER,
    secretKey: process.env.S3_MINIO_ROOT_PASSWORD,
});


export const uploadImage = async (fileBuffer: Buffer, fileName: string, prefix: string, mimeType: string) => {

    const metaData = {
        'Content-Type': mimeType
    }

    await s3.putObject(MINIO_S3_BUCKET_NAME, `${prefix}/${fileName}`, fileBuffer, metaData);
    return fileName
}

export const presignUrl = (fileName: string, prefix: string): Promise<string> => {
    return s3.presignedGetObject(MINIO_S3_BUCKET_NAME, `${prefix}/${fileName}`, 300)
}

