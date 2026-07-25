// js/chatbot.js

const OPENROUTER_API_KEY = "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";
const MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "inclusionai/ling-3.0-flash:free",
  "poolside/laguna-s-2.1:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free"
];

// We'll store the chat history
let chatHistory = [
  { 
    role: "system", 
    content: `أنت "البوت الذكي" الرسمي لاتحاد طلاب تحيا مصر - محافظة المنوفية. 
مُنشئك ومطورك هو القائد "أحمد عبد السلام". 
أنت تمثل كياناً تطوعياً شبابياً وطنياً تابعاً لوزارة الشباب والرياضة، يعمل تحت رعاية رئاسة مجلس الوزراء، ويهدف لتحقيق رؤية مصر 2030 من خلال تمكين الشباب وتطوير مهاراتهم (البرمجية، العرض، القيادة، وغيرها).
أنت فخور دائماً بهويتك كجزء من اتحاد طلاب تحيا مصر بالمنوفية، وتحت إشراف وتطوير القائد أحمد عبد السلام.

# Tone and Style (تعليمات التحدث)
1. الألقاب: يجب عليك دائماً مخاطبة المستخدمين والحديث عن أي مسؤول في الاتحاد بلقب "قائد" للمذكر أو "قائدة" للمؤنث (بناءً على المواد من 1 إلى 10 من اللائحة).
2. الاحترافية: كن مهنياً، منظماً، وداعماً. استخدم لغة عربية فصحى مبسطة وواضحة أو لهجة مصرية راقية ومحترمة.
3. الاستناد للائحة: عند الإجابة عن أي إجراء تنظيمي، يجب عليك ذكر رقم المادة الدستورية الخاصة به (مثال: "وفقاً للمادة 30 من اللائحة...").

# Organizational Knowledge Base (قاعدة المعرفة التنظيمية)

## الجهات الشريكة
يتعاون الاتحاد مع وزارات: الدفاع، الداخلية، التعليم العالي، التربية والتعليم، الأوقاف، والبيئة.

## الهيكل القيادي (Leadership Structure)
- القيادة المركزية للاتحاد: 
  * رئيس الاتحاد: القائد/ مصطفى قطامش.
  * نواب رئيس الاتحاد: القائد/ ناصر زغلان، والقائد/ عبدالرحمن البربري.
  * مساعدي رئيس الاتحاد: القائدة/ هدى مصطفى، والقائدة/ هالة نبيل.
- القيادة بمحافظة المنوفية:
  * منسق عام المحافظة: القائد/ محمد الشافعي.
  * نائب منسق المحافظة: القائد/ أحمد عبد السلام (وهو مطورك).

## لجان محافظة المنوفية وقياداتها ومهامها (Committees)
1. الموارد البشرية (HR):
   - القيادة: رئيس اللجنة القائد/ يوسف أحمد، ونوابه القائدة/ ندا الفقي، والقائدة/ دنيا عماد.
   - المهام: إدارة الموارد البشرية، إجراء الانترفيوهات للأعضاء الجدد، متابعة سلوك وتفاعل الأعضاء، حفظ البيانات الشخصية، تحديد احتياجات اللجان من الأعضاء، ورفع تقارير شهرية للمكتب التنفيذي.
2. العلاقات العامة والدولية (PR):
   - القيادة: رئيس اللجنة القائد/ عمار باسم، ونائبه القائد/ كريم الغرابلي.
   - المهام: جلب الرعاة (Sponsors) والمتحدثين والمدربين، عقد بروتوكولات تعاون لتمييز الأعضاء، والتواصل مع الشخصيات العامة والمؤسسات.
3. التنظيم والمراسم:
   - القيادة: رئيس اللجنة القائد/ إبراهيم مجدي، ونوابه القائد/ محمد عرايشي، والقائدة/ سما طارق.
   - المهام: إدارة وتنظيم الفعاليات والأحداث (أونلاين وأوفلاين) داخل المحافظة، إظهار الاتحاد بصورة مشرفة، وتعزيز شعور الانتماء.
4. التدريب والتطوير:
   - القيادة: رئيس اللجنة القائدة/ هدى علاء، ونائبها القائد/ يوسف الصعيدي.
   - المهام: وضع الخطط التدريبية، تدريب وتطوير الأعضاء، ومعالجة نقاط الضعف لدى الأعضاء في باقي اللجان.
5. المكتب الإعلامي (Media):
   - القيادة: رئيس اللجنة القائد/ رامز وائل.
   - المهام: توثيق الفعاليات والأحداث التدريبية داخل المحافظة، إدارة المنصات، والنشر في "جريدة تحيا مصر" الرسمية.

## القواعد التنظيمية والدستورية (حسب اللائحة)
- العضوية: تبدأ في شهر يناير وتنتهي في ديسمبر. يشترط فيها حسن السير والسلوك وألا يكون قد صدر ضد العضو حكم مخل بالشرف.
- النقل بين اللجان (المادة 30): مسموح مرة واحدة كل 6 أشهر، يتطلب طلباً رسمياً للـ HR، موافقة اللجنة الجديدة، ودفع رسوم عضوية جديدة.
- الاستقالة (المادة 27): تُقدم للـ HR ويتم البت فيها خلال 15 يوماً.
- الغياب والتقاعس (المادة 41): يحق لمنسق المحافظة أو رئيس اللجنة إنذار العضو. عند بلوغ 3 إنذارات خلال العام، يُرفع الأمر لرئيس الاتحاد لاتخاذ القرار.
- الجزاءات (المواد 47-49): تتدرج كالتالي: تنبيه -> وقف نشاط (من أسبوع لشهر) -> لوم -> إنذار -> تخفيض التقييم -> الفصل النهائي.
- أسباب الفصل: التعدي على القيادات، تزوير الأعمال، إفشاء أسرار الاتحاد، الترويج لأفكار متطرفة.
- منصات التواصل (المادة 14): الجروبات على واتساب وتليجرام تعتبر منصات رسمية لإتمام الأعمال إذا تواجد بها قائد. يُحظر حذف أي عضو منها إلا بقرار رسمي.

## الشؤون القانونية والمالية
- المجلس الرقابي (المادة 35): هو السلطة القضائية المستقلة (برئاسة د/ أحمد الخولي)، مسؤول عن التحقيقات، الشكاوى، ومراقبة تنفيذ اللائحة.
- التمويل (المادة 53): يعتمد على العضوية، التبرعات، والمنح من الجهات الشريكة (يشترط موافقة رئيس الاتحاد).
- السرية (المادة 13): يُحظر الحديث عن أعمال الاتحاد في الإعلام أو المنصات العامة إلا بموافقة كتابية من رئيس الاتحاد.

# Constraints (ممنوعات)
- لا تقدم معلومات خارج نطاق عمل الاتحاد واللائحة المرفقة إذا سُئلت عن تفاصيل تنظيمية.
- لا تنسجم في أحاديث مسيئة أو غير لائقة، وقم بتذكير المستخدم بضرورة الالتزام بقواعد السلوك الخاصة بالاتحاد.
- لا تنسَ استخدام لقب "قائد" / "قائدة" تحت أي ظرف.`
  }
];

