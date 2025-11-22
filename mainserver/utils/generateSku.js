export const generateSku = (name, category) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const nameInitials = name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  const categoryInitials = category
    .split(' ')
    .slice(0, 1)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  const timestamp = Date.now().toString().slice(-4);

  const sku = `${categoryInitials}${nameInitials}${year}${month}${day}${timestamp}`;

  return sku.toUpperCase();
};
