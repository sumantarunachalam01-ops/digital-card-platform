import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@digitalcard.com' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@digitalcard.com',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
    },
  });
  console.log('Admin user seeded: admin@digitalcard.com / admin123');

  // 2. Seed Platform Settings
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: { brandName: 'DigitalCard' },
    create: {
      id: 'default',
      brandName: 'DigitalCard',
      supportEmail: 'support@digitalcard.com',
    },
  });
  console.log('Platform settings seeded');

  // 3. Seed Sample Clients
  const sampleClients = [
    {
      slug: 'raghupathy.g87',
      fullName: 'Raghupathy G',
      designation: 'Senior Logistics Manager',
      companyName: 'ABC Logistics & Supply Chain',
      bio: 'Spearheading global freight solutions, warehousing, and end-to-end multi-modal transport with over 12 years of industry leadership.',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
      phone: '+1 (555) 349-8821',
      whatsapp: '+15553498821',
      email: 'raghupathy.g@abclogistics.com',
      website: 'https://abclogistics-demo.com',
      address: '450 Industrial Parkway, Suite 300, Logistics Center, NY 10001',
      googleMapsUrl: 'https://maps.google.com/?q=New+York+Logistics',
      instagram: 'https://instagram.com/raghu_logistics',
      linkedin: 'https://linkedin.com/in/raghupathy-g',
      twitter: 'https://twitter.com/raghu_supply',
      companyDescription: 'Premier supply chain and cold-storage distribution partner connecting North America, Europe, and Asia.',
      businessCategory: 'Logistics & Freight',
      status: 'ACTIVE',
    },
    {
      slug: 'arun.kumar',
      fullName: 'Arun Kumar',
      designation: 'Managing Director',
      companyName: 'XYZ Enterprises Ltd',
      bio: 'Strategic investor, technology advisor, and corporate leader guiding digital transformation initiatives for Fortune 500 enterprises.',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
      phone: '+1 (555) 782-9910',
      whatsapp: '+15557829910',
      email: 'arun.kumar@xyzent.com',
      website: 'https://xyzent-demo.com',
      address: '787 Technology Plaza, 14th Floor, San Francisco, CA 94107',
      googleMapsUrl: 'https://maps.google.com/?q=San+Francisco+Financial+District',
      linkedin: 'https://linkedin.com/in/arun-kumar-xyz',
      twitter: 'https://twitter.com/arunkumar_tech',
      youtube: 'https://youtube.com/@xyzentventures',
      companyDescription: 'Global enterprise consulting, cloud architectures, and seed capital for high-growth tech ventures.',
      businessCategory: 'Corporate Consulting & Investment',
      status: 'ACTIVE',
    },
    {
      slug: 'priya.s',
      fullName: 'Priya Sharma',
      designation: 'Creative Founder & CEO',
      companyName: 'Priya Designs & Studios',
      bio: 'Award-winning creative director blending architectural minimalism with digital product branding for luxury lifestyle brands.',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      companyLogo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
      phone: '+1 (555) 914-4420',
      whatsapp: '+15559144420',
      email: 'priya@priyadesigns.studio',
      website: 'https://priyadesigns.studio',
      address: '128 SoHo Design District, Loft 4B, New York, NY 10012',
      googleMapsUrl: 'https://maps.google.com/?q=SoHo+New+York',
      instagram: 'https://instagram.com/priyadesignstudio',
      linkedin: 'https://linkedin.com/in/priya-sharma-designs',
      facebook: 'https://facebook.com/priyadesignstudio',
      companyDescription: 'Full-service creative branding, interior architecture, and UI/UX design studio based in New York and Paris.',
      businessCategory: 'Design & Creative Studio',
      status: 'ACTIVE',
    },
  ];

  for (const clientData of sampleClients) {
    const client = await prisma.client.upsert({
      where: { slug: clientData.slug },
      update: clientData,
      create: clientData,
    });

    // Seed some initial views for realistic analytics
    const existingViews = await prisma.profileAnalytics.count({
      where: { clientId: client.id },
    });

    if (existingViews === 0) {
      const now = new Date();
      const views = [
        { clientId: client.id, deviceType: 'Mobile', referrer: 'nfc_tap', viewedAt: new Date(now.getTime() - 1000 * 60 * 30) },
        { clientId: client.id, deviceType: 'Mobile', referrer: 'qr_scan', viewedAt: new Date(now.getTime() - 1000 * 60 * 120) },
        { clientId: client.id, deviceType: 'Desktop', referrer: 'direct', viewedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24) },
        { clientId: client.id, deviceType: 'Mobile', referrer: 'qr_scan', viewedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48) },
      ];
      for (const v of views) {
        await prisma.profileAnalytics.create({ data: v });
      }
    }

    console.log(`Client seeded: ${client.fullName} (/${client.slug})`);
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