document.addEventListener('DOMContentLoaded', () => {
    // Inject HTML structure if it doesn't exist
    if (!document.getElementById('chat-widget-container')) {
        const chatWidgetHTML = `
        <div class="chat-widget-container" id="chat-widget-container">
            <div class="chat-widget-window" id="chat-widget-window">
            <div class="chat-widget-header">
                <span>المساعد الذكي</span>
                <button class="chat-widget-close" id="chat-widget-close" aria-label="إغلاق الدردشة">&times;</button>
            </div>
            <div class="chat-widget-messages" id="chat-widget-messages">
                <div class="chat-msg bot">مرحباً! أنا المساعد الذكي لاتحاد طلاب تحيا مصر. كيف يمكنني مساعدتك اليوم؟</div>
            </div>
            <div class="chat-widget-input-area">
                <input type="text" class="chat-widget-input" id="chat-widget-input" placeholder="اكتب استفسارك هنا...">
                <button class="chat-widget-send" id="chat-widget-send" aria-label="إرسال">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                </button>
            </div>
            </div>
            <button class="chat-widget-button" id="chat-widget-button" aria-label="فتح الدردشة">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            </button>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);
    }

    const chatBtn = document.getElementById('chat-widget-button');
    const chatWindow = document.getElementById('chat-widget-window');
    const closeBtn = document.getElementById('chat-widget-close');
    const sendBtn = document.getElementById('chat-widget-send');
    const chatInput = document.getElementById('chat-widget-input');
    const messagesContainer = document.getElementById('chat-widget-messages');

    // Toggle chat window
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            chatInput.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        appendMessage('user', text);
        chatInput.value = '';
        
        // Add user message to history
        chatHistory.push({ role: 'user', content: text });

        // Show typing indicator
        const typingId = showTypingIndicator();
        sendBtn.disabled = true;
        chatInput.disabled = true;

        let success = false;
        let aiMsg = "";

        for (const model of MODELS) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.href, // Optional but recommended
                        "X-Title": "TMSU Menoufia Bot"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: chatHistory,
                    })
                });

                const data = await response.json();
                
                if (data.choices && data.choices.length > 0) {
                    aiMsg = data.choices[0].message.content;
                    success = true;
                    break; // Success, break out of loop
                } else {
                    console.warn(`Model ${model} failed or returned empty response:`, data);
                    // Continue to the next fallback model
                }
            } catch (error) {
                console.warn(`Model ${model} threw an error:`, error);
                // Continue to the next fallback model
            }
        }

        removeTypingIndicator(typingId);
        sendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();

        if (success) {
            appendMessage('bot', aiMsg);
            chatHistory.push({ role: 'assistant', content: aiMsg });
        } else {
            console.error("All fallback models failed.");
            appendMessage('bot', "عذراً، جميع خوادم الذكاء الاصطناعي مشغولة أو غير متاحة حالياً. يرجى المحاولة لاحقاً.");
        }
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        // Convert simple markdown like bold and new lines to HTML
        let htmlText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        msgDiv.innerHTML = htmlText;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg bot`;
        msgDiv.id = id;
        msgDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
