import { prisma } from "../config/db.js";
export async function createTimelineEntry(journeyId, data) {
    return prisma.timelineEntry.create({
        data: {
            journeyId,
            date: new Date(data.date),
            time: data.time,
            location: data.location,
            title: data.title,
            description: data.description,
            sortOrder: data.sortOrder ?? 0,
            media: data.albumMediaIds?.length ? {
                create: data.albumMediaIds.map((id, index) => ({
                    mediaId: id,
                    sortOrder: index,
                })),
            } : undefined,
        },
        include: {
            media: {
                include: {
                    media: true,
                },
            },
        },
    });
}
export async function findTimelineEntriesByJourney(journeyId) {
    return prisma.timelineEntry.findMany({
        where: { journeyId },
        include: {
            media: {
                include: {
                    media: true,
                },
                orderBy: { sortOrder: 'asc' }
            },
        },
        orderBy: [
            { date: 'asc' },
            { time: 'asc' },
            { sortOrder: 'asc' }
        ],
    });
}
export async function findTimelineEntryById(id) {
    return prisma.timelineEntry.findUnique({
        where: { id },
        include: {
            media: true,
        }
    });
}
export async function updateTimelineEntry(id, data) {
    // If albumMediaIds is provided, we delete existing media links and recreate them
    // This is simpler than computing diffs for a small array
    if (data.albumMediaIds !== undefined) {
        await prisma.timelineMedia.deleteMany({
            where: { timelineEntryId: id },
        });
    }
    return prisma.timelineEntry.update({
        where: { id },
        data: {
            ...(data.date !== undefined && { date: new Date(data.date) }),
            ...(data.time !== undefined && { time: data.time }),
            ...(data.location !== undefined && { location: data.location }),
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
            ...(data.albumMediaIds !== undefined && {
                media: {
                    create: data.albumMediaIds.map((id, index) => ({
                        mediaId: id,
                        sortOrder: index,
                    })),
                },
            }),
        },
        include: {
            media: {
                include: {
                    media: true,
                },
            },
        },
    });
}
export async function deleteTimelineEntry(id) {
    return prisma.timelineEntry.delete({
        where: { id },
    });
}
