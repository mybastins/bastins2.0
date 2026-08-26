const { put } = require('@vercel/blob');

/* Uploads a buffer to Vercel Blob and returns its public URL.
   `folder` groups related uploads (e.g. 'designs', 'mockups'). */
async function uploadBuffer(buffer, filename, folder, contentType = 'image/png') {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set — create a Blob store in the Vercel dashboard and connect it to this project');
  }
  const pathname = `${folder}/${Date.now()}-${filename}`;
  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

module.exports = { uploadBuffer };
