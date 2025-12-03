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
export { uploadFile, deleteFile };
