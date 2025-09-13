const BASE_URL = 'http://localhost:3000'

async function quickTest() {
  try {
    console.log('Quick test...')
    
    const response = await fetch(`${BASE_URL}/api/portfolio/test-user-id`)
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success:', data)
    } else {
      const error = await response.text()
      console.log('Error:', error)
    }
  } catch (error) {
    console.log('Exception:', error.message)
  }
}

quickTest()
