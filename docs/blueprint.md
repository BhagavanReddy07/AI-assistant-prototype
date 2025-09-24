# **App Name**: PersonalAI Proto

## Core Features:

- Chat Interface: A clean and intuitive chat interface for text-based conversations.
- Intent Detection: Use a pre-trained model tool to identify the user's intent from their input.
- Entity Extraction: Extract key entities from user input using a pre-trained model tool to provide context to the LLM.
- LLM Integration: Integrate with the Gemini Pro API to generate responses based on intent and extracted entities.
- Context Management: Implement Redis for short-term (recent chats) and PostgreSQL for long-term storage (complete chat history).
- Conversation History: Display previous chat history in a sidebar. New chat button clears current context.
- Memory Editor (Placeholder): Visually represent a 'Memory Editor' panel to indicate where memory editing features will be but its just for UI/UX design perspective

## Style Guidelines:

- Primary color: Deep Indigo (#663399) for a sophisticated and intelligent feel.
- Background color: Light Gray (#F0F0F0) for a clean, modern backdrop.
- Accent color: Teal (#008080) to highlight key elements and calls to action.
- Body and headline font: 'Inter', a grotesque-style sans-serif, will be used for both headlines and body text due to its modern, neutral look suitable for clear communication.
- Sidebar navigation for chat history. Main chat window for current conversations. Placeholder panel for memory editing.
- Simple, outline-style icons for a clean and modern look.
- Subtle transitions and animations for loading messages and displaying information.