// Simple script to create admin user
const { db } = require('../dist/server/db');
const { users } = require('../dist/shared/schema');
const { eq } = require('drizzle-orm');

async function createAdminUser() {
  const adminUser = {
    id: 'dev-user',
    email: 'admin@cocaresync.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.delete(users).where(eq(users.id, 'dev-user'));
    await db.insert(users).values(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@cocaresync.com');
    console.log('   User ID: dev-user');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
