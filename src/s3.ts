import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
class S3Service {
    setConfig() {
        const config = new S3Client({
            region: "auto",
            endpoint: process.env.S3_ENDPOINT!,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY!,
                secretAccessKey: process.env.S3_SECRET_KEY!,
            },
        });
        return config;
    }

    async create() {
        const config = await this.setConfig();
        const objectKey = `recipe-app/${uuidv4()}`;
        const signedUrl = await getSignedUrl(
            config,
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: objectKey,
            }),
            {
                expiresIn: 3600,
            }
        );

        return {
            put_url: signedUrl,
            get_url: `${process.env.S3_PUBLIC_URL}/${objectKey}`,
        };
    }
}

export default new S3Service();
