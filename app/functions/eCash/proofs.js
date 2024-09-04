export function sumTokenValue(token) {
  return token.token.reduce((r, c) => r + sumProofsValue(c.proofs), 0);
}

export function sumProofsValue(proofs) {
  return proofs.reduce((r, c) => {
    return r + c.amount;
  }, 0);
}

export function sumTokenProofs(token) {
  return token.token.reduce((r, c) => r + c.proofs.length, 0);
}
