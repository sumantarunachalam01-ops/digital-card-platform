const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    select: { id: true, slug: true, fullName: true, companyName: true, coverPhotos: true }
  });
  console.log('Current Clients:', clients);

  // For 'sammple' (Sumant A - Seven Stars Logistics), add 3 relevant cargo/freight/work showcase photos!
  const sammpleClient = clients.find(c => c.slug === 'sammple');
  if (sammpleClient) {
    const logisticsPhotos = [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80', // Cargo warehouse & logistics hub
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80', // Cargo ship / port containers
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80', // Freight truck fleet on highway
    ];
    await prisma.client.update({
      where: { id: sammpleClient.id },
      data: { coverPhotos: JSON.stringify(logisticsPhotos) }
    });
    console.log('Updated sammple with logistics cover photos!');
  }

  // For 'arun.kumar', add 3 tech/consultancy work showcase photos!
  const arunClient = clients.find(c => c.slug === 'arun.kumar');
  if (arunClient) {
    const techPhotos = [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80', // Modern skyscraper / architecture
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80', // High-tech enterprise workspace
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80', // Collaborative strategic meeting
    ];
    await prisma.client.update({
      where: { id: arunClient.id },
      data: { coverPhotos: JSON.stringify(techPhotos) }
    });
    console.log('Updated arun.kumar with tech cover photos!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
