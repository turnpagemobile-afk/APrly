/** Register React controlled setters so Bit `fillField` can update draft UI state. */

export type BitFieldSetter = (value: string) => void;

const fields = new Map<string, BitFieldSetter>();

export function registerBitField(fieldId: string, setValue: BitFieldSetter): () => void {
  fields.set(fieldId, setValue);
  return () => {
    if (fields.get(fieldId) === setValue) {
      fields.delete(fieldId);
    }
  };
}

export function fillRegisteredBitField(
  fieldId: string,
  value: string,
): { ok: true; fieldId: string } | { ok: false; error: string } {
  const setter = fields.get(fieldId);
  if (!setter) {
    return {
      ok: false,
      error: `Field not available on this screen: ${fieldId}`,
    };
  }
  setter(value);
  return { ok: true, fieldId };
}
