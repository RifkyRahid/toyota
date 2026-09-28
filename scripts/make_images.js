const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function run() {
  const logo = Buffer.from(
    '<svg width="300" height="75" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="white"/>' +
    '<ellipse cx="40" cy="38" rx="30" ry="22" fill="none" stroke="#EB0A1E" stroke-width="4"/>' +
    '<ellipse cx="40" cy="32" rx="14" ry="16" fill="none" stroke="#EB0A1E" stroke-width="4"/>' +
    '<ellipse cx="40" cy="38" rx="28" ry="10" fill="none" stroke="#EB0A1E" stroke-width="4"/>' +
    '<text x="85" y="46" font-family="sans-serif" font-size="22" font-weight="bold" fill="#1A1A1A">AGUNG TOYOTA</text>' +
    '</svg>'
  );
  await sharp(logo).webp({ quality: 90 }).toFile(path.join(dir, 'toyota-logo.webp'));

  const logoWhite = Buffer.from(
    '<svg width="300" height="75" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#18181b"/>' +
    '<ellipse cx="40" cy="38" rx="30" ry="22" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<ellipse cx="40" cy="32" rx="14" ry="16" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<ellipse cx="40" cy="38" rx="28" ry="10" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<text x="85" y="46" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF">AGUNG TOYOTA</text>' +
    '</svg>'
  );
  await sharp(logoWhite).webp({ quality: 90 }).toFile(path.join(dir, 'toyota-logo-white.webp'));

  const sales = Buffer.from(
    '<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#E5E7EB"/>' +
    '<circle cx="300" cy="320" r="120" fill="#9CA3AF"/>' +
    '<path d="M140 680 C140 500, 460 500, 460 680 Z" fill="#9CA3AF"/>' +
    '<text x="300" y="740" font-family="sans-serif" font-size="32" font-weight="bold" fill="#4B5563" text-anchor="middle">Sales Executive</text>' +
    '</svg>'
  );
  await sharp(sales).webp({ quality: 85 }).toFile(path.join(dir, 'sales-default.webp'));

  const bg = Buffer.from(
    '<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#18181b"/>' +
    '<circle cx="960" cy="540" r="300" fill="#3f3f46" opacity="0.3"/>' +
    '</svg>'
  );
  await sharp(bg).jpeg({ quality: 80 }).toFile(path.join(dir, 'toyota-bg-placeholder.jpg'));

  console.log('SUCCESS_CREATED_IMAGES');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
