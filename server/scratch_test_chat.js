async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/support/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'hello buddy',
        history: [{role: 'model', text: 'Hi! I am the RentMate Support AI. How can I help you list your property today?'} ]
      })
    });

    if (res.ok) {
      console.log('Success!', await res.json());
    } else {
      console.log('Failed!', res.status, res.statusText, await res.text());
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
