import { uploadFiles } from './uploadFiles';

export const handleMainImageChange = async (
  e,
  setFormData,
  setUploading,
  setError
) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  try {
    const url = await uploadFiles(file);
    setFormData((prev) => ({ ...prev, image_url: url }));
  } catch (err) {
    setError('Failed to upload main image');
  } finally {
    setUploading(false);
  }
};

export const handlePdfUpload = async (
  e,
  setFormData,
  setUploading,
  setError
) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  try {
    const url = await uploadFiles(file);
    setFormData((prev) => ({ ...prev, datasheet_url: url }));
  } catch (err) {
    setError('Failed to upload PDF');
  } finally {
    setUploading(false);
  }
};
