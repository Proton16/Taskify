// const API_KEY = "AIzaSyCyGCSXiULz7U-4Izvxj4yfi7yWHKNtmZ0"; // Gemini API Key
// let currentMode = "block"; // Default mode

// // Toggle Buttons
// document.getElementById("blockToggle").addEventListener("click", () => {
//   currentMode = "block";
//   updateToggleStyles();
// });

// document.getElementById("focusToggle").addEventListener("click", () => {
//   currentMode = "focus";
//   updateToggleStyles();
// });

// function updateToggleStyles() {
//   document.getElementById("blockToggle").classList.toggle("active", currentMode === "block");
//   document.getElementById("focusToggle").classList.toggle("active", currentMode === "focus");
// }

// // Handle Submit
// document.getElementById("submitBtn").addEventListener("click", async () => {
//   const input = document.getElementById("userInput").value.trim();
//   const statusEl = document.getElementById("status");

//   if (!input) {
//     statusEl.textContent = "⚠️ Please enter something.";
//     return;
//   }

//   if (currentMode === "focus") {
//     // Focus Mode: Save topic and open YouTube
//     statusEl.textContent = "🎯 Setting focus topic...";
//     chrome.storage.local.set({ userGoal: input }, () => {
//       statusEl.textContent = "✅ Focus topic set!";
//       window.open("https://www.youtube.com", "_blank");
//     });

//   } else {
//     // Block Mode: Use Gemini to extract websites + duration
//     statusEl.textContent = "⏳ Extracting block data...";
//     const extracted = await extractBlockData(input);

//     statusEl.textContent = "✅ Blocking...";
//     chrome.runtime.sendMessage({
//       type: "BLOCK_DATA",
//       payload: extracted
//     }, () => {
//       loadBlockedSites();
//       statusEl.textContent = "✅ Done!";
//     });
//   }
// });

// // Gemini extraction logic
// async function extractBlockData(userPrompt) {
//   const systemPrompt = `
// You are an assistant that extracts data from natural language instructions.

// From the user prompt, extract:
// - A list of websites to be blocked, using their **correct and complete root domain names**, exactly as they appear in the browser (e.g., "www.facebook.com", "leetcode.com", etc.).
// - The duration for which they should be blocked.

// Instructions:
// - Convert casual names like "insta", "yt", "fb" into real domains like "instagram.com", "youtube.com", etc.
// - Always extract a duration. Accept formats like "5s", "5 sec", "10 minutes", etc.
// - If no duration is mentioned, use the default of **30 minutes**.
// - Normalize all units to readable forms like "1 minute", "2 hours".

// Return result as:
// {
//   "websites": ["example.com"],
//   "duration": "30 minutes"
// }

// User prompt: "${userPrompt}"
// `;

//   try {
//     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [
//           { role: "user", parts: [{ text: systemPrompt }] }
//         ]
//       })
//     });

//     const data = await res.json();
//     const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
//     const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
//     const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {
//       websites: [],
//       duration: "30 minutes"
//     };

//     return extracted;

//   } catch (err) {
//     console.error("❌ Gemini extraction failed:", err);
//     return { websites: [], duration: "30 minutes" };
//   }
// }

// // Countdown display
// function formatTimeLeft(ms) {
//   const totalSeconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   return `${minutes}m ${seconds}s`;
// }

// function updateCountdowns() {
//   chrome.storage.local.get("blockedSites", ({ blockedSites }) => {
//     const container = document.getElementById("countdownContainer");
//     container.innerHTML = "";

//     if (!blockedSites || blockedSites.length === 0) {
//       container.innerHTML = "<p>No sites are currently blocked.</p>";
//       return;
//     }

//     const now = Date.now();

//     blockedSites.forEach(site => {
//       const timeLeft = site.unblockAt - now;
//       const div = document.createElement("div");
//       div.className = "countdown-item";

//       if (timeLeft > 0) {
//         div.textContent = `${site.domain} ⏳ ${formatTimeLeft(timeLeft)}`;
//       } else {
//         div.textContent = `${site.domain} ✅ Unblocked`;
//       }

//       container.appendChild(div);
//     });
//   });
// }

// setInterval(updateCountdowns, 1000);
// updateCountdowns();

// function loadBlockedSites() {
//   chrome.storage.local.get(["blockedSites"], (result) => {
//     const sites = result.blockedSites || [];
//     const list = document.getElementById("blockedList");
//     if (list) {
//       list.innerHTML = "";
//       sites.forEach(site => {
//         const li = document.createElement("li");
//         li.textContent = site;
//         list.appendChild(li);
//       });
//     }
//   });
// }

