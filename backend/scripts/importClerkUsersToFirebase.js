/* eslint-disable no-console */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getFirebaseAdmin } = require("../config/firebaseAdmin");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node scripts/importClerkUsersToFirebase.js <path-to-clerk-users.json>");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`Input file not found: ${resolvedPath}`);
  process.exit(1);
}

const parseUsers = () => {
  const raw = fs.readFileSync(resolvedPath, "utf8");
  const parsed = JSON.parse(raw);
  const users = Array.isArray(parsed) ? parsed : parsed.users;

  if (!Array.isArray(users)) {
    throw new Error("Expected JSON array or { users: [] } payload from Clerk export.");
  }

  return users
    .map((u) => {
      const email =
        u.email ||
        u.primary_email_address?.email_address ||
        u.email_addresses?.[0]?.email_address;
      const clerkId = u.clerkId || u.id || u.user_id;

      if (!email || !clerkId) return null;
      return {
        uid: clerkId,
        email,
        emailVerified: Boolean(
          u.email_verified ??
          u.primary_email_address?.verification?.status === "verified"
        ),
      };
    })
    .filter(Boolean);
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const run = async () => {
  const admin = getFirebaseAdmin();
  const users = parseUsers();

  if (!users.length) {
    console.log("No valid users found in input file.");
    return;
  }

  const batches = chunk(users, 1000); // Firebase import limit
  let success = 0;
  let failed = 0;

  for (const batch of batches) {
    const result = await admin.auth().importUsers(batch);
    success += result.successCount;
    failed += result.failureCount;
    console.log(`Batch imported. Success: ${result.successCount}, Failed: ${result.failureCount}`);
  }

  console.log(`Import complete. Success: ${success}, Failed: ${failed}`);
};

run().catch((error) => {
  console.error("Failed to import users:", error);
  process.exit(1);
});
