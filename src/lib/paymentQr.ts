const EPC_MAX_BYTES = 331;

function cleanIban(iban: string) {
  return iban.replace(/\s/g, '').toUpperCase();
}

/**
 * SPAYD works only in Czech/Slovak banking apps. It's the right format when
 * the payment stays inside CZK + a Czech account; everything else (EUR
 * amounts, or an account outside CZ) needs the EPC format below so foreign
 * banking apps can read it.
 */
export function shouldUseEpc(iban: string, currency: string): boolean {
  return currency.trim().toUpperCase() === 'EUR' || !cleanIban(iban).startsWith('CZ');
}

export function generateSpayd({
  iban,
  amount,
  currency,
  message,
}: {
  iban: string;
  amount: number;
  currency: string;
  message?: string;
}) {
  // SPAYD (Short Payment Descriptor) format for Czech QR payments
  let spayd = `SPD*1.0*ACC:${cleanIban(iban)}*AM:${amount.toFixed(2)}*CC:${currency}`;
  if (message) {
    spayd += `*MSG:${message.substring(0, 60)}`;
  }
  return spayd;
}

/**
 * EPC069-12 ("Girocode") — the SEPA Credit Transfer QR format read by
 * European banking apps (unlike SPAYD, which only Czech/Slovak apps read).
 * Field order and limits are fixed by the spec: BIC may be blank in
 * version "002" for SEPA countries, amount has no thousands separator and
 * "." as decimal point, name <= 70 chars, remittance info <= 140 chars.
 * Trailing empty fields are dropped per spec, and the payload is trimmed
 * to the max 331-byte QR payload size if a long message would overflow it.
 */
export function generateEpcQr({
  iban,
  beneficiaryName,
  amount,
  message,
}: {
  iban: string;
  beneficiaryName: string;
  amount: number;
  message?: string;
}) {
  const iso = cleanIban(iban);
  const name = beneficiaryName.trim().slice(0, 70);
  const amountStr = `EUR${amount.toFixed(2)}`;

  const buildPayload = (remittance: string) => {
    const lines = [
      'BCD',
      '002',
      '1',
      'SCT',
      '', // BIC — optional for SEPA countries in version 002
      name,
      iso,
      amountStr,
      '', // purpose
      '', // remittance info (structured)
      remittance, // remittance info (unstructured)
      '', // beneficiary to originator information
    ];
    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines.join('\n');
  };

  let remittance = (message ?? '').trim().slice(0, 140);
  let payload = buildPayload(remittance);

  const byteLength = (s: string) => new TextEncoder().encode(s).length;
  while (byteLength(payload) > EPC_MAX_BYTES && remittance.length > 0) {
    remittance = remittance.slice(0, -1);
    payload = buildPayload(remittance);
  }

  return payload;
}
