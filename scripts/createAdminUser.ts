import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

async function createAdminUser() {
  const adminUser = {
    id: 'dev-user',
    email: 'admin@cocaresync.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    updatedAt: new Date(),
  };

  try {
    // First, try to find any existing admin user with the same email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@cocaresync.com')
    });

    if (existingUser) {
      // If user exists with this email, update it to be our admin user
      await db.update(users)
        .set({
          ...adminUser,
          id: existingUser.id, // Keep the existing ID to avoid conflicts
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
      
      console.log(' Existing admin user updated successfully!');
    } else {
      // If no user exists with this email, create a new one
      await db.insert(users).values({
        ...adminUser,
        createdAt: new Date(),
      });
      console.log(' New admin user created successfully!');
    }
    
    console.log('   Email: admin@cocaresync.com');
    console.log('   User ID: dev-user');
  } catch (error) {
    console.error(' Error managing admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
