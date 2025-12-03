import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export async function POST() {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const fileName = `${randomUUID()}.jpg`; 
  const bucket = process.env.AWS_S3_BUCKET!;
  const key = `uploads/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: "image/jpeg",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 分鐘

  return Response.json({
    uploadUrl: url,
    fileUrl: `https://${bucket}.s3.amazonaws.com/${key}`,
  });
}
