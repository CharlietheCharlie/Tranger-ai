async function uploadFile(file: File) {
  // 1. 先跟後端拿 presigned URL
  const res = await fetch("/api/s3/presign", { method: "POST" });
  const { uploadUrl, fileUrl } = await res.json();

  try {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    console.error("Upload to S3 failed:", error);
    throw error;
  }

  return fileUrl; // 存進 DB 的 URL
}

function extractKeyFromUrl(url: string) {
  const parts = url.split(".amazonaws.com/");
  return parts[1]; // uploads/xxx.jpg
}

async function deleteFile(fileUrl: string) {
  const key = extractKeyFromUrl(fileUrl);

  await fetch("/api/s3/delete", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function validateUploadFile(file: File): UploadValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, WEBP, GIF images are allowed.",
    };
  }

  const maxSizeInBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be under ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
}

export { uploadFile, deleteFile, validateUploadFile };

