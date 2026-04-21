import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DEMO_STORIES = [
  {
    en: {
      childName: "Arjun",
      childAge: 4,
      childGender: "male",
      language: "en",
      parentingChallenge: "My son refuses to share his toys with other children",
      childPersonality: "Playful and imaginative",
      animationStyle: "cartoon",
      musicMood: "playful",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "Once upon a time, Arjun had the most wonderful toys in the kingdom.",
          visualDescription: "A bright, colorful room filled with toys. Arjun stands in the center, smiling.",
          characterAction: "Arjun picks up his favorite toy and hugs it.",
          hiddenLesson: "Introduction to the character and their world.",
        },
        {
          sceneNumber: 2,
          narration: "One day, his friend Priya came to visit and asked to play with his toys.",
          visualDescription: "Priya enters the room with a hopeful smile.",
          characterAction: "Arjun clutches his toys tightly and shakes his head.",
          hiddenLesson: "Recognizing the challenge of sharing.",
        },
        {
          sceneNumber: 3,
          narration: "Arjun felt sad seeing his friend's disappointed face.",
          visualDescription: "Priya's smile fades, and she sits down sadly.",
          characterAction: "Arjun looks at Priya, then at his toys.",
          hiddenLesson: "Understanding empathy and others' feelings.",
        },
        {
          sceneNumber: 4,
          narration: "He remembered how much fun he had when his cousin shared toys with him.",
          visualDescription: "A flashback shows Arjun playing happily with his cousin.",
          characterAction: "Arjun's face brightens as he remembers the good times.",
          hiddenLesson: "Recalling positive experiences with sharing.",
        },
        {
          sceneNumber: 5,
          narration: "Arjun decided to share one toy with Priya to start.",
          visualDescription: "Arjun picks up a toy and extends it toward Priya.",
          characterAction: "Arjun smiles and hands the toy to Priya.",
          hiddenLesson: "Taking the first step toward sharing.",
        },
        {
          sceneNumber: 6,
          narration: "Priya's face lit up with joy, and they started playing together.",
          visualDescription: "Both children play happily with the toy.",
          characterAction: "Arjun and Priya laugh and play together.",
          hiddenLesson: "The joy of playing together.",
        },
        {
          sceneNumber: 7,
          narration: "Soon, Arjun shared more toys, and they had even more fun!",
          visualDescription: "The room is filled with toys, and both children are playing with different ones.",
          characterAction: "Arjun and Priya play with multiple toys, sharing and taking turns.",
          hiddenLesson: "More sharing leads to more fun.",
        },
        {
          sceneNumber: 8,
          narration: "Arjun discovered that sharing made playtime twice as much fun.",
          visualDescription: "Both children are laughing and playing, surrounded by toys.",
          characterAction: "Arjun hugs Priya happily.",
          hiddenLesson: "Sharing creates better experiences.",
        },
        {
          sceneNumber: 9,
          narration: "From that day on, Arjun loved sharing his toys with his friends.",
          visualDescription: "Arjun with multiple friends, all playing together happily.",
          characterAction: "Arjun plays with several friends, handing them toys with a big smile.",
          hiddenLesson: "Sharing becomes a habit and brings more friendships.",
        },
        {
          sceneNumber: 10,
          narration: "And he learned that the best treasures are the memories made with friends.",
          visualDescription: "All children sitting together, smiling and happy.",
          characterAction: "Arjun sits in the center, surrounded by smiling friends.",
          hiddenLesson: "Friendships and memories are more valuable than possessions.",
        },
      ]),
    },
    hi: {
      childName: "अर्जुन",
      childAge: 4,
      childGender: "male",
      language: "hi",
      parentingChallenge: "मेरा बेटा अपने खिलौने दूसरे बच्चों के साथ साझा नहीं करना चाहता",
      childPersonality: "खेलने और कल्पना करने वाला",
      animationStyle: "cartoon",
      musicMood: "playful",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "एक बार की बात है, अर्जुन के पास राज्य के सबसे अद्भुत खिलौने थे।",
          visualDescription: "एक उज्ज्वल, रंगीन कमरा खिलौनों से भरा हुआ। अर्जुन बीच में खड़ा है, मुस्कुरा रहा है।",
          characterAction: "अर्जुन अपने पसंदीदा खिलौने को उठाता है और गले लगाता है।",
          hiddenLesson: "पात्र और उनकी दुनिया का परिचय।",
        },
        {
          sceneNumber: 2,
          narration: "एक दिन, उसकी दोस्त प्रिया उससे मिलने आई और उसके खिलौनों के साथ खेलने के लिए कहा।",
          visualDescription: "प्रिया आशा भरी मुस्कुराहट के साथ कमरे में प्रवेश करती है।",
          characterAction: "अर्जुन अपने खिलौनों को कसकर पकड़ता है और सिर हिलाता है।",
          hiddenLesson: "साझा करने की चुनौती को पहचानना।",
        },
        {
          sceneNumber: 3,
          narration: "अर्जुन को अपनी दोस्त का निराश चेहरा देखकर दुख हुआ।",
          visualDescription: "प्रिया की मुस्कुराहट फीकी पड़ जाती है, और वह दुखी बैठ जाती है।",
          characterAction: "अर्जुन प्रिया को देखता है, फिर अपने खिलौनों को।",
          hiddenLesson: "सहानुभूति और दूसरों की भावनाओं को समझना।",
        },
        {
          sceneNumber: 4,
          narration: "उसे याद आया कि जब उसके चचेरे भाई ने उसके साथ खिलौने साझा किए थे तो कितना मजा आया।",
          visualDescription: "एक फ्लैशबैक दिखाता है कि अर्जुन अपने चचेरे भाई के साथ खुशी से खेल रहा है।",
          characterAction: "अर्जुन का चेहरा अच्छी यादों से चमक उठता है।",
          hiddenLesson: "साझा करने के सकारात्मक अनुभवों को याद करना।",
        },
        {
          sceneNumber: 5,
          narration: "अर्जुन ने शुरुआत के लिए प्रिया के साथ एक खिलौना साझा करने का फैसला किया।",
          visualDescription: "अर्जुन एक खिलौना उठाता है और प्रिया की ओर बढ़ाता है।",
          characterAction: "अर्जुन मुस्कुराता है और खिलौना प्रिया को देता है।",
          hiddenLesson: "साझा करने की ओर पहला कदम उठाना।",
        },
        {
          sceneNumber: 6,
          narration: "प्रिया का चेहरा खुशी से चमक उठा, और वे एक साथ खेलने लगे।",
          visualDescription: "दोनों बच्चे खिलौने के साथ खुशी से खेलते हैं।",
          characterAction: "अर्जुन और प्रिया एक साथ हँसते और खेलते हैं।",
          hiddenLesson: "एक साथ खेलने की खुशी।",
        },
        {
          sceneNumber: 7,
          narration: "जल्द ही, अर्जुन ने और भी खिलौने साझा किए, और उन्हें और भी मजा आया!",
          visualDescription: "कमरा खिलौनों से भरा है, और दोनों बच्चे अलग-अलग खिलौनों के साथ खेल रहे हैं।",
          characterAction: "अर्जुन और प्रिया कई खिलौनों के साथ खेलते हैं, साझा करते हैं और बारी-बारी लेते हैं।",
          hiddenLesson: "अधिक साझा करना अधिक मजा लाता है।",
        },
        {
          sceneNumber: 8,
          narration: "अर्जुन ने खोजा कि साझा करना खेल के समय को दोगुना मजेदार बना देता है।",
          visualDescription: "दोनों बच्चे खुशी से हँस रहे हैं और खिलौनों से घिरे हुए खेल रहे हैं।",
          characterAction: "अर्जुन प्रिया को खुशी से गले लगाता है।",
          hiddenLesson: "साझा करना बेहतर अनुभव बनाता है।",
        },
        {
          sceneNumber: 9,
          narration: "उस दिन के बाद से, अर्जुन को अपने खिलौने अपने दोस्तों के साथ साझा करना पसंद था।",
          visualDescription: "अर्जुन कई दोस्तों के साथ, सभी खुशी से एक साथ खेल रहे हैं।",
          characterAction: "अर्जुन कई दोस्तों के साथ खेलता है, उन्हें बड़ी मुस्कुराहट के साथ खिलौने देता है।",
          hiddenLesson: "साझा करना एक आदत बन जाता है और अधिक दोस्ती लाता है।",
        },
        {
          sceneNumber: 10,
          narration: "और उसने सीखा कि सबसे बड़े खजाने दोस्तों के साथ बनाई गई यादें हैं।",
          visualDescription: "सभी बच्चे एक साथ बैठे हैं, मुस्कुरा रहे हैं और खुश हैं।",
          characterAction: "अर्जुन बीच में बैठा है, मुस्कुराते हुए दोस्तों से घिरा हुआ है।",
          hiddenLesson: "दोस्ती और यादें संपत्ति से अधिक मूल्यवान हैं।",
        },
      ]),
    },
  },
  {
    en: {
      childName: "Isha",
      childAge: 5,
      childGender: "female",
      language: "en",
      parentingChallenge: "My daughter is scared of the dark and refuses to sleep alone",
      childPersonality: "Curious and brave-hearted",
      animationStyle: "storybook",
      musicMood: "calm",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "Isha was a brave little girl, but she was afraid of the dark.",
          visualDescription: "A cozy bedroom with soft lighting. Isha sits on her bed, looking worried.",
          characterAction: "Isha hugs her teddy bear tightly.",
          hiddenLesson: "It's okay to have fears.",
        },
        {
          sceneNumber: 2,
          narration: "Every night, when the lights went out, she felt scared and alone.",
          visualDescription: "The room grows darker as the sun sets.",
          characterAction: "Isha pulls her blanket over her head.",
          hiddenLesson: "Fear is a natural emotion.",
        },
        {
          sceneNumber: 3,
          narration: "One night, Isha's mother told her a special secret about the dark.",
          visualDescription: "Isha's mother sits on the bed, smiling warmly.",
          characterAction: "Isha listens carefully to her mother.",
          hiddenLesson: "Adults can help us feel safe.",
        },
        {
          sceneNumber: 4,
          narration: "She said, 'The dark is just the absence of light, nothing more.'",
          visualDescription: "A gentle illustration showing how darkness is just the opposite of light.",
          characterAction: "Isha nods, understanding.",
          hiddenLesson: "Understanding what we fear helps us overcome it.",
        },
        {
          sceneNumber: 5,
          narration: "Isha learned that the dark held beautiful things - stars, dreams, and rest.",
          visualDescription: "Stars twinkle in the night sky outside the window.",
          characterAction: "Isha looks out the window with wonder.",
          hiddenLesson: "The dark has beautiful aspects.",
        },
        {
          sceneNumber: 6,
          narration: "She discovered that nighttime was when the world got quiet and peaceful.",
          visualDescription: "The neighborhood is calm and quiet at night.",
          characterAction: "Isha takes a deep breath and relaxes.",
          hiddenLesson: "Nighttime brings peace and calm.",
        },
        {
          sceneNumber: 7,
          narration: "With her teddy bear by her side, Isha felt braver each night.",
          visualDescription: "Isha cuddles her teddy bear in the dark.",
          characterAction: "Isha smiles and closes her eyes peacefully.",
          hiddenLesson: "We can find comfort in familiar things.",
        },
        {
          sceneNumber: 8,
          narration: "She realized that she was never truly alone - her family was always nearby.",
          visualDescription: "Her parents' room is just down the hall, with a soft light on.",
          characterAction: "Isha feels safe knowing her parents are close.",
          hiddenLesson: "We are supported by those who love us.",
        },
        {
          sceneNumber: 9,
          narration: "Soon, Isha looked forward to bedtime and the peaceful darkness.",
          visualDescription: "Isha happily gets into bed, ready to sleep.",
          characterAction: "Isha snuggles under her blanket with a smile.",
          hiddenLesson: "Courage grows with practice.",
        },
        {
          sceneNumber: 10,
          narration: "And Isha learned that the dark was not something to fear, but a friend.",
          visualDescription: "Isha sleeps peacefully, with moonlight softly illuminating her room.",
          characterAction: "Isha sleeps soundly with a peaceful expression.",
          hiddenLesson: "Facing our fears makes us stronger.",
        },
      ]),
    },
    hi: {
      childName: "ईशा",
      childAge: 5,
      childGender: "female",
      language: "hi",
      parentingChallenge: "मेरी बेटा अंधेरे से डरती है और अकेले सोना नहीं चाहती",
      childPersonality: "जिज्ञासु और साहसी",
      animationStyle: "storybook",
      musicMood: "calm",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "ईशा एक साहसी छोटी लड़की थी, लेकिन वह अंधेरे से डरती थी।",
          visualDescription: "नरम रोशनी वाला एक आरामदायक बेडरूम। ईशा अपने बिस्तर पर बैठी है, चिंतित दिख रही है।",
          characterAction: "ईशा अपने टेडी बियर को कसकर गले लगाती है।",
          hiddenLesson: "डर होना ठीक है।",
        },
        {
          sceneNumber: 2,
          narration: "हर रात, जब रोशनी बंद हो जाती थी, वह डरी हुई और अकेली महसूस करती थी।",
          visualDescription: "सूरज डूबने के साथ कमरा अंधेरा हो जाता है।",
          characterAction: "ईशा अपने कंबल को अपने सिर पर खींचती है।",
          hiddenLesson: "डर एक प्राकृतिक भावना है।",
        },
        {
          sceneNumber: 3,
          narration: "एक रात, ईशा की माँ ने उसे अंधेरे के बारे में एक विशेष रहस्य बताया।",
          visualDescription: "ईशा की माँ बिस्तर पर बैठी है, गर्मजोशी से मुस्कुरा रही है।",
          characterAction: "ईशा ध्यान से अपनी माँ की बात सुनती है।",
          hiddenLesson: "वयस्क हमें सुरक्षित महसूस करने में मदद कर सकते हैं।",
        },
        {
          sceneNumber: 4,
          narration: "उसने कहा, 'अंधेरा सिर्फ प्रकाश की अनुपस्थिति है, कुछ और नहीं।'",
          visualDescription: "एक कोमल चित्रण दिखाता है कि कैसे अंधेरा प्रकाश के विपरीत है।",
          characterAction: "ईशा समझते हुए सिर हिलाती है।",
          hiddenLesson: "जो हम डरते हैं उसे समझना हमें उसे पार करने में मदद करता है।",
        },
        {
          sceneNumber: 5,
          narration: "ईशा ने सीखा कि अंधेरे में सुंदर चीजें थीं - तारे, सपने, और आराम।",
          visualDescription: "खिड़की के बाहर रात के आसमान में तारे चमकते हैं।",
          characterAction: "ईशा आश्चर्य के साथ खिड़की से बाहर देखती है।",
          hiddenLesson: "अंधेरे के सुंदर पहलू हैं।",
        },
        {
          sceneNumber: 6,
          narration: "उसने खोजा कि रात का समय वह था जब दुनिया शांत और शांतिपूर्ण हो जाती थी।",
          visualDescription: "पड़ोस रात में शांत और शांत है।",
          characterAction: "ईशा गहरी सांस लेती है और आराम करती है।",
          hiddenLesson: "रात शांति और शांति लाती है।",
        },
        {
          sceneNumber: 7,
          narration: "अपने टेडी बियर के साथ, ईशा हर रात अधिक साहसी महसूस करती थी।",
          visualDescription: "ईशा अंधेरे में अपने टेडी बियर को गले लगाती है।",
          characterAction: "ईशा मुस्कुराती है और शांति से अपनी आँखें बंद करती है।",
          hiddenLesson: "हम परिचित चीजों में आराम पा सकते हैं।",
        },
        {
          sceneNumber: 8,
          narration: "उसे एहसास हुआ कि वह कभी सच में अकेली नहीं थी - उसका परिवार हमेशा पास था।",
          visualDescription: "उसके माता-पिता का कमरा बस हॉल के नीचे है, नरम रोशनी के साथ।",
          characterAction: "ईशा सुरक्षित महसूस करती है कि उसके माता-पिता पास हैं।",
          hiddenLesson: "हम उन लोगों द्वारा समर्थित हैं जो हमसे प्यार करते हैं।",
        },
        {
          sceneNumber: 9,
          narration: "जल्द ही, ईशा सोने का समय और शांतिपूर्ण अंधेरे के लिए तत्पर रहती थी।",
          visualDescription: "ईशा खुशी से बिस्तर में जाती है, सोने के लिए तैयार है।",
          characterAction: "ईशा मुस्कुराते हुए अपने कंबल के नीचे सिकुड़ जाती है।",
          hiddenLesson: "साहस अभ्यास के साथ बढ़ता है।",
        },
        {
          sceneNumber: 10,
          narration: "और ईशा ने सीखा कि अंधेरा डर की चीज नहीं, बल्कि एक दोस्त था।",
          visualDescription: "ईशा शांति से सोती है, चांदनी नरमी से उसके कमरे को रोशन करती है।",
          characterAction: "ईशा शांत अभिव्यक्ति के साथ गहरी नींद में सोती है।",
          hiddenLesson: "अपने डर का सामना करना हमें मजबूत बनाता है।",
        },
      ]),
    },
  },
  {
    en: {
      childName: "Rohan",
      childAge: 3,
      childGender: "male",
      language: "en",
      parentingChallenge: "My son hits other children when he gets angry",
      childPersonality: "Energetic and expressive",
      animationStyle: "magical",
      musicMood: "adventurous",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "Rohan was a very energetic boy who loved to play and explore.",
          visualDescription: "A sunny playground with colorful toys and equipment.",
          characterAction: "Rohan runs around excitedly, full of energy.",
          hiddenLesson: "Energy and emotions are natural.",
        },
        {
          sceneNumber: 2,
          narration: "But sometimes, when things didn't go his way, he felt very angry.",
          visualDescription: "Rohan's face turns red as he becomes frustrated.",
          characterAction: "Rohan clenches his fists and stomps his feet.",
          hiddenLesson: "Anger is a valid emotion.",
        },
        {
          sceneNumber: 3,
          narration: "When he got angry, he would hit or push other children.",
          visualDescription: "Rohan pushes another child, who looks sad and hurt.",
          characterAction: "Rohan lashes out without thinking.",
          hiddenLesson: "Hitting hurts others and creates problems.",
        },
        {
          sceneNumber: 4,
          narration: "This made the other children sad and scared of him.",
          visualDescription: "Other children move away from Rohan, looking afraid.",
          characterAction: "Rohan stands alone, realizing what he did.",
          hiddenLesson: "Our actions affect others' feelings.",
        },
        {
          sceneNumber: 5,
          narration: "Rohan's teacher taught him that anger is okay, but hitting is not.",
          visualDescription: "A kind teacher sits with Rohan and explains gently.",
          characterAction: "Rohan listens carefully to his teacher.",
          hiddenLesson: "There are better ways to express anger.",
        },
        {
          sceneNumber: 6,
          narration: "She showed him special ways to calm down when he felt angry.",
          visualDescription: "The teacher demonstrates deep breathing and other calming techniques.",
          characterAction: "Rohan practices taking deep breaths.",
          hiddenLesson: "We can learn to manage our emotions.",
        },
        {
          sceneNumber: 7,
          narration: "Rohan learned to take three deep breaths and count to ten.",
          visualDescription: "Rohan sits quietly, counting on his fingers.",
          characterAction: "Rohan breathes in and out slowly, becoming calm.",
          hiddenLesson: "Simple techniques help us calm down.",
        },
        {
          sceneNumber: 8,
          narration: "He also learned to use his words to say how he felt.",
          visualDescription: "Rohan talks to his teacher about his feelings.",
          characterAction: "Rohan says, 'I'm angry because...' and explains.",
          hiddenLesson: "Words are more powerful than hitting.",
        },
        {
          sceneNumber: 9,
          narration: "Soon, when Rohan felt angry, he would take a break and calm down first.",
          visualDescription: "Rohan sits in a quiet corner, taking deep breaths.",
          characterAction: "Rohan practices his calming techniques.",
          hiddenLesson: "Taking time to calm down helps us make better choices.",
        },
        {
          sceneNumber: 10,
          narration: "And the other children wanted to play with him again because he was kind.",
          visualDescription: "Rohan plays happily with other children, all smiling.",
          characterAction: "Rohan plays gently and shares with his friends.",
          hiddenLesson: "Kindness brings friendships and happiness.",
        },
      ]),
    },
    hi: {
      childName: "रोहन",
      childAge: 3,
      childGender: "male",
      language: "hi",
      parentingChallenge: "मेरा बेटा गुस्से में आकर दूसरे बच्चों को मारता है",
      childPersonality: "ऊर्जावान और अभिव्यक्तिशील",
      animationStyle: "magical",
      musicMood: "adventurous",
      videoLength: "short",
      storyScript: JSON.stringify([
        {
          sceneNumber: 1,
          narration: "रोहन एक बहुत ही ऊर्जावान लड़का था जो खेलना और खोज करना पसंद करता था।",
          visualDescription: "रंगीन खिलौनों और उपकरणों के साथ एक धूप वाला खेल का मैदान।",
          characterAction: "रोहन ऊर्जा से भरा हुआ दौड़ता है।",
          hiddenLesson: "ऊर्जा और भावनाएं प्राकृतिक हैं।",
        },
        {
          sceneNumber: 2,
          narration: "लेकिन कभी-कभी, जब चीजें उसके तरीके से नहीं होती थीं, तो वह बहुत गुस्से में महसूस करता था।",
          visualDescription: "रोहन का चेहरा लाल हो जाता है क्योंकि वह निराश हो जाता है।",
          characterAction: "रोहन अपनी मुट्ठी कसता है और अपने पैर पटकता है।",
          hiddenLesson: "गुस्सा एक वैध भावना है।",
        },
        {
          sceneNumber: 3,
          narration: "जब वह गुस्से में आता था, तो वह दूसरे बच्चों को मारता या धकेलता था।",
          visualDescription: "रोहन दूसरे बच्चे को धकेलता है, जो दुखी और घायल दिख रहा है।",
          characterAction: "रोहन सोचे-समझे बिना बाहर निकल जाता है।",
          hiddenLesson: "मारना दूसरों को चोट पहुंचाता है और समस्याएं पैदा करता है।",
        },
        {
          sceneNumber: 4,
          narration: "इससे दूसरे बच्चे दुखी हो गए और उससे डरने लगे।",
          visualDescription: "दूसरे बच्चे रोहन से दूर चले जाते हैं, डरे हुए दिख रहे हैं।",
          characterAction: "रोहन अकेले खड़ा है, यह महसूस करते हुए कि उसने क्या किया।",
          hiddenLesson: "हमारे कार्य दूसरों की भावनाओं को प्रभावित करते हैं।",
        },
        {
          sceneNumber: 5,
          narration: "रोहन के शिक्षक ने उसे सिखाया कि गुस्सा ठीक है, लेकिन मारना नहीं।",
          visualDescription: "एक दयालु शिक्षक रोहन के साथ बैठता है और कोमलता से समझाता है।",
          characterAction: "रोहन ध्यान से अपने शिक्षक की बात सुनता है।",
          hiddenLesson: "गुस्से को व्यक्त करने के बेहतर तरीके हैं।",
        },
        {
          sceneNumber: 6,
          narration: "उसने उसे विशेष तरीके दिखाए कि जब वह गुस्से में महसूस करे तो कैसे शांत हो।",
          visualDescription: "शिक्षक गहरी सांस लेने और अन्य शांत करने की तकनीकें प्रदर्शित करता है।",
          characterAction: "रोहन गहरी सांस लेने का अभ्यास करता है।",
          hiddenLesson: "हम अपनी भावनाओं को प्रबंधित करना सीख सकते हैं।",
        },
        {
          sceneNumber: 7,
          narration: "रोहन ने तीन गहरी सांस लेना और दस तक गिनना सीखा।",
          visualDescription: "रोहन शांति से बैठा है, अपनी उंगलियों पर गिनती कर रहा है।",
          characterAction: "रोहन धीरे-धीरे सांस लेता है और शांत हो जाता है।",
          hiddenLesson: "सरल तकनीकें हमें शांत करने में मदद करती हैं।",
        },
        {
          sceneNumber: 8,
          narration: "उसने अपनी भावनाओं को कहने के लिए अपने शब्दों का उपयोग करना भी सीखा।",
          visualDescription: "रोहन अपने शिक्षक से अपनी भावनाओं के बारे में बात करता है।",
          characterAction: "रोहन कहता है, 'मैं गुस्से में हूँ क्योंकि...' और समझाता है।",
          hiddenLesson: "शब्द मारने से अधिक शक्तिशाली हैं।",
        },
        {
          sceneNumber: 9,
          narration: "जल्द ही, जब रोहन गुस्से में आता था, तो वह पहले एक ब्रेक लेता और शांत हो जाता था।",
          visualDescription: "रोहन एक शांत कोने में बैठा है, गहरी सांस ले रहा है।",
          characterAction: "रोहन अपनी शांत करने की तकनीकों का अभ्यास करता है।",
          hiddenLesson: "शांत होने के लिए समय लेना हमें बेहतर विकल्प बनाने में मदद करता है।",
        },
        {
          sceneNumber: 10,
          narration: "और दूसरे बच्चे फिर से उसके साथ खेलना चाहते थे क्योंकि वह दयालु था।",
          visualDescription: "रोहन दूसरे बच्चों के साथ खुशी से खेलता है, सभी मुस्कुरा रहे हैं।",
          characterAction: "रोहन कोमलता से खेलता है और अपने दोस्तों के साथ साझा करता है।",
          hiddenLesson: "दया दोस्ती और खुशी लाती है।",
        },
      ]),
    },
  },
];

