exports.calculateFallbackScore = (tenantProfile, listing) => {
  let locationScore = 0;
  let budgetScore = 0;
  let moveInScore = 0;
  let roomTypeScore = 0;
  let furnishingScore = 0;
  let lifestyleScore = 0;

  // 1. Location (Max 40)
  const listingLocality = listing.location.locality.toLowerCase();
  const listingCity = listing.location.city.toLowerCase();

  const isLocalityMatch = tenantProfile.preferredLocations.some(
    (loc) => loc.toLowerCase() === listingLocality || loc.toLowerCase() === `${listingLocality}, ${listingCity}`
  );
  
  if (isLocalityMatch) {
    locationScore = 40;
  } else if (tenantProfile.preferredLocations.some(loc => loc.toLowerCase().includes(listingCity))) {
    locationScore = 25;
  } else if (tenantProfile.preferredLocations.some(loc => listingLocality.includes(loc.toLowerCase()) || loc.toLowerCase().includes(listingLocality))) {
    locationScore = 20;
  } else {
    locationScore = 0;
  }

  // 2. Budget (Max 35)
  const rent = listing.rent;
  const maxBudget = tenantProfile.maxBudget || Infinity;
  const minBudget = tenantProfile.minBudget || 0;

  if (rent >= minBudget && rent <= maxBudget) {
    budgetScore = 35;
  } else if (rent > maxBudget && rent <= maxBudget * 1.1) {
    budgetScore = 20;
  } else if (rent > maxBudget * 1.1 && rent <= maxBudget * 1.2) {
    budgetScore = 10;
  } else {
    budgetScore = 0;
  }

  // 3. Move-in Date (Max 15)
  if (tenantProfile.moveInDate && listing.availableFrom) {
    const requestedDate = new Date(tenantProfile.moveInDate).getTime();
    const availableDate = new Date(listing.availableFrom).getTime();
    const diffDays = Math.ceil((availableDate - requestedDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      moveInScore = 15;
    } else if (diffDays <= 7) {
      moveInScore = 10;
    } else if (diffDays <= 30) {
      moveInScore = 5;
    } else {
      moveInScore = 0;
    }
  } else {
    moveInScore = 15; // default if not strict
  }

  // 4. Room Type (Max 5)
  if (tenantProfile.preferredRoomTypes.length === 0 || tenantProfile.preferredRoomTypes.includes(listing.roomType)) {
    roomTypeScore = 5;
  }

  // 5. Furnishing (Max 5)
  if (tenantProfile.furnishingPreference === 'any' || tenantProfile.furnishingPreference === listing.furnishingStatus) {
    furnishingScore = 5;
  }

  const totalScore = locationScore + budgetScore + moveInScore + roomTypeScore + furnishingScore + lifestyleScore;

  return {
    score: totalScore,
    explanation: 'Rule-based score used based on predefined weights for location, budget, availability, and preferences.',
    breakdown: {
      locationScore,
      budgetScore,
      moveInScore,
      roomTypeScore,
      furnishingScore,
      lifestyleScore,
    },
    method: 'rule-based',
  };
};
