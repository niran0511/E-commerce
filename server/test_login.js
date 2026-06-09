async function test() {
  try {
    const res = await fetch('https://e-commerce-16rv.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shopsmartai.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