async function seedDemoStories() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log("🌱 Seeding demo stories...");

    for (const story of DEMO_STORIES) {
      // Insert English version
      const enStory = story.en;
      await connection.execute(
        `INSERT INTO story_orders (
          userId, childName, childAge, childGender, language, 
          parentingChallenge, childPersonality, animationStyle, musicMood, 
          videoLength, storyScript, renderStatus, paymentStatus, pricingTier
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          0, // Demo user ID
          enStory.childName,
          enStory.childAge,
          enStory.childGender,
          enStory.language,
          enStory.parentingChallenge,
          enStory.childPersonality,
          enStory.animationStyle,
          enStory.musicMood,
          enStory.videoLength,
          enStory.storyScript,
          "completed",
          "completed",
          "preview",
        ]
      );

      // Insert Hindi version
      const hiStory = story.hi;
      await connection.execute(
        `INSERT INTO story_orders (
          userId, childName, childAge, childGender, language, 
          parentingChallenge, childPersonality, animationStyle, musicMood, 
          videoLength, storyScript, renderStatus, paymentStatus, pricingTier
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          0, // Demo user ID
          hiStory.childName,
          hiStory.childAge,
          hiStory.childGender,
          hiStory.language,
          hiStory.parentingChallenge,
          hiStory.childPersonality,
          hiStory.animationStyle,
          hiStory.musicMood,
          hiStory.videoLength,
          hiStory.storyScript,
          "completed",
          "completed",
          "preview",
        ]
      );

      console.log(`✅ Seeded: ${enStory.childName} (EN) and ${hiStory.childName} (HI)`);
    }

    console.log("🎉 Demo stories seeded successfully!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding demo stories:", error);
    process.exit(1);
  }
}

seedDemoStories();
