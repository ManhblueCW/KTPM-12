import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export async function storeFile(file, type, newFilename) {
  const uploadsDir = path.join(process.cwd(), 'public');
  const oldPath = file.filepath;
  const ext = path.extname(file.originalFilename);
  const newPath = path.join(uploadsDir, type, newFilename + ext);
  const webPath = `/${type}/${newFilename}${ext}`;

  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  fs.copyFileSync(oldPath, newPath);
  fs.unlinkSync(oldPath);

  return { newPath, webPath };
}

export const handleFormidable = (req, res, next) => {
  const form = formidable({ keepExtensions: true, multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    req.fields = fields;
    req.files = files;
    next();
  });
};
