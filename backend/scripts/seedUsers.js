/**
 * ====================================
 * DATABASE SEED SCRIPT - TEST USERS
 * ====================================
 * Run this script to populate the database with test users for development.
 * 
 * Usage: node scripts/seedUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

// Test users to create
const testUsers = [
    {
        username: 'Alice Johnson',
        email: 'alice@iit.edu',
        password: 'password123',
        studentId: 'IIT001',
        department: 'Computer Science',
    },
    {
        username: 'Bob Smith',
        email: 'bob@iit.edu',
        password: 'password123',
        studentId: 'IIT002',
        department: 'Engineering',
    },
    {
        username: 'Charlie Brown',
        email: 'charlie@iit.edu',
        password: 'password123',
        studentId: 'IIT003',
        department: 'Mathematics',
    },
    {
        username: 'Diana Ross',
        email: 'diana@iit.edu',
        password: 'password123',
        studentId: 'IIT004',
        department: 'Physics',
    },
    {
        username: 'Edward Chen',
        email: 'edward@iit.edu',
        password: 'password123',
        studentId: 'IIT005',
        department: 'Computer Science',
    },
    {
        username: 'Fiona Williams',
        email: 'fiona@iit.edu',
        password: 'password123',
        studentId: 'IIT006',
        department: 'Business',
    },
    {
        username: 'George Miller',
        email: 'george@iit.edu',
        password: 'password123',
        studentId: 'IIT007',
        department: 'Engineering',
    },
    {
        username: 'Hannah Davis',
        email: 'hannah@iit.edu',
        password: 'password123',
        studentId: 'IIT008',
        department: 'Arts',
    },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check how many users already exist
        const existingCount = await User.countDocuments();
        console.log(`📊 Current users in database: ${existingCount}`);

        // Insert test users (skip if email already exists)
        let created = 0;
        let skipped = 0;

        for (const userData of testUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (exists) {
                console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
                skipped++;
            } else {
                await User.create(userData);
                console.log(`✅ Created: ${userData.username} (${userData.email})`);
                created++;
            }
        }

        console.log('\n========================================');
        console.log(`📊 Summary:`);
        console.log(`   - Created: ${created} users`);
        console.log(`   - Skipped: ${skipped} users (already existed)`);
        console.log(`   - Total now: ${existingCount + created} users`);
        console.log('========================================');
        console.log('\n🎉 Seed complete! You can now test the app with these accounts.');
        console.log('📝 All test users have password: password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seed
seedDatabase();
