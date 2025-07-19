#!/usr/bin/env node

/**
 * Test script for authentication API endpoints
 * Run with: node test-auth.js
 */

const API_BASE = 'http://localhost:3001';

async function testEmailCheck() {
  console.log('🔍 Testing email check API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const data = await response.json();
    console.log('✅ Email check response:', data);
    return true;
  } catch (error) {
    console.error('❌ Email check failed:', error.message);
    return false;
  }
}

async function testRegistration() {
  console.log('📝 Testing registration API...');
  
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: `test+${Date.now()}@example.com`, // Unique email
    password: 'TestPassword123!',
    role: 'JOB_SEEKER',
    agreeToTerms: true,
    agreeToPrivacy: true,
    subscribeNewsletter: true
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data.message);
      console.log('👤 Created user ID:', data.user.id);
      return data.user;
    } else {
      console.error('❌ Registration failed:', data.error);
      if (data.details) {
        console.error('📋 Validation errors:', data.details);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Registration request failed:', error.message);
    return null;
  }
}

async function testDuplicateRegistration() {
  console.log('🔄 Testing duplicate email registration...');
  
  const duplicateUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@example.com', // Use same email
    password: 'TestPassword123!',
    role: 'EMPLOYER',
    agreeToTerms: true,
    agreeToPrivacy: true,
    subscribeNewsletter: false
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateUser)
    });
    
    const data = await response.json();
    
    if (!response.ok && data.error.includes('already exists')) {
      console.log('✅ Duplicate email correctly rejected:', data.error);
      return true;
    } else {
      console.error('❌ Duplicate email should have been rejected');
      return false;
    }
  } catch (error) {
    console.error('❌ Duplicate registration test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting authentication API tests...\n');
  
  const results = {
    emailCheck: await testEmailCheck(),
    registration: await testRegistration(),
    duplicateRegistration: await testDuplicateRegistration()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Authentication system is working correctly!');
    console.log('📱 You can now test the frontend at: http://localhost:3001/auth');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEmailCheck, testRegistration, testDuplicateRegistration };
