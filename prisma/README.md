# Database Seeding

This directory contains scripts for seeding the database with dummy data for development and testing purposes.

## Available Scripts

### Seed Database
```bash
npm run db:seed
```
Populates the database with sample companies and job postings focused on accessibility and inclusive employment.

### Verify Seeded Data
```bash
npm run db:verify
```
Displays a summary of the seeded data including company and job counts, and accommodation coverage statistics.

### Reset and Re-seed
```bash
npx prisma migrate reset
npm run db:seed
```
Resets the database and applies all migrations, then seeds with fresh data.

## Seeded Data Overview

### Companies (6 total)
1. **Microsoft** - Technology company with 2 accessibility-focused positions
2. **Google** - Technology company with 2 accessibility-focused positions  
3. **Salesforce** - Software company with 1 accessibility consulting role
4. **Adobe** - Software company with 1 creative accessibility position
5. **Accenture** - Consulting company with 1 digital accessibility role
6. **IBM** - Technology company with 1 AI accessibility research position

### Jobs (8 total)
All jobs are published and active, featuring:
- **Accessibility-focused roles** across different specializations
- **Comprehensive accommodation support** (Visual, Hearing, Cognitive, Motor, etc.)
- **Flexible work arrangements** (Remote, Hybrid, On-site options)
- **Diverse experience levels** (Junior to Senior positions)
- **Competitive salary ranges** based on role and experience
- **Detailed accommodation descriptions** for each position

### Key Features
- **Accommodation Coverage**: All jobs include multiple accommodation types
- **Work Flexibility**: Mix of remote, hybrid, and on-site positions
- **Salary Transparency**: Clear salary ranges for all positions
- **Application Process**: Detailed application steps for each role
- **Company Diversity**: Different industries and company sizes represented

## Accommodation Types Covered
- **VISUAL**: Screen readers, magnification, high contrast (8 jobs)
- **COGNITIVE**: Memory aids, simplified interfaces, extra time (8 jobs) 
- **HEARING**: Sign language, captions, visual alerts (6 jobs)
- **MOTOR**: Alternative input devices, ergonomic equipment (6 jobs)
- **MOBILITY**: Accessible facilities, transportation (4 jobs)
- **SENSORY**: Lighting adjustments, noise control (2 jobs)

## File Structure
```
prisma/
├── seed.ts           # Main seeding script
├── verify-seed.ts    # Data verification script
└── README.md         # This documentation
```

## Customization

To add more companies or jobs:
1. Edit `prisma/seed.ts`
2. Add new company data to the companies array
3. Add new job data linking to company IDs
4. Run `npm run db:seed` to apply changes

## Development Notes

- The seed script clears existing data before inserting new records
- All jobs are set to PUBLISHED status and active by default
- Companies include realistic contact information and social links
- Jobs feature detailed requirements, benefits, and application processes
- Accommodation details are comprehensive and realistic
