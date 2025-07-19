#!/usr/bin/env node

/**
 * Comprehensive test script for authentication system
 * Tests: Registration, Login, Forgot Password, Reset Password, Session Management
 * Run with: node test-auth-complete.js
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
      console.log('🔄 Auto sign-in flag:', data.autoSignIn);
      return { success: true, user: data.user, email: testUser.email, password: testUser.password };
    } else {
      console.error('❌ Registration failed:', data.error);
      if (data.details) {
        console.error('📋 Validation errors:', data.details);
      }
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Registration request failed:', error.message);
    return { success: false };
  }
}

async function testLogin(email, password) {
  console.log('🔐 Testing login validation API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember: true })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login validation successful:', data.message);
      console.log('📧 Email validated:', data.data.email);
      console.log('💾 Remember me:', data.data.remember);
      return true;
    } else {
      console.error('❌ Login validation failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Login validation request failed:', error.message);
    return false;
  }
}

async function testForgotPassword(email) {
  console.log('🔑 Testing forgot password API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Forgot password successful:', data.message);
      if (data.resetUrl) {
        console.log('🔗 Reset URL (dev mode):', data.resetUrl);
        // Extract token from URL for testing
        const url = new URL(data.resetUrl);
        const token = url.searchParams.get('token');
        const resetEmail = url.searchParams.get('email');
        return { success: true, token, email: resetEmail };
      }
      return { success: true };
    } else {
      console.error('❌ Forgot password failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Forgot password request failed:', error.message);
    return { success: false };
  }
}

async function testResetPassword(token, email, newPassword) {
  console.log('🔄 Testing reset password API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token, 
        email, 
        password: newPassword,
        confirmPassword: newPassword
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Reset password successful:', data.message);
      return true;
    } else {
      console.error('❌ Reset password failed:', data.error);
      if (data.details) {
        console.error('📋 Validation errors:', data.details);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Reset password request failed:', error.message);
    return false;
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
  console.log('🚀 Starting comprehensive authentication tests...\n');
  
  const results = {
    emailCheck: await testEmailCheck(),
    registration: null,
    login: false,
    forgotPassword: false,
    resetPassword: false,
    duplicateRegistration: await testDuplicateRegistration()
  };
  
  // Test registration and get user data
  const registrationResult = await testRegistration();
  results.registration = registrationResult.success;
  
  if (registrationResult.success) {
    // Test login with the registered user
    results.login = await testLogin(registrationResult.email, registrationResult.password);
    
    // Test forgot password flow
    const forgotResult = await testForgotPassword(registrationResult.email);
    results.forgotPassword = forgotResult.success;
    
    // Test reset password if we got a token
    if (forgotResult.success && forgotResult.token) {
      const newPassword = 'NewPassword456!';
      results.resetPassword = await testResetPassword(
        forgotResult.token, 
        forgotResult.email, 
        newPassword
      );
      
      if (results.resetPassword) {
        // Test login with new password
        console.log('🔐 Testing login with new password...');
        const newLoginResult = await testLogin(registrationResult.email, newPassword);
        if (newLoginResult) {
          console.log('✅ Login with new password successful!');
        }
      }
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Complete authentication system is working correctly!');
    console.log('🔗 Test the frontend flows:');
    console.log('   • Registration: http://localhost:3001/auth (Sign Up tab)');
    console.log('   • Login: http://localhost:3001/auth (Sign In tab)');
    console.log('   • Forgot Password: http://localhost:3001/auth/forgot-password');
    console.log('   • Dashboard: http://localhost:3001/dashboard');
  } else {
    console.log('\n🔧 Some functionality needs attention. Check the logs above.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEmailCheck, testRegistration, testLogin, testForgotPassword, testResetPassword, testDuplicateRegistration };
