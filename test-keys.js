// test-keys.js - Chạy script này để test từng API key
// Usage: node test-keys.js

const API_KEYS = [
  'AIzaSyBSQK2DJamlWNmX0RUnM-xeFaQqBu38Jr8',
  'AIzaSyC9O0GW2T3VK5r5SZ8LRKXyUizUrsd1UeY',
  'AIzaSyBH0Pk6YBZ9a19MmkJu0mW_L1fsgUtN5oU',
  'AIzaSyD3853traZ43dflkcqD_cCrSeLWYEnozHI'
];

const testApiKey = async (apiKey, index) => {
  const keyPreview = apiKey.substring(0, 20) + '...';
  console.log(`\n🔍 Testing Key ${index + 1}: ${keyPreview}`);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hello in one word'
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Key ${index + 1} WORKS!`);
      console.log(`   Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'}`);
      return { success: true, key: index + 1 };
    } else {
      console.log(`❌ Key ${index + 1} FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error?.message || JSON.stringify(data)}`);
      return { success: false, key: index + 1, error: data.error?.message };
    }
  } catch (error) {
    console.log(`❌ Key ${index + 1} ERROR`);
    console.log(`   ${error.message}`);
    return { success: false, key: index + 1, error: error.message };
  }
};

const testAllKeys = async () => {
  console.log('🚀 Starting API Keys Test...\n');
  console.log(`Testing ${API_KEYS.length} keys...`);
  
  const results = [];
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const result = await testApiKey(API_KEYS[i], i);
    results.push(result);
    
    // Delay 2 giây giữa mỗi test để tránh rate limit
    if (i < API_KEYS.length - 1) {
      console.log('   ⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  const workingKeys = results.filter(r => r.success);
  const failedKeys = results.filter(r => !r.success);
  
  console.log(`✅ Working keys: ${workingKeys.length}/${API_KEYS.length}`);
  if (workingKeys.length > 0) {
    console.log(`   Keys: ${workingKeys.map(k => k.key).join(', ')}`);
  }
  
  console.log(`❌ Failed keys: ${failedKeys.length}/${API_KEYS.length}`);
  if (failedKeys.length > 0) {
    console.log(`   Keys: ${failedKeys.map(k => k.key).join(', ')}`);
    console.log('\n   Common errors:');
    failedKeys.forEach(k => {
      console.log(`   - Key ${k.key}: ${k.error}`);
    });
  }
  
  if (workingKeys.length === 0) {
    console.log('\n⚠️  WARNING: No working keys found!');
    console.log('   Please check:');
    console.log('   1. Keys are copied correctly');
    console.log('   2. Gemini API is enabled in Google Cloud Console');
    console.log('   3. Keys are not restricted by IP/API');
    console.log('   4. You are not hitting free tier quota limit');
  } else if (workingKeys.length < API_KEYS.length) {
    console.log('\n⚠️  Some keys are not working. Consider replacing them.');
  } else {
    console.log('\n🎉 All keys are working! You can deploy safely.');
  }
  
  console.log('='.repeat(50));
};

// Run test
testAllKeys().catch(console.error);
