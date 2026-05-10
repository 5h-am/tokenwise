import 'dotenv/config';

async function testGemini() {
  const apiKey = process.env['GEMINI_API_KEY'];
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.models.map((m: any) => m.name).join('\n'));
}
testGemini();
