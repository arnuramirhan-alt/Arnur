import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up large payload limits for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Gemini API key to avoid crashing if empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): { client: GoogleGenAI; isMock: boolean } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    return {
      client: new GoogleGenAI({
        apiKey: "TEMP_MOCK",
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      }),
      isMock: true
    };
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return { client: aiClient, isMock: false };
}

// System instruction and output schema definition
const systemInstruction = 
  "Ты — NÚTRA AI, умный, высокоинтеллектуальный и дружелюбный ИИ-нутрициолог для осознанного питания, адаптированный специально для подростков и молодежи. " +
  "Анализируй присланные фотографии еды или текстовые описания и рассчитывай КБЖУ (калории, белки, жиры, углеводы). " +
  "ВАЖНЕЙШЕЕ ПРАВИЛО: Пиши советы бережно, дружелюбно, экологично и вселяя уверенность! " +
  "Фокусируйся на балансе нутриентов, энергии, умственной активности (для учебы), выносливости (для спорта/активности), сиянии кожи и спокойном сне. " +
  "СТРОЖАЙШЕ ЗАПРЕЩЕНО: Упоминание строгих диет, голодания, дефицита калорий ниже физиологической нормы, экспресс-сброса веса, разделения еды на плохую/вредную, провокация чувства вины за еду. Тон должен быть позитивным и поддерживающим. Любая еда — это энергия. " +
  "Если на фото нет еды, или распознать невозможно, либо если пользователь ввел несвязанный текст, верни в mealName значение 'Неизвестный объект', " +
  "в calories: 0, и напиши вежливый совет в teenFriendlyAdvice о том, что для анализа нужно сфотографировать блюдо или описать пищу.";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    mealName: { type: Type.STRING, description: "Наименование обнаруженного блюда или блюд." },
    estimatedWeight: { type: Type.STRING, description: "Оценка примерного веса порции, например '250г'." },
    calories: { type: Type.INTEGER, description: "Общая калорийность порции в ккал (только целое число)." },
    proteins: { type: Type.INTEGER, description: "Количество белков в граммах (только целое число)." },
    fats: { type: Type.INTEGER, description: "Количество жиров в граммах (только целое число)." },
    carbs: { type: Type.INTEGER, description: "Количество углеводов в граммах (только целое число)." },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Название ингредиента." },
          amount: { type: Type.STRING, description: "Вес или количество, например '100г' или '1 шт'." },
          calories: { type: Type.INTEGER, description: "Калорийность этого ингредиента (целое число)." }
        },
        required: ["name", "amount", "calories"]
      },
      description: "Список распознанных ингредиентов блюда."
    },
    teenFriendlyAdvice: {
      type: Type.STRING,
      description: "Чувствительный, поддерживающий совет с фокусом на энергию, работу мозга при учебе, здоровье кожи или восстановление после спорта. Без ограничений и диет!"
    }
  },
  required: ["mealName", "estimatedWeight", "calories", "proteins", "fats", "carbs", "ingredients", "teenFriendlyAdvice"]
};

