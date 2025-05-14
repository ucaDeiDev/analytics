export function createUrl(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  // Asegurarse de que no haya doble barra
  if (path.startsWith("/")) {
    return `${basePath}${path}`;
  }
  return `${basePath}/${path}`;
}
