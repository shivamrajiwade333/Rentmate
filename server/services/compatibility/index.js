const CompatibilityScore = require('../../models/CompatibilityScore');
const TenantProfile = require('../../models/TenantProfile');
const Listing = require('../../models/Listing');
const { calculateLLMScore } = require('./llmScorer');
const { calculateFallbackScore } = require('./fallbackScorer');

exports.getCompatibility = async (tenantId, listingId, forceRecalculate = false) => {
  const tenantProfile = await TenantProfile.findOne({ tenant: tenantId });
  const listing = await Listing.findById(listingId);

  if (!tenantProfile || !listing) {
    throw new Error('Tenant profile or listing not found');
  }

  if (!tenantProfile.profileCompleted) {
    throw new Error('Tenant profile must be completed to get compatibility scores');
  }

  // 1. Check existing score
  const existingScore = await CompatibilityScore.findOne({
    tenant: tenantId,
    listing: listingId,
  });

  const tenantVersion = tenantProfile.updatedAt.getTime();
  const listingVersion = listing.updatedAt.getTime();
  const currentPromptVersion = 'v1'; // Increment if prompt changes

  const isCacheValid = existingScore && 
    existingScore.tenantProfileVersion.getTime() === tenantVersion &&
    existingScore.listingVersion.getTime() === listingVersion &&
    existingScore.promptVersion === currentPromptVersion;

  if (isCacheValid && !forceRecalculate) {
    return existingScore;
  }

  // 2. Recalculate
  let result;
  try {
    result = await calculateLLMScore(tenantProfile, listing);
  } catch (error) {
    result = calculateFallbackScore(tenantProfile, listing);
  }

  // 3. Save to DB
  let scoreDoc;
  if (existingScore) {
    existingScore.score = result.score;
    existingScore.explanation = result.explanation;
    existingScore.breakdown = result.breakdown;
    existingScore.method = result.method;
    existingScore.promptVersion = currentPromptVersion;
    existingScore.tenantProfileVersion = tenantProfile.updatedAt;
    existingScore.listingVersion = listing.updatedAt;
    existingScore.calculatedAt = new Date();
    scoreDoc = await existingScore.save();
  } else {
    scoreDoc = await CompatibilityScore.create({
      tenant: tenantId,
      listing: listingId,
      score: result.score,
      explanation: result.explanation,
      breakdown: result.breakdown,
      method: result.method,
      promptVersion: currentPromptVersion,
      tenantProfileVersion: tenantProfile.updatedAt,
      listingVersion: listing.updatedAt,
      calculatedAt: new Date()
    });
  }

  return scoreDoc;
};
