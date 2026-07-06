import { prisma } from "../config/db.js";
import type { Journey } from "../generated/prisma/client.js";
import type { CreateJourneyInput, UpdateJourneyInput } from "../types/journey.types.js";

export async function createJourney(
  ownerId: string,
  data: CreateJourneyInput
): Promise<Journey> {
  return prisma.journey.create({
    data: {
      title: data.title,
      destination: data.destination,
      description: data.description,
      coverImage: data.coverImage,
      coverImagePublicId: data.coverImagePublicId,
      budget: data.budget,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status ?? "PLANNED",
      ownerId,
      // Google Maps location data
      placeId: data.placeId,
      latitude: data.latitude,
      longitude: data.longitude,
      formattedAddress: data.formattedAddress,
      city: data.city,
      state: data.state,
      country: data.country,
      googlePlaceName: data.googlePlaceName,
    },
  });
}

export async function findJourneysByOwner(ownerId: string): Promise<Journey[]> {
  return prisma.journey.findMany({
    where: { ownerId },
    orderBy: { startDate: "asc" },
  });
}

export async function findJourneyById(id: string): Promise<Journey | null> {
  return prisma.journey.findUnique({
    where: { id },
  });
}

export async function updateJourney(
  id: string,
  data: UpdateJourneyInput
): Promise<Journey> {
  return prisma.journey.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.destination !== undefined && { destination: data.destination }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.coverImagePublicId !== undefined && { coverImagePublicId: data.coverImagePublicId }),
      ...(data.budget !== undefined && { budget: data.budget }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.status !== undefined && { status: data.status }),
      // Google Maps location data
      ...(data.placeId !== undefined && { placeId: data.placeId }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.formattedAddress !== undefined && { formattedAddress: data.formattedAddress }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.googlePlaceName !== undefined && { googlePlaceName: data.googlePlaceName }),
    },
  });
}

export async function deleteJourney(id: string): Promise<Journey> {
  return prisma.journey.delete({
    where: { id },
  });
}

export async function createJourneyFromAIPlan(ownerId: string, aiPlanId: string) {
  const aiPlan = await prisma.aIPlan.findUnique({ where: { id: aiPlanId } });
  if (!aiPlan || aiPlan.userId !== ownerId) throw new Error("Plan not found or unauthorized");

  const result: any = aiPlan.result;
  const summary = result.tripSummary || {};
  const days = summary.totalDays || 1;
  const budget = summary.estimatedBudget || 0;
  
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const journey = await tx.journey.create({
      data: {
        ownerId,
        title: summary.title || `Trip to ${aiPlan.destination}`,
        destination: aiPlan.destination,
        description: summary.overview || "",
        budget,
        startDate,
        endDate,
        status: "PLANNED",
      },
    });

    if (result.dailyItinerary && Array.isArray(result.dailyItinerary)) {
      let sortOrder = 0;
      for (const day of result.dailyItinerary) {
        const entryDate = new Date(startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
        
        if (day.activities && Array.isArray(day.activities)) {
          for (const activity of day.activities) {
            await tx.timelineEntry.create({
              data: {
                journeyId: journey.id,
                date: entryDate,
                time: activity.time || "10:00 AM",
                title: activity.title,
                description: activity.description,
                location: activity.place?.name || activity.category || "Location",
                sortOrder: sortOrder++,
                latitude: activity.place?.latitude,
                longitude: activity.place?.longitude,
                placeId: activity.place?.placeId,
                formattedAddress: activity.place?.formattedAddress,
              },
            });
          }
        }
      }
    }

    return journey;
  });
}
