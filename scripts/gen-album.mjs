import fs from 'node:fs';
import sharp from 'sharp';

const srcDir = 'D:/F-Documents/User/资源库/壁纸';
const albumDir = 'd:/E-Projects/vibecoding/blog/public/images/album';
const thumbDir = albumDir + '/thumb';
fs.mkdirSync(thumbDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
const data = [];
for (const f of files) {
  const srcPath = srcDir + '/' + f;
  const st = fs.statSync(srcPath);
  const meta = await sharp(srcPath).metadata();
  const thumbName = f.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
  await sharp(srcPath).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 75 }).toFile(thumbDir + '/' + thumbName);
  data.push({ name: f, birth: st.birthtime, width: meta.width, height: meta.height, thumb: 'thumb/' + thumbName });
}
data.sort((a, b) => new Date(b.birth) - new Date(a.birth));
fs.writeFileSync(albumDir + '/index.json', JSON.stringify(data, null, 2));
console.log('done', data.length, 'thumbnails');