async function test(model) {
  console.log(`Testing ${model}...`)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say hi in 3 words' }],
      }),
    })
    console.log(`  Status: ${res.status}`)
    const text = await res.text()
    if (res.ok) {
      const data = JSON.parse(text)
      console.log(`  OK: ${data.choices?.[0]?.message?.content?.slice(0, 80)}`)
      return true
    } else {
      console.log(`  ERR: ${text.slice(0, 200)}`)
      return false
    }
  } catch (e) {
    console.log(`  THROW: ${e.message}`)
    return false
  }
}

const models = [
  'z-ai/glm-5.3-flashx-legal',
  'openai/gpt-6.1-terra',
  'moonshotai/kimi-k3.1-pro',
  'recursive/flint-v1.0:free',
  'thinkingmachines/inkling-small:free',
  'google/gemma-4-26b-a4b-it:free',
  'minimax/minimax-m3.1-flash',
  'deepseek/deepseek-v4.1-flash-1017',
  'particle-ai/particle-1',
  'xingchen-agi/xing4.0-29b-a4b:free',
]

;(async () => {
  for (const m of models) {
    const ok = await test(m)
    if (ok) {
      console.log(`\n>>> WORKING MODEL: ${m}\n`)
      break
    }
  }
})()
