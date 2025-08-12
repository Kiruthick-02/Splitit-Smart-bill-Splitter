// Calculates equal splits among participants
export const calculateEqualSplits = (totalAmount, participants) => {
  if (!totalAmount || !participants || participants.length === 0) {
    return [];
  }

  const splitAmount = totalAmount / participants.length;
  return participants.map(userId => ({
    userId,
    amount: splitAmount,
  }));
};

// Calculates splits based on custom amounts provided by each participant
export const calculateCustomSplits = (totalAmount, customAmounts) => {
  if (!totalAmount || !customAmounts || customAmounts.length === 0) {
    return [];
  }

  let totalCustomAmount = 0;
  for (const split of customAmounts) {
    totalCustomAmount += split.amount;
  }

  if (totalCustomAmount !== totalAmount) {
    console.error("Total custom amount does not match the total bill amount.");
    return [];
  }

  return customAmounts.map(split => ({
    userId: split.userId,
    amount: split.amount,
  }));
};

// Calculates splits based on percentages assigned to each participant
export const calculatePercentageSplits = (totalAmount, percentageAllotments) => {
  if (!totalAmount || !percentageAllotments || percentageAllotments.length === 0) {
    return [];
  }

  let totalPercentage = 0;
  for (const allotment of percentageAllotments) {
    totalPercentage += allotment.percentage;
  }

  if (totalPercentage !== 100) {
    console.error("Total percentage allotment does not equal 100.");
    return [];
  }

  return percentageAllotments.map(allotment => {
    const amount = (totalAmount * allotment.percentage) / 100;
    return {
      userId: allotment.userId,
      amount: amount,
    };
  });
};

// Validates the input data for the split calculation.
export const validateSplitData = (splitType, totalAmount, splitData) => {
  if (!totalAmount || totalAmount <= 0) {
    console.error("Invalid total amount.");
    return false;
  }

  if (!splitData || splitData.length === 0) {
    console.error("No participants or split data provided.");
    return false;
  }

  switch (splitType) {
    case 'equal':
      return true; // No specific validation needed for equal splits
    case 'custom':
      let totalCustomAmount = 0;
      for (const split of splitData) {
        if (!split.userId || !split.amount || split.amount <= 0) {
          console.error("Invalid custom split data.");
          return false;
        }
        totalCustomAmount += split.amount;
      }
      if (totalCustomAmount !== totalAmount) {
        console.error("Total custom amount does not match the total bill amount.");
        return false;
      }
      break;
    case 'percentage':
      let totalPercentage = 0;
      for (const allotment of splitData) {
        if (!allotment.userId || !allotment.percentage || allotment.percentage <= 0) {
          console.error("Invalid percentage split data.");
          return false;
        }
        totalPercentage += allotment.percentage;
      }
      if (totalPercentage !== 100) {
        console.error("Total percentage allotment does not equal 100.");
        return false;
      }
      break;
    default:
      console.error("Invalid split type.");
      return false;
  }

  return true;
};