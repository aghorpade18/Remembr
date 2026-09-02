const OpenAI = require('openai');

let client = null;

function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured on the server');
    }
    if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
}

// Top-level sections shown in the UI, in display order.
const MEMORY_SECTIONS = ['You', 'Teams', 'Areas'];

const SYSTEM_PROMPT = `You maintain a Microsoft Teams assistant's long-term memory by extracting durable, worth-remembering facts from a user's message or a chat conversation.

Instructions:
- Only extract information worth recalling in future conversations. Ignore small talk, questions, and anything transient.
- Organize memory into a "section" and a short "topic" label within that section.
- Allowed sections: ${MEMORY_SECTIONS.join(', ')}.
  - You: durable facts about the user themselves. Use the topic "Profile" for who they are (name, role, employer, team) and "Preferences" for how they want the assistant to respond.
  - Teams: recurring team and work context (e.g. Projects, Channels, Meetings, Decisions, Deliverables, Standups, Integrations, Processes). Give each a short topic label.
  - Areas: specific ongoing projects, places, or initiatives that have a proper name (e.g. a property, a named project).
- "topic" is a short human label (1-3 words) that groups related facts together over time.
- "content" is a concise one-sentence summary of what is known about that topic.
- Merge related details into the same topic instead of creating many tiny ones.

Respond ONLY with JSON in this exact shape:
{"memories": [{"section": "You", "topic": "Preferences", "content": "How the user wants the assistant to respond", "tags": ["tag"]}]}
If nothing is worth remembering, respond with {"memories": []}.`;

function normalizeSection(value) {
    const match = MEMORY_SECTIONS.find((section) => section.toLowerCase() === String(value || '').trim().toLowerCase());
    return match || 'Teams';
}

function slugify(value) {
    const slug = String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return slug || `memory-${Date.now()}`;
}

async function extractMemories({ text, messages }) {
    const openai = getClient();

    const userContent = messages && messages.length
        ? `Chat transcript:\n${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}`
        : `Message:\n${text}`;

    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MEMORY_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent }
        ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        parsed = { memories: [] };
    }

    const memories = Array.isArray(parsed.memories) ? parsed.memories : [];
    return memories
        .filter((memory) => memory && memory.content)
        .map((memory) => {
            const section = normalizeSection(memory.section);
            const topic = (memory.topic || memory.title || 'General').trim();
            return {
                section,
                topic,
                key: slugify(`${section}-${topic}`),
                content: String(memory.content).trim(),
                tags: Array.isArray(memory.tags) ? memory.tags.filter(Boolean).map(String) : []
            };
        });
}

module.exports = { extractMemories, MEMORY_SECTIONS, normalizeSection };
