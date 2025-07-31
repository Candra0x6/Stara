const fetch = require('node-fetch');

async function testJobCreation() {
  try {
    // Test data that matches the API schema exactly
    const jobData = {
      title: "Senior Software Engineer",
      description: "We are looking for a senior software engineer to join our team.",
      requirements: "5+ years of experience with JavaScript, React, and Node.js",
      location: "New York, NY",
      companyId: "test-company-id", // This will fail but we can see the validation error
      workType: "HYBRID", // Matches the enum in our API
      isRemote: true,
      isHybrid: true,
      experience: "SENIOR", // Matches the enum in our API
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: "USD",
      accommodations: ["FLEXIBLE_SCHEDULE", "ERGONOMIC_WORKSPACE"],
      accommodationDetails: "We provide flexible working hours and ergonomic equipment.",
      applicationDeadline: "2024-12-31T23:59:59.000Z",
      status: "DRAFT",
      isActive: false,
      isFeatured: false
    };

    console.log('🧪 Testing Job Creation API Schema Validation');
    console.log('📝 Job Data:', JSON.stringify(jobData, null, 2));

    const response = await fetch('http://localhost:3000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    const result = await response.json();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));

    if (response.status === 401) {
      console.log('✅ Expected authentication error - API is properly protected');
    } else if (response.status === 400) {
      console.log('🔍 Validation Error Details:');
      if (result.error) {
        console.log('❌', result.error);
      }
      if (result.details) {
        result.details.forEach(detail => {
          console.log(`  - ${detail.path.join('.')}: ${detail.message}`);
        });
      }
    } else {
      console.log('📝 Response:', result);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testJobCreation();
