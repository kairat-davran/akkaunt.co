const userModel = require("../models/userModel");

const clearSeenDiscoverPosts = async () => {
  try {
    const result = await userModel.updateMany(
      { seenDiscoverPosts: { $exists: true, $ne: [] } },
      { $set: { seenDiscoverPosts: [] } }
    );

    console.log(`[Cron] ✅ Cleared seenDiscoverPosts for ${result.modifiedCount} users`);
  } catch (err) {
    console.error('[Cron] ❌ Error clearing seenDiscoverPosts:', err.message);
  }
};

module.exports = clearSeenDiscoverPosts;