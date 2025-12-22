// Test script für Auftragserstellung
const testJobCreation = async () => {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'musteremail@hotmail.com',
        password: 'musteremail@hotmail.com'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Login erfolgreich, Cookies:', cookies);
      
      // Create job
      const jobResponse = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          title: 'Test Auftrag Node',
          description: 'Test Beschreibung vom Node Script',
          location: 'Wien',
          category: 'Reinigung',
          contactInfo: 'test@test.com'
        })
      });
      
      console.log('Job Status:', jobResponse.status);
      const jobResult = await jobResponse.text();
      console.log('Job Result:', jobResult);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }
};

testJobCreation();