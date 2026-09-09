const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Cloud Database Seeding...');

  // 1. Ensure Platform Settings exist
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      brandName: 'DigitalCard',
      supportEmail: 'support@digitalcard.com',
    },
  });
  console.log('✅ Platform settings initialized.');

  // 2. Seed Admin User (admin@digitalcard.com / admin123)
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@digitalcard.com' },
    update: {
      passwordHash,
      name: 'System Admin',
    },
    create: {
      email: 'admin@digitalcard.com',
      passwordHash,
      name: 'System Admin',
    },
  });
  console.log('✅ Admin user configured: admin@digitalcard.com / admin123');

  // 3. Seed Existing Clients
  const clients = [
    {
      slug: 'sammple',
      fullName: 'Sumant A',
      designation: 'Director',
      companyName: 'SEVEN STARS LOGISTICS',
      bio: 'jack of all trades, master of none.',
      profilePhoto: '/uploads/1788881575553-o7s80v.jpg',
      companyLogo: '/uploads/1788881851790-6cz9hy.JPG',
      coverPhotos: JSON.stringify([
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80',
      ]),
      phone: '+91 9087841248',
      whatsapp: '+91 9087841248',
      email: 'sumantarunachalam@gmail.com',
      website: 'sevenstarslogistics.com',
      address: 'Seven Stars logistics, no 2 goerge town, chennai, tamilnadu',
      googleMapsUrl: 'https://maps.google.com/?q=One+World+Trade+Center+New+York',
      instagram: 'https://instagram.com/alex_growth',
      facebook: '',
      linkedin: 'https://linkedin.com/in/alex-morgan-apex',
      youtube: '',
      twitter: 'https://twitter.com/alex_apex',
      companyDescription: 'Next-generation digital transformation and enterprise investment consultancy.',
      businessCategory: 'Strategic Advisory & Venture',
      customLinks: '[]',
      status: 'ACTIVE',
    },
    {
      slug: 'aathmika',
      fullName: 'AATHMIKA GANESAN S',
      designation: 'OWNER',
      companyName: 'SUMANT HEART',
      bio: 'OWNS SUMANT HEART FOR LIFE',
      profilePhoto: '/uploads/1788928302435-k24fxi.jpeg',
      companyLogo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
      coverPhotos: JSON.stringify(['/uploads/1788928309931-97arl1.jpeg']),
      phone: '+91 9442455486',
      whatsapp: '+91 9442455486',
      email: 'ag4757@srmist.edu.in',
      website: '',
      address: 'Sumant heart',
      googleMapsUrl: 'https://maps.google.com/?q=One+World+Trade+Center+New+York',
      instagram: 'https://www.instagram.com/aathmikkkaaaa?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==',
      facebook: '',
      linkedin: 'https://linkedin.com/in/alex-morgan-apex',
      youtube: '',
      twitter: 'https://twitter.com/alex_apex',
      companyDescription: 'aathhmikkkaaaa content creator at insta big influencer',
      businessCategory: 'CONTENT CREATOR ',
      customLinks: '[]',
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
      coverPhotos: JSON.stringify([
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      ]),
      phone: '+1 (555) 782-9910',
      whatsapp: '+15557829910',
      email: 'arun.kumar@xyzent.com',
      website: 'https://xyzent-demo.com',
      address: '787 Technology Plaza, 14th Floor, San Francisco, CA 94107',
      googleMapsUrl: 'https://maps.google.com/?q=San+Francisco+Financial+District',
      instagram: '',
      facebook: '',
      linkedin: 'https://linkedin.com/in/arun-kumar-xyz',
      youtube: '',
      twitter: 'https://twitter.com/arunkumar_tech',
      companyDescription: 'Global enterprise consulting, cloud architectures, and seed capital for high-growth tech ventures.',
      businessCategory: 'Corporate Consulting & Investment',
      customLinks: JSON.stringify([
        { id: 'custom-1', title: 'GitHub Open Source', url: 'https://github.com/arunkumar-tech', icon: 'github' },
        { id: 'custom-2', title: 'Book 30-min Consultation', url: 'https://calendly.com/arun-consulting', icon: 'calendar' },
      ]),
      status: 'ACTIVE',
    },
    {
      slug: 'raghupathy.g87',
      fullName: 'Raghupathy G',
      designation: 'Senior Logistics Manager',
      companyName: 'ABC Logistics & Supply Chain',
      bio: 'Spearheading global freight solutions, warehousing, and end-to-end multi-modal transport with over 12 years of industry leadership.',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
      coverPhotos: null,
      phone: '+1 (555) 999-0000',
      whatsapp: '+15553498821',
      email: 'raghupathy.g@abclogistics.com',
      website: 'https://abclogistics-demo.com',
      address: '450 Industrial Parkway, Suite 300, Logistics Center, NY 10001',
      googleMapsUrl: 'https://maps.google.com/?q=New+York+Logistics',
      instagram: 'https://instagram.com/raghu_logistics',
      facebook: '',
      linkedin: 'https://linkedin.com/in/raghupathy-g',
      youtube: '',
      twitter: 'https://twitter.com/raghu_supply',
      companyDescription: 'Premier supply chain and cold-storage distribution partner connecting North America, Europe, and Asia.',
      businessCategory: 'Logistics & Freight',
      customLinks: '[]',
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
      coverPhotos: null,
      phone: '+1 (555) 914-4420',
      whatsapp: '+15559144420',
      email: 'priya@priyadesigns.studio',
      website: 'https://priyadesigns.studio',
      address: '128 SoHo Design District, Loft 4B, New York, NY 10012',
      googleMapsUrl: 'https://maps.google.com/?q=SoHo+New+York',
      instagram: 'https://instagram.com/priyadesignstudio',
      facebook: 'https://facebook.com/priyadesignstudio',
      linkedin: 'https://linkedin.com/in/priya-sharma-designs',
      youtube: null,
      twitter: null,
      companyDescription: 'Full-service creative branding, interior architecture, and UI/UX design studio based in New York and Paris.',
      businessCategory: 'Design & Creative Studio',
      customLinks: '[]',
      status: 'ACTIVE',
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { slug: client.slug },
      update: client,
      create: client,
    });
    console.log(`✅ Seeded client: /${client.slug} (${client.fullName})`);
  }

  console.log('🎉 Database seeding complete! Ready for live production.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
