import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verifying seeded data...\n');

  // Check companies
  const companies = await prisma.company.findMany({
    include: {
      jobs: {
        select: {
          id: true,
          title: true,
          status: true,
          isActive: true
        }
      }
    }
  });

  console.log(`📊 Companies: ${companies.length}`);
  companies.forEach((company, index) => {
    console.log(`  ${index + 1}. ${company.name} (${company.industry}) - ${company.jobs.length} jobs`);
  });

  // Check jobs
  const jobs = await prisma.job.findMany({
    include: {
      company: {
        select: {
          name: true
        }
      }
    }
  });

  console.log(`\n💼 Jobs: ${jobs.length}`);
  jobs.forEach((job, index) => {
    console.log(`  ${index + 1}. ${job.title} at ${job.company.name} (${job.status})`);
  });

  // Check accommodation types
  const accommodationStats = await prisma.job.groupBy({
    by: ['accommodations'],
    _count: {
      accommodations: true
    }
  });

  console.log('\n♿ Accommodation Coverage:');
  const allAccommodations = new Set();
  jobs.forEach(job => {
    job.accommodations.forEach(acc => allAccommodations.add(acc));
  });
  
  Array.from(allAccommodations).forEach(acc => {
    const count = jobs.filter(job => job.accommodations.includes(acc as any)).length;
    console.log(`  ${acc}: ${count} jobs`);
  });

  console.log('\n✅ Data verification completed!');
}

verifyData()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
