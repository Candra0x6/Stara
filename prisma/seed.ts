import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.jobApplication.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobRecommendationRating.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();

  console.log('🗑️  Cleaned existing data...');

  // Create Companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Microsoft',
        description: 'Microsoft is a leading technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and services. We are committed to creating an inclusive workplace where everyone can thrive.',
        website: 'https://microsoft.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png',
        size: 'ENTERPRISE',
        industry: 'Technology',
        location: 'Redmond, WA',
        culture: 'We believe in empowering every person and organization on the planet to achieve more. Our culture is built on respect, integrity, and accountability, with a strong focus on diversity and inclusion.',
        values: ['Respect', 'Integrity', 'Accountability', 'Diversity', 'Innovation'],
        contactEmail: 'careers@microsoft.com',
        contactPhone: '+1-800-642-7676',
        linkedinUrl: 'https://linkedin.com/company/microsoft',
        twitterUrl: 'https://twitter.com/microsoft'
      }
    }),
    
    prisma.company.create({
      data: {
        name: 'Google',
        description: 'Google is a multinational technology company that specializes in Internet-related services and products. We are committed to building products that help create opportunities for everyone, including people with disabilities.',
        website: 'https://google.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png',
        size: 'ENTERPRISE',
        industry: 'Technology',
        location: 'Mountain View, CA',
        culture: 'Our mission is to organize the world\'s information and make it universally accessible and useful. We foster an inclusive environment where diverse perspectives drive innovation.',
        values: ['Innovation', 'Inclusion', 'Excellence', 'Collaboration', 'Impact'],
        contactEmail: 'careers@google.com',
        contactPhone: '+1-650-253-0000',
        linkedinUrl: 'https://linkedin.com/company/google',
        twitterUrl: 'https://twitter.com/google'
      }
    }),

    prisma.company.create({
      data: {
        name: 'Salesforce',
        description: 'Salesforce is a cloud-based software company that provides customer relationship management software and applications focused on sales, customer service, marketing automation, analytics, and application development.',
        website: 'https://salesforce.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/Salesforce-Logo.png',
        size: 'LARGE',
        industry: 'Software',
        location: 'San Francisco, CA',
        culture: 'We believe business can be the greatest platform for change. Our culture is built on our core values of Trust, Customer Success, Innovation, and Equality.',
        values: ['Trust', 'Customer Success', 'Innovation', 'Equality'],
        contactEmail: 'careers@salesforce.com',
        contactPhone: '+1-415-901-7000',
        linkedinUrl: 'https://linkedin.com/company/salesforce',
        twitterUrl: 'https://twitter.com/salesforce'
      }
    }),

    prisma.company.create({
      data: {
        name: 'Adobe',
        description: 'Adobe is changing the world through digital experiences. We help our customers create, deliver and optimize content and applications across every device and touchpoint.',
        website: 'https://adobe.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/Adobe-Logo.png',
        size: 'LARGE',
        industry: 'Software',
        location: 'San Jose, CA',
        culture: 'We are passionate about empowering people to create beautiful and powerful digital experiences. Our inclusive culture celebrates diverse perspectives and backgrounds.',
        values: ['Genuine', 'Exceptional', 'Innovative', 'Involved'],
        contactEmail: 'careers@adobe.com',
        contactPhone: '+1-408-536-6000',
        linkedinUrl: 'https://linkedin.com/company/adobe',
        twitterUrl: 'https://twitter.com/adobe'
      }
    }),

    prisma.company.create({
      data: {
        name: 'Accenture',
        description: 'Accenture is a global professional services company with leading capabilities in digital, cloud and security. We combine unmatched experience and specialized skills across more than 40 industries.',
        website: 'https://accenture.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/Accenture-Logo.png',
        size: 'ENTERPRISE',
        industry: 'Consulting',
        location: 'Dublin, Ireland',
        culture: 'We embrace the power of change to create value and shared success for our clients, people, shareholders, partners and communities.',
        values: ['Client Value Creation', 'One Global Network', 'Respect for the Individual', 'Best People', 'Integrity', 'Stewardship'],
        contactEmail: 'careers@accenture.com',
        contactPhone: '+353-1-646-2000',
        linkedinUrl: 'https://linkedin.com/company/accenture',
        twitterUrl: 'https://twitter.com/accenture'
      }
    }),

    prisma.company.create({
      data: {
        name: 'IBM',
        description: 'IBM is a leading global hybrid cloud and AI company. We help clients in more than 175 countries capitalize on insights from their data and drive meaningful innovation.',
        website: 'https://ibm.com',
        logo: 'https://logos-world.net/wp-content/uploads/2020/09/IBM-Logo.png',
        size: 'ENTERPRISE',
        industry: 'Technology',
        location: 'Armonk, NY',
        culture: 'IBMers believe that the application of intelligence, reason and science can improve business, society and the human condition.',
        values: ['Dedication to client success', 'Innovation that matters', 'Trust and personal responsibility'],
        contactEmail: 'careers@ibm.com',
        contactPhone: '+1-914-499-1900',
        linkedinUrl: 'https://linkedin.com/company/ibm',
        twitterUrl: 'https://twitter.com/ibm'
      }
    })
  ]);

  console.log(`✅ Created ${companies.length} companies`);

  // Create Jobs
  const jobs = [];

  // Microsoft Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'Senior Software Engineer - Accessibility',
        slug: 'microsoft-senior-software-engineer-accessibility',
        description: 'Join our accessibility team to build inclusive experiences for millions of users worldwide. You will work on cutting-edge accessibility features across Microsoft products, ensuring our technology is usable by everyone.',
        responsibilities: [
          'Design and implement accessibility features in Microsoft products',
          'Collaborate with UX designers to create inclusive user experiences',
          'Conduct accessibility audits and testing',
          'Mentor junior developers on accessibility best practices',
          'Work with assistive technology vendors and disability community'
        ],
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of software development experience',
          'Strong knowledge of accessibility standards (WCAG, Section 508)',
          'Experience with screen readers and assistive technologies',
          'Proficiency in C#, JavaScript, or Python'
        ],
        preferredSkills: [
          'Experience with ARIA and semantic HTML',
          'Knowledge of disability studies or assistive technology',
          'Familiarity with accessibility testing tools',
          'Understanding of cognitive accessibility principles'
        ],
        benefits: [
          'Comprehensive health insurance',
          'Flexible work arrangements',
          'Professional development budget',
          'Assistive technology support',
          'Inclusive workplace accommodations'
        ],
        companyId: companies[0].id,
        location: 'Redmond, WA',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'SENIOR',
        salaryMin: 120000,
        salaryMax: 180000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'COGNITIVE', 'MOTOR'],
        accommodationDetails: 'We provide comprehensive accommodations including screen readers, sign language interpreters, ergonomic equipment, flexible schedules, and quiet workspaces.',
        applicationProcess: [
          'Submit application with resume and cover letter',
          'Phone screening with hiring manager',
          'Technical interview with accessibility focus',
          'Team interview and culture fit',
          'Final interview with senior leadership'
        ],
        applicationDeadline: new Date('2025-08-30'),
        status: 'PUBLISHED',
        isActive: true,
        isFeatured: true,
        metaTitle: 'Senior Software Engineer - Accessibility at Microsoft',
        metaDescription: 'Join Microsoft\'s accessibility team to build inclusive technology for everyone. Remote and hybrid options available.',
        viewCount: 245,
        applicationCount: 32,
        publishedAt: new Date('2025-07-25')
      }
    }),

    await prisma.job.create({
      data: {
        title: 'UX Designer - Inclusive Design',
        slug: 'microsoft-ux-designer-inclusive-design',
        description: 'Create inclusive design solutions that work for users of all abilities. You\'ll be responsible for designing accessible user interfaces and conducting inclusive research.',
        responsibilities: [
          'Design accessible user interfaces following inclusive design principles',
          'Conduct user research with diverse user groups including people with disabilities',
          'Create design systems that support accessibility',
          'Collaborate with engineers to implement accessible designs',
          'Advocate for inclusive design across product teams'
        ],
        requirements: [
          'Bachelor\'s degree in Design, HCI, or related field',
          '3+ years of UX design experience',
          'Portfolio demonstrating inclusive design work',
          'Knowledge of accessibility guidelines and standards',
          'Experience with design tools (Figma, Sketch, Adobe Creative Suite)'
        ],
        preferredSkills: [
          'Experience designing for assistive technologies',
          'Understanding of cognitive load and usability principles',
          'Knowledge of color contrast and typography accessibility',
          'Experience with user testing and research methods'
        ],
        benefits: [
          'Health and wellness programs',
          'Creative workspace accommodations',
          'Professional development opportunities',
          'Flexible work schedule',
          'Ergonomic equipment provided'
        ],
        companyId: companies[0].id,
        location: 'Seattle, WA',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'MID_LEVEL',
        salaryMin: 85000,
        salaryMax: 125000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'COGNITIVE', 'MOTOR', 'SENSORY'],
        accommodationDetails: 'We provide adjustable desks, specialized software, flexible lighting, and accommodations for various working styles and needs.',
        applicationProcess: [
          'Submit portfolio and application',
          'Portfolio review with design team',
          'Design challenge with accessibility focus',
          'Team interview',
          'Final interview with design leadership'
        ],
        status: 'PUBLISHED',
        isActive: true,
        metaTitle: 'UX Designer - Inclusive Design at Microsoft',
        metaDescription: 'Design inclusive experiences at Microsoft. Join our team focused on accessibility and inclusive design.',
        viewCount: 189,
        applicationCount: 28,
        publishedAt: new Date('2025-07-20')
      }
    })
  );

  // Google Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'Product Manager - Accessibility',
        slug: 'google-product-manager-accessibility',
        description: 'Lead product strategy for accessibility features across Google products. Drive initiatives that make our products more inclusive and accessible to users with disabilities.',
        responsibilities: [
          'Define product strategy for accessibility features',
          'Work with engineering teams to prioritize accessibility improvements',
          'Conduct market research on accessibility needs',
          'Partner with disability advocacy groups',
          'Track and measure accessibility impact metrics'
        ],
        requirements: [
          'Bachelor\'s degree in Business, Computer Science, or related field',
          '4+ years of product management experience',
          'Understanding of accessibility standards and guidelines',
          'Experience working with cross-functional teams',
          'Strong analytical and communication skills'
        ],
        preferredSkills: [
          'MBA or advanced degree',
          'Experience in accessibility or assistive technology',
          'Data analysis and metrics experience',
          'User research background'
        ],
        benefits: [
          'Comprehensive health coverage',
          'Stock options',
          'Flexible work environment',
          'Learning and development budget',
          'Wellness programs'
        ],
        companyId: companies[1].id,
        location: 'Mountain View, CA',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'MID_LEVEL',
        salaryMin: 130000,
        salaryMax: 190000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'COGNITIVE', 'MOBILITY'],
        accommodationDetails: 'Google provides comprehensive workplace accommodations including assistive technology, flexible schedules, and accessible facilities.',
        applicationProcess: [
          'Submit application and resume',
          'Recruiter phone screen',
          'Product sense interview',
          'Analytical interview',
          'Leadership and cultural fit interview'
        ],
        status: 'PUBLISHED',
        isActive: true,
        isFeatured: true,
        metaTitle: 'Product Manager - Accessibility at Google',
        metaDescription: 'Lead accessibility product strategy at Google. Make our products more inclusive for everyone.',
        viewCount: 312,
        applicationCount: 45,
        publishedAt: new Date('2025-07-28')
      }
    }),

    await prisma.job.create({
      data: {
        title: 'Software Engineer - Android Accessibility',
        slug: 'google-software-engineer-android-accessibility',
        description: 'Work on Android accessibility features that help millions of users with disabilities navigate their devices more effectively.',
        responsibilities: [
          'Develop accessibility features for Android OS',
          'Improve TalkBack and other accessibility services',
          'Collaborate with hardware partners on accessibility',
          'Write and maintain accessibility APIs',
          'Test features with assistive technology users'
        ],
        requirements: [
          'Bachelor\'s degree in Computer Science',
          '3+ years of Android development experience',
          'Proficiency in Java and Kotlin',
          'Understanding of Android accessibility framework',
          'Experience with accessibility testing'
        ],
        preferredSkills: [
          'Experience with assistive technologies',
          'Knowledge of accessibility standards',
          'UI/UX design understanding',
          'Machine learning background'
        ],
        benefits: [
          'Competitive salary and equity',
          'Health and dental insurance',
          'Free meals and snacks',
          'Transportation benefits',
          'Parental leave'
        ],
        companyId: companies[1].id,
        location: 'Mountain View, CA',
        workType: 'FULL_TIME',
        isRemote: false,
        isHybrid: true,
        experience: 'MID_LEVEL',
        salaryMin: 110000,
        salaryMax: 160000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'MOTOR', 'COGNITIVE'],
        accommodationDetails: 'We provide workstation accommodations, assistive technology, and flexible work arrangements as needed.',
        applicationProcess: [
          'Online application submission',
          'Technical phone screen',
          'Onsite technical interviews',
          'System design interview',
          'Behavioral interview'
        ],
        status: 'PUBLISHED',
        isActive: true,
        metaTitle: 'Software Engineer - Android Accessibility at Google',
        metaDescription: 'Build Android accessibility features that empower millions of users with disabilities.',
        viewCount: 198,
        applicationCount: 34,
        publishedAt: new Date('2025-07-26')
      }
    })
  );

  // Salesforce Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'Accessibility Consultant',
        slug: 'salesforce-accessibility-consultant',
        description: 'Help enterprise clients implement accessible solutions using Salesforce products. Provide expertise on accessibility best practices and compliance.',
        responsibilities: [
          'Conduct accessibility audits for client implementations',
          'Provide accessibility training to client teams',
          'Design accessible Salesforce configurations',
          'Support compliance with accessibility regulations',
          'Create accessibility documentation and guidelines'
        ],
        requirements: [
          'Bachelor\'s degree in relevant field',
          '3+ years of accessibility consulting experience',
          'Salesforce certification (Admin or Developer)',
          'Knowledge of WCAG 2.1 AA standards',
          'Experience with accessibility testing tools'
        ],
        preferredSkills: [
          'Advanced Salesforce certifications',
          'Legal compliance background',
          'Training and presentation skills',
          'Project management experience'
        ],
        benefits: [
          'Competitive salary',
          'Health and wellness programs',
          'Professional development opportunities',
          'Flexible work arrangements',
          'Equity compensation'
        ],
        companyId: companies[2].id,
        location: 'San Francisco, CA',
        workType: 'REMOTE',
        isRemote: true,
        isHybrid: false,
        experience: 'MID_LEVEL',
        salaryMin: 95000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'COGNITIVE', 'MOBILITY', 'MOTOR'],
        accommodationDetails: 'Remote-first position with full accommodation support including assistive technology, flexible schedules, and accessible meeting tools.',
        applicationProcess: [
          'Submit application with cover letter',
          'Initial phone screening',
          'Technical assessment on accessibility',
          'Client scenario discussion',
          'Final interview with team lead'
        ],
        status: 'PUBLISHED',
        isActive: true,
        metaTitle: 'Accessibility Consultant at Salesforce',
        metaDescription: 'Help enterprises build accessible Salesforce solutions. Remote position with comprehensive accommodations.',
        viewCount: 156,
        applicationCount: 23,
        publishedAt: new Date('2025-07-22')
      }
    })
  );

  // Adobe Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'Frontend Developer - Creative Tools Accessibility',
        slug: 'adobe-frontend-developer-creative-tools-accessibility',
        description: 'Make Adobe\'s creative tools more accessible to artists and designers with disabilities. Work on innovative solutions for accessible creative workflows.',
        responsibilities: [
          'Develop accessible interfaces for Adobe Creative Suite',
          'Implement keyboard navigation and screen reader support',
          'Create accessible color and contrast tools',
          'Optimize creative workflows for assistive technology users',
          'Collaborate with product teams on inclusive design'
        ],
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '4+ years of frontend development experience',
          'Proficiency in JavaScript, HTML, CSS',
          'Experience with accessibility standards and testing',
          'Understanding of creative software workflows'
        ],
        preferredSkills: [
          'Experience with Canvas and SVG accessibility',
          'Knowledge of color theory and visual design',
          'Familiarity with assistive technologies',
          'React or Angular experience'
        ],
        benefits: [
          'Creative software licenses',
          'Health and dental coverage',
          'Stock purchase plan',
          'Professional development budget',
          'Flexible work schedule'
        ],
        companyId: companies[3].id,
        location: 'San Jose, CA',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'SENIOR',
        salaryMin: 115000,
        salaryMax: 165000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'MOTOR', 'COGNITIVE', 'SENSORY'],
        accommodationDetails: 'We provide creative workspace accommodations, specialized input devices, adjustable lighting, and assistive technology for creative work.',
        applicationProcess: [
          'Portfolio and application review',
          'Technical screening interview',
          'Live coding session with accessibility focus',
          'Team collaboration interview',
          'Creative problem-solving discussion'
        ],
        status: 'PUBLISHED',
        isActive: true,
        isFeatured: true,
        metaTitle: 'Frontend Developer - Creative Tools Accessibility at Adobe',
        metaDescription: 'Make creative tools accessible for all artists and designers. Join Adobe\'s accessibility team.',
        viewCount: 203,
        applicationCount: 29,
        publishedAt: new Date('2025-07-24')
      }
    })
  );

  // Accenture Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'Digital Accessibility Analyst',
        slug: 'accenture-digital-accessibility-analyst',
        description: 'Help clients achieve digital accessibility compliance and create inclusive digital experiences. Work on diverse projects across industries.',
        responsibilities: [
          'Conduct accessibility audits for client websites and applications',
          'Develop accessibility testing strategies',
          'Create accessibility compliance reports',
          'Train client teams on accessibility best practices',
          'Support legal compliance initiatives'
        ],
        requirements: [
          'Bachelor\'s degree in relevant field',
          '2+ years of accessibility testing experience',
          'Knowledge of WCAG, Section 508, ADA compliance',
          'Experience with accessibility testing tools',
          'Strong communication and client management skills'
        ],
        preferredSkills: [
          'Certified Professional in Accessibility Core Competencies (CPACC)',
          'Web Accessibility Specialist (WAS) certification',
          'Experience with multiple testing methodologies',
          'Project management skills'
        ],
        benefits: [
          'Global career opportunities',
          'Comprehensive training programs',
          'Health and wellness benefits',
          'Flexible work arrangements',
          'Professional certification support'
        ],
        companyId: companies[4].id,
        location: 'Chicago, IL',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'JUNIOR',
        salaryMin: 65000,
        salaryMax: 90000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'COGNITIVE', 'MOBILITY'],
        accommodationDetails: 'We provide comprehensive workplace accommodations and support for diverse working styles and accessibility needs.',
        applicationProcess: [
          'Online application submission',
          'HR phone screening',
          'Technical assessment on accessibility',
          'Client interaction simulation',
          'Final interview with practice lead'
        ],
        status: 'PUBLISHED',
        isActive: true,
        metaTitle: 'Digital Accessibility Analyst at Accenture',
        metaDescription: 'Help enterprises achieve digital accessibility compliance. Hybrid work with comprehensive benefits.',
        viewCount: 142,
        applicationCount: 18,
        publishedAt: new Date('2025-07-21')
      }
    })
  );

  // IBM Jobs
  jobs.push(
    await prisma.job.create({
      data: {
        title: 'AI Research Scientist - Accessibility Technologies',
        slug: 'ibm-ai-research-scientist-accessibility-technologies',
        description: 'Research and develop AI-powered accessibility solutions. Work on cutting-edge projects that use artificial intelligence to break down barriers for people with disabilities.',
        responsibilities: [
          'Research AI applications for accessibility challenges',
          'Develop machine learning models for assistive technologies',
          'Publish research findings in academic conferences',
          'Collaborate with disability community for user feedback',
          'Prototype innovative accessibility solutions'
        ],
        requirements: [
          'PhD in Computer Science, AI, or related field',
          '3+ years of AI/ML research experience',
          'Strong background in machine learning and deep learning',
          'Experience with accessibility technologies',
          'Published research in relevant areas'
        ],
        preferredSkills: [
          'Computer vision and natural language processing',
          'Experience with assistive technology development',
          'Knowledge of disability studies',
          'Open source contribution experience'
        ],
        benefits: [
          'Research publication support',
          'Conference attendance funding',
          'Sabbatical opportunities',
          'Health and retirement benefits',
          'Flexible research schedule'
        ],
        companyId: companies[5].id,
        location: 'Yorktown Heights, NY',
        workType: 'HYBRID',
        isRemote: true,
        isHybrid: true,
        experience: 'SENIOR',
        salaryMin: 140000,
        salaryMax: 200000,
        salaryCurrency: 'USD',
        accommodations: ['VISUAL', 'HEARING', 'COGNITIVE', 'MOBILITY', 'MOTOR'],
        accommodationDetails: 'Research environment with full accessibility support including specialized equipment, flexible schedules, and research accommodation resources.',
        applicationProcess: [
          'Submit research portfolio and CV',
          'Research presentation to team',
          'Technical interview on AI/ML',
          'Disability community engagement discussion',
          'Final interview with research leadership'
        ],
        status: 'PUBLISHED',
        isActive: true,
        isFeatured: true,
        metaTitle: 'AI Research Scientist - Accessibility Technologies at IBM',
        metaDescription: 'Research AI solutions for accessibility challenges. Join IBM\'s cutting-edge accessibility research team.',
        viewCount: 278,
        applicationCount: 12,
        publishedAt: new Date('2025-07-29')
      }
    })
  );

  console.log(`✅ Created ${jobs.length} jobs`);

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
