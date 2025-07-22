#!/usr/bin/env node

/**
 * Test script for API-based authentication system
 * This script tests the complete authentication flow including:
 * - User registration
 * - Login
 * - Session verification
 * - Logout
 */

const baseUrl = 'http://localhost:3000'

// Test user data
const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: `test+${Date.now()}@example.com`, // Unique email
  password: 'TestPassword123!',
  role: 'JOB_SEEKER',
  agreeToTerms: true,
  agreeToPrivacy: true,
  subscribeNewsletter: false
}

console.log('🚀 Starting API Authentication System Test\n')

async function testRegistration() {
  console.log('📝 Testing User Registration...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Registration successful!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Session ID: ${data.session.id}`)
      console.log(`   Expires: ${new Date(data.session.expires).toLocaleString()}`)
      return { cookies: response.headers.get('set-cookie'), sessionId: data.session.id }
    } else {
      console.log('❌ Registration failed:', data.error)
      if (data.details) {
        console.log('   Validation errors:', data.details)
      }
      return null
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message)
    return null
  }
}

async function testLogin(cookies) {
  console.log('\n🔐 Testing User Login...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies })
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        rememberMe: true
      }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Login successful!')
      console.log(`   Welcome: ${data.user.firstName} ${data.user.lastName}`)
      console.log(`   Role: ${data.user.role}`)
      console.log(`   Session ID: ${data.session.id}`)
      return { cookies: response.headers.get('set-cookie'), sessionId: data.session.id }
    } else {
      console.log('❌ Login failed:', data.error)
      return null
    }
  } catch (error) {
    console.log('❌ Login error:', error.message)
    return null
  }
}

async function testSessionVerification(cookies) {
  console.log('\n🔍 Testing Session Verification...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        ...(cookies && { 'Cookie': cookies })
      },
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Session verification successful!')
      console.log(`   User: ${data.user.firstName} ${data.user.lastName}`)
      console.log(`   Email: ${data.user.email}`)
      console.log(`   Role: ${data.user.role}`)
      console.log(`   Session valid until: ${new Date(data.session.expires).toLocaleString()}`)
      return true
    } else {
      console.log('❌ Session verification failed:', data.error)
      return false
    }
  } catch (error) {
    console.log('❌ Session verification error:', error.message)
    return false
  }
}

async function testProfileFetch(cookies) {
  console.log('\n👤 Testing Profile Fetch...')
  
  try {
    const response = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'GET',
      headers: {
        ...(cookies && { 'Cookie': cookies })
      },
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Profile fetch successful!')
      console.log(`   Name: ${data.user.firstName} ${data.user.lastName}`)
      console.log(`   Email verified: ${data.user.isEmailVerified}`)
      console.log(`   Profile complete: ${data.user.isProfileComplete}`)
      console.log(`   Created: ${new Date(data.user.createdAt).toLocaleString()}`)
      return true
    } else {
      console.log('❌ Profile fetch failed:', data.error)
      return false
    }
  } catch (error) {
    console.log('❌ Profile fetch error:', error.message)
    return false
  }
}

async function testLogout(cookies) {
  console.log('\n🚪 Testing Logout...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'DELETE',
      headers: {
        ...(cookies && { 'Cookie': cookies })
      },
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Logout successful!')
      console.log('   Session has been terminated')
      return true
    } else {
      console.log('❌ Logout failed:', data.error)
      return false
    }
  } catch (error) {
    console.log('❌ Logout error:', error.message)
    return false
  }
}

async function testLogoutVerification(cookies) {
  console.log('\n🔍 Testing Post-Logout Session (should fail)...')
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        ...(cookies && { 'Cookie': cookies })
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.log('✅ Post-logout verification successful!')
      console.log('   Session correctly invalidated:', data.error)
      return true
    } else {
      console.log('❌ Post-logout verification failed: Session still valid')
      return false
    }
  } catch (error) {
    console.log('❌ Post-logout verification error:', error.message)
    return false
  }
}

async function runTests() {
  let passed = 0
  let total = 0

  // Test 1: Registration
  total++
  const regResult = await testRegistration()
  if (regResult) passed++

  if (!regResult) {
    console.log('\n❌ Cannot continue tests without successful registration')
    return
  }

  let { cookies } = regResult

  // Test 2: Login
  total++
  const loginResult = await testLogin()
  if (loginResult) {
    passed++
    cookies = loginResult.cookies || cookies
  }

  // Test 3: Session Verification
  total++
  const sessionResult = await testSessionVerification(cookies)
  if (sessionResult) passed++

  // Test 4: Profile Fetch
  total++
  const profileResult = await testProfileFetch(cookies)
  if (profileResult) passed++

  // Test 5: Logout
  total++
  const logoutResult = await testLogout(cookies)
  if (logoutResult) passed++

  // Test 6: Post-logout verification
  total++
  const postLogoutResult = await testLogoutVerification(cookies)
  if (postLogoutResult) passed++

  // Summary
  console.log('\n📊 Test Summary')
  console.log('================')
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${total - passed}/${total}`)
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`)

  if (passed === total) {
    console.log('\n🎉 All tests passed! API Authentication system is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API endpoints and database.')
  }

  console.log('\n💡 Next Steps:')
  console.log('  1. Visit http://localhost:3002/auth/api to test the frontend')
  console.log('  2. Try registering and logging in through the UI')
  console.log('  3. Check the dashboard at http://localhost:3002/dashboard')
  console.log('  4. Compare with NextAuth at http://localhost:3002/auth')
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests, testUser, baseUrl }
