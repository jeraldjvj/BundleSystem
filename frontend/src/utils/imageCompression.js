// Comprime una imagen a JPEG para que no supere maxSizeKB.
// Redimensiona progresivamente y baja la calidad hasta cumplir el límite.
// Si la imagen ya pesa menos que el límite, la devuelve sin cambios.

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });

const renderToBlob = (img, width, height, quality) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // Fondo blanco: evita zonas negras si el original tenía transparencia
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/jpeg',
      quality
    );
  });

export async function compressImage(file, maxSizeKB = 900) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const limitBytes = maxSizeKB * 1024;
  if (file.size <= limitBytes) return file;

  const img = await loadImage(file);
  try {
    // Empezar limitando a 1920px en el lado mayor: suficiente para fotos de documentos/perfil
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    const initialMax = 1920;
    if (Math.max(width, height) > initialMax) {
      const scale = initialMax / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    let quality = 0.85;
    let blob = await renderToBlob(img, width, height, quality);

    // 1) Bajar calidad manteniendo dimensiones
    while (blob.size > limitBytes && quality > 0.35) {
      quality -= 0.1;
      blob = await renderToBlob(img, width, height, quality);
    }

    // 2) Si sigue pesando mucho, reducir dimensiones y reintentar calidad
    while (blob.size > limitBytes && Math.max(width, height) > 800) {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
      quality = 0.8;
      blob = await renderToBlob(img, width, height, quality);
      while (blob.size > limitBytes && quality > 0.35) {
        quality -= 0.1;
        blob = await renderToBlob(img, width, height, quality);
      }
    }

    const name = file.name.replace(/\.\w+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
