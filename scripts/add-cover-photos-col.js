const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Client ADD COLUMN coverPhotos TEXT;');
    console.log('Successfully added coverPhotos column to Client table');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column coverPhotos already exists');
    } else {
      console.log('Result:', err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

run();