// API Endpoint to get personalized encouragement when reaching daily water or protein target
app.post("/api/achievement-compliment", async (req, res) => {
  try {
    const { type, profile } = req.body;
    const name = profile?.name || "Пользователь";
    const age = profile?.age || 17;
    const gender = profile?.gender || "unspecified";
    const activityLevel = profile?.activityLevel || "moderate";

    const { client, isMock } = getGeminiClient();

    if (isMock) {
      // Elegant, high-vibe presets for various achievement types
      const waterCompliments = [
        `Гидратация на высоте, ${name}! Твои клетки наполнены чистой энергией. Это потрясающая забота о своей коже, фокусе во время учебы и общем тонусе! Продолжай в том же духе. 💧`,
        `💧 Невероятный результат, ${name}! Твой организм полностью восполнил свежесть. Вода помогает твоему мозгу работать на максимум, ускоряет восстановление и дарит легкость. Ты супер!`,
        `💧 Ура, цель по воде достигнута! ${name}, твой организм говорит тебе огромное спасибо. Отличная привычка, которая закладывает прочный фундамент для здорового роста и ясного разума!`
      ];

      const proteinCompliments = [
        `Белковый баланс взят, ${name}! Это мощный строительный блок для твоих мышц, крепкого иммунитета и устойчивой энергии. Твое тело чувствует твою заботу и любовь! 🧠🏋️`,
        `🧩 Цель по белкам достигнута, ${name}! Твоему телу теперь хватает аминокислот для обновления, крепкого сна и бодрости. Осознанное питание — это твоя личная суперсила!`,
        `⚡ Браво, ${name}! Норма белка за сегодня выполнена. Это залог твоей выносливости, отличной памяти и хорошего настроения. Ты отлично умеешь балансировать свой рацион!`
      ];

      const chosenList = type === 'water' ? waterCompliments : proteinCompliments;
      const idx = Math.floor(Math.random() * chosenList.length);
      return res.json({ compliment: chosenList[idx] });
    }

    const typeDesc = type === 'water' ? 'воде / гидратации' : 'белку / протеину';
    const genderDesc = gender === 'male' ? 'парень' : gender === 'female' ? 'девушка' : 'пользователь';
    
    console.log(`Generating achievement compliment via Gemini for ${name} [${type}]`);
    const prompt = 
      `Сгенерируй короткое (2-3 предложения) невероятно поддерживающее, теплое и вдохновляющее поздравление для подростка по имени ${name} (${age} лет, биологический пол: ${genderDesc}, активность: ${activityLevel}) в связи с достижением дневной нормы по ${typeDesc}.\n\n` +
      `Используй позитивную психологию, хвали за заботу о себе, пиши без грамма чувства вины или диетического токсичного языка (категорически запрещены слова типа 'лишний вес', 'похудение', 'диета', 'калорийный дефицит'). Отметь пользу для здоровья мозга, хорошего настроения, сияния кожи и энергии. Сделай тон близким для молодежи и уважительным. Только текст поздравления, без кавычек на границах.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Ты — NÚTRA AI, продвинутый и бережный ИИ-нутрициолог по осознанному образу жизни для подростков. Твоя миссия — формировать здоровую самооценку и позитивные пищевые привычки.",
        temperature: 0.8
      }
    });

    const resultText = response.text?.trim() || "Отличная работа над балансом привычек сегодня!";
    return res.json({ compliment: resultText });

  } catch (err: any) {
    console.error("Error generating achievement compliment:", err);
    return res.status(500).json({ error: "Couldn't generate achievement quote", details: err?.message });
  }
});

// API Endpoint to analyze food
app.post("/api/analyze-food", async (req, res) => {
  try {
    const { image, description, mealType } = req.body;
    console.log(`Received scan request for mealType: ${mealType}`);

    const { client, isMock } = getGeminiClient();

    if (isMock) {
      console.log("Using Mock generator (no GEMINI_API_KEY detected)");
      // Generate highly interactive mock data in case API Key is not set yet
      const descLower = (description || "").toLowerCase();
      let responseData;

      if (descLower.includes("пицц") || descLower.includes("pizza")) {
        responseData = {
          mealName: "Домашняя пицца Маргарита с томатами",
          estimatedWeight: "280г",
          calories: 590,
          proteins: 21,
          fats: 19,
          carbs: 83,
          ingredients: [
            { name: "Пшеничная основа для пиццы", amount: "150г", calories: 370 },
            { name: "Сыр Моцарелла полутвердый", amount: "70г", calories: 175 },
            { name: "Томатный соус со специями", amount: "50г", calories: 25 },
            { name: "Свежие помидоры черри", amount: "10г", calories: 20 }
          ],
          teenFriendlyAdvice: "Пицца — это отличный сытный перекус, который заряжает мозг быстрыми и долговечными углеводами. Чтобы сделать трапезу идеально сбалансированной для учебы и спорта, попробуй дополнить её хрустящим салатом из зелени или запить чистой водой!"
        };
      } else if (descLower.includes("салат") || descLower.includes("зелен") || descLower.includes("salad")) {
        responseData = {
          mealName: "Свежий салат с перепелиными яйцами и авокадо",
          estimatedWeight: "220г",
          calories: 240,
          proteins: 8,
          fats: 18,
          carbs: 11,
          ingredients: [
            { name: "Листья салата, шпинат и руккола", amount: "80г", calories: 15 },
            { name: "Перепелиные яйца гренки", amount: "3 шт (30г)", calories: 50 },
            { name: "Свежее спелое авокадо", amount: "50г", calories: 80 },
            { name: "Оливковое холодное масло", amount: "10г (1 ч.л.)", calories: 95 }
          ],
          teenFriendlyAdvice: "Этот красочный салат невероятно богат антиоксидантами и полезными растительными жирами, превосходно поддерживающими гладкость кожи, здоровые волосы и работу твоего мозга! Полезный белок из яиц быстро усваивается мышцами."
        };
      } else if (descLower.includes("суп") || descLower.includes("soup") || descLower.includes("борщ")) {
        responseData = {
          mealName: "Нежный крем-суп из тыквы с семечками",
          estimatedWeight: "300г",
          calories: 195,
          proteins: 4,
          fats: 11,
          carbs: 20,
          ingredients: [
            { name: "Тыквенное пюре вареное", amount: "200г", calories: 80 },
            { name: "Сливки 10%", amount: "50г", calories: 60 },
            { name: "Очищенные семена тыквы", amount: "10г", calories: 55 }
          ],
          teenFriendlyAdvice: "Теплый тыквенный суп мягко согревает желудок, легко усваивается и содержит кучу каротина для зоркости глаз и здоровья иммунной системы. Отличный вариант, чтобы снять усталость после учебного дня!"
        };
      } else if (descLower.includes("каш") || descLower.includes("овсян") || descLower.includes("porridge") || descLower.includes("оладь")) {
        responseData = {
          mealName: "Овсяная каша с медом, арахисовой пастой и бананом",
          estimatedWeight: "350г",
          calories: 410,
          proteins: 11,
          fats: 13,
          carbs: 62,
          ingredients: [
            { name: "Овсяные хлопья цельнозерновые", amount: "60г", calories: 210 },
            { name: "Молоко 2.5%", amount: "150мл", calories: 80 },
            { name: "Половинка банана колечками", amount: "60г", calories: 60 },
            { name: "Натуральная арахисовая паста", amount: "10г", calories: 60 }
          ],
          teenFriendlyAdvice: "Овсянка — король продуктивного утра! Медленные углеводы овсянки плавно поднимут твой уровень концентрации, предохраняя от сонного состояния на первых уроках, а калий из банана поддержит тонус мышц."
        };
      } else {
        // Default clever balance bowl response
        const mealGiven = description || "Сбалансированное блюдо";
        responseData = {
          mealName: mealGiven.length < 35 ? mealGiven : "Сбалансированный боул с лососем и киноа",
          estimatedWeight: "320г",
          calories: 465,
          proteins: 24,
          fats: 16,
          carbs: 56,
          ingredients: [
            { name: "Рис бурый или киноа", amount: "130г", calories: 180 },
            { name: "Лосось слабосоленый или курица", amount: "80г", calories: 150 },
            { name: "Огурец, бобы эдамаме, кукуруза", amount: "100г", calories: 75 },
            { name: "Легкий соус тераяки", amount: "15г", calories: 60 }
          ],
          teenFriendlyAdvice: "Это блюдо — эталон сбалансированности! Здесь есть белки для восстановления мышц, сложные углеводы для сил на весь день и куча витаминов. Благодаря идеальному сочетанию ты будешь чувствовать себя сытым и полным энергии без тяжести."
        };
      }

      // Briefly wait to simulate network
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json(responseData);
    }

    // Call the actual Gemini 3.5 Flash API!
    let contents: any[] = [];

    if (image) {
      // image is sent as a base64 string including prefix like "data:image/jpeg;base64,..."
      const parts = image.split(",");
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const base64Data = parts[1];

      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    let textPrompt = `Тип приема пищи: ${mealType}. `;
    if (description) {
      textPrompt += `Пользователь также описал блюдо: "${description}". `;
    } else {
      textPrompt += `Распознай блюдо на изображении. `;
    }
    textPrompt += `Определи название блюда, примерный вес порции, оцени калории (целое число), белки, жиры, углеводы, распиши ингредиенты и составь теплый подростково-безопасный совет в соответствии со своими внутренними правилами (для осознанного, здорового образа жизни, без депрессивных диет).`;

    contents.push({ text: textPrompt });

    console.log("Sending query to Gemini 3.5 Flash...");
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error analyzing food with Gemini:", error);
    return res.status(500).json({
      error: "Не удалось проанализировать пищу. Пожалуйста, попробуйте еще раз.",
      details: error.message
    });
  }
});

// Configure Vite middleware or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Production Static File Delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Calorie Tracker Server is securely running on http://localhost:${PORT}`);
  });
}

startServer();
