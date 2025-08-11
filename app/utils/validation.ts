export const validateRUT = (rut: string): boolean => {
  const regex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9K]$/
  if (!regex.test(rut)) return false

  let [number, verifier] = rut.split("-")
  number = number.replace(/\./g, "")

  let sum = 0
  let multiplier = 2

  for (let i = number.length - 1; i >= 0; i--) {
    sum += Number(number[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  let expectedVerifier = 11 - (sum % 11)
  if (expectedVerifier === 11) expectedVerifier = 0
  if (expectedVerifier === 10) expectedVerifier = "K"

  return expectedVerifier.toString() === verifier
}

