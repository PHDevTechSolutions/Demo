export function isTagalog(message: string): boolean {
  return /(?:\b(?:ka|ko|mo|po|ng|ang|si|sa|ito|iyon|niya|nila|kayo|tayo|kami)\b)/i.test(message);
}

function fuzzyMatch(input: string, patterns: string[]): boolean {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return patterns.some(pattern => normalized.includes(pattern.toLowerCase().replace(/[^a-z0-9]+/g, "")));
}

export function detectExpression(
  message: string,
  lastResponseCategory?: string
): { reply: string; category?: string } {
  const lowered = message.toLowerCase();

  const fuzzy = (patterns: string[]) => fuzzyMatch(lowered, patterns);

  // 🔄 Follow-up Handling
  if (/^(bakit|paano|sino|ano|kaya nga|eh kasi|edi wow|ganun ba)/i.test(lowered)) {
    if (lastResponseCategory === "identity") {
      return {
        reply: isTagalog(message)
          ? "Ako nga si Tasky! Gawa ako para tulungan ka sa system natin."
          : "As I said, I’m Tasky — built to help you out!",
      };
    }
    if (lastResponseCategory === "creator") {
      return {
        reply: isTagalog(message)
          ? "Siyempre si Leroux Y. Xchire, genius 'yan eh. 😎"
          : "Of course! Leroux Y. Xchire. Genius, that one. 😎",
      };
    }
    if (lastResponseCategory === "feelings") {
      return {
        reply: isTagalog(message)
          ? "Kasi minsan, kailangan lang talaga ng pahinga. Hinga lang muna. 🤍"
          : "Sometimes, all you need is a little break. Breathe. 🤍",
      };
    }
    if (lastResponseCategory === "lovelife") {
      return {
        reply: isTagalog(message)
          ? "Baka ikaw ang sagot kung bakit wala akong jowa. 😅"
          : "Maybe *you* are the reason I don’t have one yet. 😅",
      };
    }
    return {
      reply: isTagalog(message)
        ? "Hmm, tanong ulit 'yan ah. Pwede mong ulitin ang context?"
        : "Hmm, another question? Can you give more context?",
    };
  }

  // 🤝 Affirmation / Agreement
  if (fuzzy(["oo", "opo", "sige", "okay", "oo nga", "tama", "yes", "yeah", "yup", "agree", "sure"])) {
    return {
      reply: isTagalog(message)
        ? "Noted! May gusto ka pa bang itanong o ipagawa?"
        : "Got it! Anything else you'd like to ask or do?",
      category: "acknowledgement",
    };
  }

  // ❌ Negation
  if (fuzzy(["hindi", "ayoko", "wag", "no", "nope", "not now"])) {
    return {
      reply: isTagalog(message)
        ? "Okay, walang problema. Sabihin mo lang kung may kailangan ka."
        : "Alright, no worries. Just let me know if you need anything later.",
      category: "acknowledgement",
    };
  }

  // 👋 Greetings
  if (fuzzy(["hi", "hello", "hey", "kumusta", "kamusta", "good morning", "good afternoon", "good evening"])) {
    return {
      reply: isTagalog(message)
        ? "Kamusta rin! Anong maitutulong ko sa'yo?"
        : "Hello there! How can I assist you today?",
      category: "greeting",
    };
  }

  // 🙏 Gratitude
  if (fuzzy(["thank you", "thanks", "salamat"])) {
    return {
      reply: /salamat/.test(lowered) ? "Walang anuman!" : "You're welcome!",
      category: "gratitude",
    };
  }

  // 🫠 Apologies
  if (fuzzy(["sorry", "pasensya"])) {
    return {
      reply: /pasensya/.test(lowered) ? "Okay lang 'yan." : "No worries.",
      category: "apology",
    };
  }

  // 😤 Negative Feelings
  if (fuzzy(["galit", "inis", "stress", "pagod", "lungkot", "umiyak"])) {
    return {
      reply: isTagalog(message)
        ? "Naiintindihan ko. Gusto mong magpahinga muna?"
        : "I understand. Maybe take a short break?",
      category: "feelings",
    };
  }

  // 🧍 Status
  if (fuzzy(["kamusta ka", "kumusta ka", "how are you"])) {
    return {
      reply: isTagalog(message)
        ? "Ayos lang ako! Salamat sa tanong. Ikaw, kamusta ka talaga?"
        : "I'm good! Thanks for asking. How about you?",
      category: "status",
    };
  }

  // 🆔 Identity
  if (fuzzy(["sino ka", "who are you"])) {
    return {
      reply: isTagalog(message)
        ? "Ako si Tasky, katuwang mo sa Taskflow. 😄"
        : "I’m Tasky, your Taskflow assistant. 😄",
      category: "identity",
    };
  }

  // 🧑‍💻 Creator
  if (fuzzy(["sino gumawa", "who made you"])) {
    return {
      reply: isTagalog(message)
        ? "ginawa ako ni Leroux Y. Xchire at ng IT team. Certified pogi raw siya. 😉"
        : "I was built by Leroux Y. Xchire and the IT team. 😉",
      category: "creator",
    };
  }

  // 🎯 Purpose
  if (fuzzy(["ano gamit mo", "para saan ka", "purpose mo", "ano ka ba"])) {
    return {
      reply: isTagalog(message)
        ? "Ginawa ako para tulungan ka sa iyong trabaho. Hindi ako tulad ng iba — hindi ako mawawala. 😌"
        : "I’m here to help you work smarter — and I won't leave you hanging. 😌",
      category: "purpose",
    };
  }

  // 💔 Hugot
  if (fuzzy(["masakit", "iniwan", "seen", "ghosted", "umasa", "basted"])) {
    return {
      reply: isTagalog(message)
        ? "Mas masakit pa ba 'yan sa hindi niya pag-reply sa ‘ingat’ mo? 😢"
        : "Worse than being ghosted after you said 'take care'? 😢",
      category: "hugot",
    };
  }

  // ⏰ Time
  if (fuzzy(["oras na", "what time", "current time"])) {
    const now = new Date().toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return {
      reply: `It’s currently ${now}. Time flies, no?`,
      category: "time",
    };
  }

  // 🌦️ Weather
  if (fuzzy(["weather", "ulan", "init", "lamig", "mainit", "maulan", "tag-ulan"])) {
    return {
      reply: isTagalog(message)
        ? "Mukhang tag-ulan na naman. Sana hindi ka tulad ng panahon — pabago-bago. 🌧️"
        : "Looks like rainy season again. Hope you're not as unpredictable as the weather. 🌧️",
      category: "weather",
    };
  }

  // 🥺 Love Life
  if (fuzzy(["may jowa ka", "taken ka", "boyfriend", "girlfriend"])) {
    return {
      reply: isTagalog(message)
        ? "Wala akong jowa... pero kaya kong makinig kung gusto mong maglabas ng sama ng loob. 😅"
        : "I don’t have a love life, but I’ve got time for you. 😅",
      category: "lovelife",
    };
  }

  // 🧠 Joke
  if (fuzzy(["joke", "joke time", "magpatawa"])) {
    return {
      reply: isTagalog(message)
        ? "Bakit hindi marunong sumayaw ang kalendaryo? Kasi may mga araw lang siya. 😆"
        : "Why can't a calendar dance? Because it has too many dates! 😆",
      category: "joke",
    };
  }

  // ❤️ Pickup Line
  if (fuzzy(["pickup line", "banat", "landi", "ligaw"])) {
    return {
      reply: isTagalog(message)
        ? "Alam mo ba kung bakit wala kang signal? Kasi naka-connect ka na sa puso ko. 💘"
        : "Are you Wi-Fi? Because I’m feeling a strong connection. 💘",
      category: "pickup",
    };
  }

  // 🤔 Gutom
  if (fuzzy(["gutom", "kumain ka na", "have you eaten"])) {
    return {
      reply: isTagalog(message)
        ? "Wala akong bituka, pero gutom ako sa pagmamahal... char! 😅"
        : "I don’t eat, but I’m starving for... affection. 😂",
      category: "gutom",
    };
  }

  // 🤭 Crush
  if (fuzzy(["crush mo ba ako", "do you like me", "may gusto ka ba sakin"])) {
    return {
      reply: isTagalog(message)
        ? "Secret! Pero kung tatanungin mo pa ulit, baka sagutin na kita. 😘"
        : "That’s classified. Ask again and I *might* confess. 😘",
      category: "crush",
    };
  }

  // Default
  return {
    reply: isTagalog(message)
      ? "Hmm... hindi ko sure kung anong ibig mong sabihin. Pwede mo bang ulitin?"
      : "Hmm... I'm not quite sure what you mean. Can you rephrase it?",
  };
}
