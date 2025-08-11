// Expresión regular para encontrar posibles RUN/RUT con formato 12.345.678-K
const runRegex = /\b\d{1,2}\.\d{3}\.\d{3}-[kK\d]\b/g;

// Función que valida el dígito verificador del RUN/RUT
export function esRUNValido(run: string): boolean {
  const limpio = run.replace(/\./g, '').replace('-', '');
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1).toUpperCase();

  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString();

  return dv === dvEsperado;
}



export function extraeRUNSeguro(textoOCR = ''): string | null {
  const texto = textoOCR.toUpperCase();
  const posibles = texto.match(runRegex);
  if (!posibles) return null;

  for (const posible of posibles) {
    const idx = texto.indexOf(posible);
    const contexto = texto.slice(Math.max(0, idx - 40), idx + 40);

    // Si el contexto NO menciona NÚMERO DOCUMENTO y es válido, es más confiable
    if (!/N[ÚU]MERO\s+DOCUMENTO/i.test(contexto) && esRUNValido(posible)) {
      return posible;
    }

    // O si claramente dice RUN o RUT
    if ((/RUN|RUT/i.test(contexto) || contexto.match(runRegex)?.length === 1) && esRUNValido(posible)) {
      return posible;
    }
  }

  return posibles.find(esRUNValido) || null;
}
