import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const storeFile = async (file, type, newFilename) => {
  console.log('[Playlist Service] Storing file:', { type, newFilename });
  
  const uploadsDir = path.join(process.cwd(), 'public');
  const oldPath = file.filepath;
  const newPath = path.join(uploadsDir, type, newFilename + path.extname(file.originalFilename));
  const webPath = `/${type}/` + newFilename + path.extname(file.originalFilename);

  if (!fs.existsSync(uploadsDir)) {
    console.log('[Playlist Service] Creating uploads directory');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  fs.copyFileSync(oldPath, newPath);
  fs.unlinkSync(oldPath);

  console.log('[Playlist Service] File stored successfully:', webPath);
  
  return {
    newPath,
    webPath
  };
};

export const handleFormidable = (req, res, next) => {
  console.log('[Playlist Service] Parsing form data...');
  
  const form = formidable({
    keepExtensions: true,
    multiples: true,
    uploadDir: path.join(process.cwd(), 'public'),
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('[Playlist Service] Formidable error:', err);
      res.status(400).json({ error: err.message });
      return;
    }

    console.log('[Playlist Service] Form parsed successfully');
    req.fields = fields;
    req.files = files;
    next();
  });
};