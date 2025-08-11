const generateRandomCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join("")
}

export { generateRandomCode }

