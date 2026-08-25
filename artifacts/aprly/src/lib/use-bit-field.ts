import { useEffect } from "react";
import { registerBitField, type BitFieldSetter } from "@/lib/bit-field-registry";

/** Register a controlled field setter with Bit while the component is mounted. */
export function useBitField(fieldId: string, setValue: BitFieldSetter): void {
  useEffect(() => registerBitField(fieldId, setValue), [fieldId, setValue]);
}
