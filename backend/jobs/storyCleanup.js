/**
 * ====================================
 * STORY CLEANUP CRON JOB
 * ====================================
 * Deletes orphaned Cloudinary media for expired stories.
 *
 * Problem:
 *   MongoDB's TTL index silently removes expired Story documents,
 *   but does NOT trigger Mongoose middleware — so the actual
 *   image/video files remain on Cloudinary forever.
 *
 * Solution:
 *   This CRON job runs every hour, queries for stories that are
 *   about to expire (or have just expired), and deletes their
 *   Cloudinary assets before/after MongoDB removes the documents.
 *
 * Schedule: Every hour at minute 0 ("0 * * * *")
 */

const cron = require("node-cron");
const Story = require("../models/Story");
const { cloudinary } = require("../config/cloudinary");

/**
 * Delete a Cloudinary asset by its public ID.
 * Handles both images and videos.
 */
async function deleteCloudinaryAsset(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(
      `❌ Cloudinary delete failed for ${publicId}:`,
      error.message,
    );
    return null;
  }
}

/**
 * Main cleanup function.
 * Finds stories older than 23 hours (giving 1 hour buffer before TTL kicks in)
 * and deletes their Cloudinary assets, then removes the documents manually.
 *
 * Why 23 hours? MongoDB TTL runs every ~60s but isn't perfectly punctual.
 * By cleaning up at 23h, we ensure the Cloudinary file is deleted
 * before MongoDB silently drops the document (losing the publicId).
 */
async function cleanupExpiredStories() {
  try {
    const cutoffTime = new Date(Date.now() - 23 * 60 * 60 * 1000); // 23 hours ago

    // Find stories older than 23h that still exist (TTL hasn't removed yet)
    const expiredStories = await Story.find({
      createdAt: { $lte: cutoffTime },
    });

    if (expiredStories.length === 0) {
      console.log("🧹 Story cleanup: No expired stories found.");
      return;
    }

    console.log(
      `🧹 Story cleanup: Found ${expiredStories.length} expired stories. Cleaning up...`,
    );

    let deletedCount = 0;
    let failedCount = 0;

    for (const story of expiredStories) {
      // Delete Cloudinary asset if we have the public ID
      if (story.mediaPublicId) {
        const resourceType = story.mediaType === "video" ? "video" : "image";
        const result = await deleteCloudinaryAsset(
          story.mediaPublicId,
          resourceType,
        );

        if (result && result.result === "ok") {
          deletedCount++;
          console.log(`  ✅ Deleted media: ${story.mediaPublicId}`);
        } else if (result && result.result === "not found") {
          // Already deleted or doesn't exist — that's fine
          deletedCount++;
          console.log(`  ⚠️ Already gone: ${story.mediaPublicId}`);
        } else {
          failedCount++;
          console.log(`  ❌ Failed to delete: ${story.mediaPublicId}`);
        }
      }

      // Manually remove the document (in case TTL hasn't caught it yet)
      await Story.findByIdAndDelete(story._id);
    }

    console.log(
      `🧹 Story cleanup complete: ${deletedCount} media deleted, ${failedCount} failed.`,
    );
  } catch (error) {
    console.error("❌ Story cleanup job error:", error);
  }
}

/**
 * Start the CRON job.
 * Runs every hour at minute 0.
 */
function startStoryCleanupJob() {
  // Run every hour
  cron.schedule("0 * * * *", () => {
    console.log("⏰ Running scheduled story cleanup...");
    cleanupExpiredStories();
  });

  console.log("🕐 Story cleanup CRON job scheduled (every hour)");

  // Also run once on startup (after a short delay) to catch any backlog
  setTimeout(() => {
    console.log("⏰ Running initial story cleanup check...");
    cleanupExpiredStories();
  }, 10000); // 10 second delay to let DB connection stabilize
}

module.exports = { startStoryCleanupJob, cleanupExpiredStories };
