/**
 * Text utility functions
 */

export function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function charCount(text) {
  return (text || '').length;
}

export function readingTime(text) {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

export function downloadAsTxt(text, filename = 'hizzs-output.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return true;
}

export function splitParagraphs(text) {
  return (text || '').split(/\n\n+/).filter(Boolean);
}

/**
 * Extract the first line as a title from string
 */
export function extractTitle(text) {
  if (!text) return 'Untitled Session';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines.find(l => !l.startsWith('•') && !l.startsWith('-') && !l.startsWith('*') && l.length > 3);
  return title ? title.slice(0, 60) + (title.length > 60 ? '...' : '') : 'Untitled Session';
}

/**
 * Parses Gemini text into structured sections.
 */
export function parseAIOutput(rawText) {
  if (!rawText) return { summary: '', events: [], mainPoints: [] };
  
  const extractSection = (titleRegex, nextTitleRegex) => {
    const regex = new RegExp(`(?:^|\n)(?:#|\\*|\\s)*${titleRegex}(?:\\s|\\*|:)*(?:\n|)(.*?)(?=(?:(?:^|\n)(?:#|\\*|\\s)*${nextTitleRegex})|$)`, 'is');
    const match = rawText.match(regex);
    return match ? match[1].trim() : '';
  };

  const summaryText = extractSection('The Executive Summary', 'The Timeline');
  const timelineText = extractSection('The Timeline(?:\\s*/\\s*Key Events)?', 'The Core Pillars');
  const pillarsText = extractSection('The Core Pillars(?:\\s*\\(Main Points\\))?', 'The Conclusion');
  
  const splitBullets = (str) => {
    return str.split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('•') || s.startsWith('-') || s.startsWith('*') || /^\d+\./.test(s))
      .map(s => s.replace(/^[•\-*\s]+|^\d+\.\s+/, '').trim())
      .filter(Boolean);
  };

  let events = splitBullets(timelineText);
  if (events.length === 0 && timelineText) events = [timelineText];

  let mainPoints = splitBullets(pillarsText);
  if (mainPoints.length === 0 && pillarsText) mainPoints = [pillarsText];

  return {
    summary: summaryText,
    events,
    mainPoints
  };
}

/**
 * Save a processed session to localStorage
 */
export function saveToHistory(originalText, aiSummary) {
  const key = 'hizzs_web_history';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');

  const parsed = parseAIOutput(aiSummary);
  const title = extractTitle(originalText);

  const entry = {
    id: Date.now(),
    title,
    summary: parsed.summary || 'Summary unavailable',
    events: parsed.events,
    mainPoints: parsed.mainPoints,
    date: new Date().toLocaleDateString(),
    progress: 0,
    status: 'In Progress',
    originalText,
    rawAiSummary: aiSummary
  };

  const updated = [entry, ...existing].slice(0, 50); // Keep max 50
  localStorage.setItem(key, JSON.stringify(updated));
  return entry;
}

export function updateHistoryProgress(id, progress) {
  const key = 'hizzs_web_history';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = existing.map(item => {
    if (item.id === Number(id)) {
      const newProgress = Math.max(item.progress || 0, progress);
      let newStatus = item.status || 'In Progress';
      if (newProgress >= 100) newStatus = 'Completed';
      
      return { 
        ...item, 
        progress: newProgress,
        status: newStatus 
      };
    }
    return item;
  });
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getHistoryEntry(id) {
  const key = 'hizzs_web_history';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  return existing.find(item => item.id === Number(id));
}

export function getHistory() {
  const existing = JSON.parse(localStorage.getItem('hizzs_web_history') || 'null');
  if (existing && existing.length > 0) return existing;

  // Provide realistic dummy data for hackathon demos if empty
  const dummyHistory = [
    {
      id: 1001,
      title: 'Neuro-Inclusion in High-End Digital Interfaces',
      summary: 'True premium design aligns elegance with cognitive ease.',
      date: 'OCT 11, 2023',
      progress: 100,
      status: 'Completed',
      originalText: 'Neuro-inclusion goes beyond basic accessibility by accommodating a wide spectrum of cognitive processing styles. High-end interfaces often fall into the trap of over-animation and low-contrast minimalism, which disrupt focus. True premium design aligns elegance with cognitive ease—predictable navigation patterns, sensory control features, and reducing cognitive load through progressive disclosure.'
    },
    {
      id: 1002,
      title: 'The Quiet Power of Brutalist Interior Design',
      summary: 'Functional forms and raw materials define architectural brutalism.',
      date: 'OCT 12, 2023',
      progress: 45,
      status: 'In Progress',
      originalText: 'Brutalist architecture emerged in the 1950s as a rejection of frivolous ornamentation. Its core ethos centers on raw materials, primarily exposed concrete, and functional, massive forms. In digital design, this translates to minimal palettes, high contrast typography, and an unapologetic focus on structured data over aesthetic flair. The quiet power lies in its honesty.'
    },
    {
      id: 1003,
      title: 'Minimalism as a Tool for Cognitive Satiety',
      summary: 'Limiting sensory input to prevent doom-scrolling.',
      date: 'OCT 10, 2023',
      progress: 15,
      status: 'Archived',
      originalText: 'Cognitive satiety is the feeling of having consumed just enough information to satisfy a need without experiencing overwhelm. Minimalism serves as a physiological tool for this. By deliberately introducing negative space and limiting color palettes, digital minimalism curates the user\'s attention, stopping the doom-scroll loop and promoting intentional interaction.'
    }
  ];
  
  localStorage.setItem('hizzs_web_history', JSON.stringify(dummyHistory));
  return dummyHistory;
}

export function clearHistory() {
  localStorage.removeItem('hizzs_web_history');
}

export function deleteHistoryItem(id) {
  const existing = getHistory();
  const updated = existing.filter(e => e.id !== Number(id));
  localStorage.setItem('hizzs_web_history', JSON.stringify(updated));
  return updated;
}

export function saveBookmark(bookmarkData) {
  const key = 'hizzs_web_bookmarks';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleDateString(),
    ...bookmarkData
  };
  const updated = [entry, ...existing];
  localStorage.setItem(key, JSON.stringify(updated));
  return entry;
}

export function getBookmarks() {
  return JSON.parse(localStorage.getItem('hizzs_web_bookmarks') || '[]');
}

export function deleteBookmark(id) {
  const existing = getBookmarks();
  const updated = existing.filter(e => e.id !== Number(id));
  localStorage.setItem('hizzs_web_bookmarks', JSON.stringify(updated));
  return updated;
}
