import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  const { key } = await req.json();

  if (!key) {
    return new Response(JSON.stringify({ error: "key is required" }), { status: 400 });
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("S3 delete failed:", error);
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500 });
  }
}
