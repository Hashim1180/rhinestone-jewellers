async function test() {
  console.log('Testing from same Node environment as Next.js...')
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m3.1-flash',
      messages: [{ role: 'user', content: 'Say hi' }],
      max_tokens: 100,
    }),
  })
  console.log('Status:', res.status)
  const text = await res.text()
  console.log('Response:', text.slice(0, 500))
}
test().catch(e => console.error('Error:', e.message))
