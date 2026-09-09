const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'postgres';
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found at:', schemaPath);
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (target === 'postgres' || target === 'postgresql') {
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✅ Updated prisma/schema.prisma provider to "postgresql"');
} else if (target === 'sqlite') {
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✅ Updated prisma/schema.prisma provider to "sqlite"');
} else {
  console.error('Unknown target database provider. Use "postgres" or "sqlite".');
  process.exit(1);
}

try {
  console.log('Regenerating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client regenerated successfully!');
} catch (err) {
  console.error('Error generating prisma client:', err.message);
}
