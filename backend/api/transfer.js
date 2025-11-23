const { toWallet, amount } = req.body;
await transferTokens(toWallet, amount);

body: JSON.stringify({
  toWallet: recipient,
  amount: Number(amount),
})