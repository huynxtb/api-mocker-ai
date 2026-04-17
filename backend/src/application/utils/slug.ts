import slugify from 'slugify';

export function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

export function normalizeEndpoint(name: string): string {
  return slugify(name, { lower: true, strict: true });
}
