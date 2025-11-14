export class LLMService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async generateResponse(prompt: string): Promise<{ text: string; tokens: number; timeMs: number }> {
    const startTime = Date.now();

    if (!this.apiKey) {
      return {
        text: this.generateMockResponse(prompt),
        tokens: 500,
        timeMs: Date.now() - startTime
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || this.generateMockResponse(prompt);
      const tokens: number = data?.usage?.totalTokenCount || 0;

      return {
        text,
        tokens,
        timeMs: Date.now() - startTime
      };
    } catch (error) {
      console.error('LLM API Error:', error);
      return {
        text: this.generateMockResponse(prompt),
        tokens: 500,
        timeMs: Date.now() - startTime
      };
    }
  }

  private generateMockResponse(prompt: string): string {
    if (prompt.toLowerCase().includes('photosynthesis')) {
      return `Arre! Photosynthesis toh ekdum simple hai! 🌱

Socho tumhare ghar ke tulsi plant ko - wo poora din dhoop mein khada rehta hai na? Wo actually apna khana bana raha hota hai sunlight se! 🌞

**Process kya hai:**
1. Plant ke leaves mein chlorophyll hai (green colour)
2. Ye sunlight ko absorb karta hai
3. Plus paani (from roots) + CO2 (from air)
4. = Glucose ban jata hai (plant ka food!) + O2 ✨

**Fun Fact:** Tum jo oxygen le rahe ho, wo isi process ki wajah se milti hai! Plants literally hamari life support system hain! 💚

🎯 **Quick Activity:** Apni balcony/window pe ek plant rakho for 2 days - ek dhoop mein, ek andar dark mein. Guess what? Dhoop wala zyada green aur healthy rahega!

Ab batao - agar plant ko sunlight nahi mile toh kya hoga? Try karo explain karna! 🤔`;
    }

    if (prompt.toLowerCase().includes('sky') && prompt.toLowerCase().includes('blue')) {
      return `Arre wah! Super interesting question! 🌤️

**Sky blue kyun hai?** Let me explain with a cool example!

Socho jab tum cricket ball ko wall pe maro - ball bounce back hoti hai na? Same way, sunlight bhi atmosphere mein bounce karti hai!

**Science behind it:**
- Sunlight mein rainbow ke saare colors hain 🌈
- Blue light ki wavelength choti hoti hai
- Choti wavelength = zyada bouncing/scattering!
- Isliye blue color sabse zyada scatter hota hai atmosphere mein
- That's why sky blue dikhti hai! ✨

**Mind-Blowing Fact:** Mars pe sky RED dikhti hai! Kyunki wahan atmosphere alag hai. Kya tum imagine kar sakte ho red sky? 🔴

**Challenge for you:** Evening ko sunset dekho - sky orange/red kyun ho jati hai? Hint hai: Sunlight zyada distance travel karti hai! 🤔

Samjh aaya? Koi aur doubt ho toh pooch lo! 🙌`;
    }

    return `Great question! Let me explain this in a simple and fun way! 🎯

This is a fascinating topic that connects to your daily life. Let me break it down step-by-step so it's super clear.

**The Main Idea:**
[Simplified explanation of the concept]

**Real-Life Example:**
Think of it like [relatable Indian context - chai, cricket, school, etc.]

**Why This Matters:**
This concept is important because it helps you understand [practical application]

**Fun Challenge:** Try to explain this to a friend or family member! Teaching is the best way to learn. 💪

Got it? Want me to explain any part in more detail? I'm here to help! 🌟`;
  }
}

export const llmService = new LLMService();
