/**
 * Takes a map of user balances and simplifies the debts into the minimum number of transactions.
 * @param {Map<string, number>} balances - A map where keys are user IDs and values are their balances (positive if they are owed money, negative if they owe money).
 * @returns {Array<{from: string, to: string, amount: number}>} An array of transaction objects.
 */
export const simplifyDebts = (balances) => {
  // Use a small epsilon for floating point comparisons
  const epsilon = 1e-5;

  // Separate users into debtors (negative balance) and creditors (positive balance)
  const debtors = [];
  const creditors = [];

  for (const [userId, balance] of balances.entries()) {
    if (balance < -epsilon) {
      debtors.push({ userId, amount: balance });
    } else if (balance > epsilon) {
      creditors.push({ userId, amount: balance });
    }
  }

  const settlements = [];

  // Iterate while there are still debts to be settled
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    // The amount to be transferred is the smaller of the two absolute balances
    const transferAmount = Math.min(-debtor.amount, creditor.amount);

    // Record the transaction
    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: transferAmount,
    });

    // Update the balances
    debtor.amount += transferAmount;
    creditor.amount -= transferAmount;

    // If a debtor's balance is now zero (or very close), remove them from the list
    if (Math.abs(debtor.amount) < epsilon) {
      debtors.shift();
    }

    // If a creditor's balance is now zero (or very close), remove them from the list
    if (Math.abs(creditor.amount) < epsilon) {
      creditors.shift();
    }
  }

  return settlements;
};

// Example Usage:
// const balances = new Map();
// balances.set('Alice', -300); // Alice owes 300
// balances.set('Bob', 500);   // Bob is owed 500
// balances.set('Charlie', -200); // Charlie owes 200
//
// const transactions = simplifyDebts(balances);
// console.log(transactions);
//
// Expected Output:
// [
//   { from: 'Alice', to: 'Bob', amount: 300 },
//   { from: 'Charlie', to: 'Bob', amount: 200 }
// ]