// document.addEventListener("DOMContentLoaded", loadBlockedSites);






const API_KEY = "AIzaSyCyGCSXiULz7U-4Izvxj4yfi7yWHKNtmZ0";
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const focusToggle = document.getElementById("focusToggle");
const blockToggle = document.getElementById("blockToggle");
const statusEl = document.getElementById("status");
resetBtn.style.display = "none";

let currentMode = "block"; // default

function updateToggleStyles() {
  if (currentMode === "block") {
    blockToggle.classList.add("active");
    focusToggle.classList.remove("active");
    resetBtn.style.display = "none";
  } else {
    focusToggle.classList.add("active");
    blockToggle.classList.remove("active");
    resetBtn.style.display = "block";
  }
}

blockToggle.addEventListener("click", () => {
  currentMode = "block";
  updateToggleStyles();
});

focusToggle.addEventListener("click", () => {
  currentMode = "focus";
  updateToggleStyles();
});

// 🧠 Main handler
submitBtn.addEventListener("click", async () => {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;

  if (currentMode === "block") {
    statusEl.textContent = "⏳ Extracting...";
    const extracted = await extractBlockData(input);

    statusEl.textContent = "✅ Done! Sending to background...";
    chrome.runtime.sendMessage({
      type: "BLOCK_DATA",
      payload: extracted
    }, () => {
      loadBlockedSites();
    });

  } else if (currentMode === "focus") {
    chrome.storage.local.set({ userGoal: input }, () => {
      statusEl.textContent = "✅ Focus topic set!";
      resetBtn.style.display = "block";
      window.open("https://www.youtube.com", "_blank");
    });
  }
});

// 🤖 Gemini API block extractor
async function extractBlockData(userPrompt) {
  const systemPrompt = `
You are an assistant that extracts data from natural language instructions.

From the user prompt, extract:
- A list of websites to be blocked, using their **correct and complete root domain names**, exactly as they appear in the browser (e.g., "www.facebook.com", "www.instagram.com", "leetcode.com", "x.com").
- The duration for which they should be blocked.

Instructions:
- Convert casual or slang names like "insta", "x", "fb" into real domains like  "www.instagram.com", "x.com, " "www.facebook.com" etc.
- Always extract a duration. Accept formats like "5s", "5 sec", "10 minutes", "2 hrs", etc.
- If no duration is mentioned, use the default of **30 minutes**.
- Normalize all units to readable forms like "1 second", "2 minutes", "1 hour".
- Don't dare to do anything with youtube.

Return the result as a JSON object like:
{
  "websites": ["facebook.com"],
  "duration": "1 hour"
}

Here is the user prompt:
"${userPrompt}"
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      websites: [],
      duration: "30 minutes"
    };

    return extracted;

  } catch (err) {
    console.error("❌ Gemini extraction failed:", err);
    return { websites: [], duration: "30 minutes" };
  }
}

// 🧠 Countdown and blocked site display
function formatTimeLeft(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function updateCountdowns() {
  chrome.storage.local.get("blockedSites", ({ blockedSites }) => {
    const container = document.getElementById("countdownContainer");
    container.innerHTML = "";

    if (!blockedSites || blockedSites.length === 0) {
      container.innerHTML = "<p>No sites are currently blocked.</p>";
      return;
    }

    const now = Date.now();

    blockedSites.forEach(site => {
      const timeLeft = site.unblockAt - now;
      const div = document.createElement("div");
      div.className = "countdown-item";

      if (timeLeft > 0) {
        div.textContent = `${site.domain} ⏳ ${formatTimeLeft(timeLeft)}`;
      } else {
        div.textContent = `${site.domain} ✅ Unblocked`;
      }

      container.appendChild(div);
    });
  });
}

function loadBlockedSites() {
  chrome.storage.local.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || [];
    const list = document.getElementById("blockedList");
    list.innerHTML = "";

    sites.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      list.appendChild(li);
    });
  });
}

setInterval(updateCountdowns, 1000);
updateCountdowns();
document.addEventListener("DOMContentLoaded", loadBlockedSites);

// 🔁 Reset button logic
resetBtn.addEventListener("click", () => {
  chrome.storage.local.remove("userGoal", () => {
    resetBtn.style.display = "none";

    // Reload YouTube tabs
    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.location.reload()
        });
      });
    });
  });
});
