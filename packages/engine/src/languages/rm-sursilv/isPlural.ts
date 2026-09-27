export function isPlural(forms: Record<string, string>): boolean {
  // A `no`-determined phrase is always singular: *negin* takes a singular noun, so a requested plural
  // is ignored ("negin tgaun", never "negin tgauns"). A plurale tantum has no singular to fall back
  // on, and takes the plural "naginas novitads".
  if (forms['definiteness'] === 'no') return forms['count'] === 'plural';
  return (forms['number'] ?? forms['count']) === 'plural';
}
