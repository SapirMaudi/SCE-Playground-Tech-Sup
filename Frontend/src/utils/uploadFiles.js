export const uploadFiles = async (file) => {
  const formData = new FormData();
  console.log(file);

  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_upload');

  const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');

  const resourceType = isPDF ? 'raw' : 'image';

  const uploadUrl = `https://api.cloudinary.com/v1_1/deyb2gso9/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};
