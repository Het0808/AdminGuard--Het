# Research Notes — Vibe Coding & AI Studio

## Sources Researched
- **Article**: "Build apps in Google AI Studio" (Official Documentation)
- **Video**: "Google AI Studio Vibe Coding tutorials playlist"
- **Blog**: "Prompt Engineering for LLMs: Best Practices" (OpenAI/Anthropic guides)

## Key Learnings
- **Iteration is Key**: Don't try to build the whole app in one prompt. Start with the foundation and layer features.
- **R.I.C.E Framework**: Role, Intent, Constraints, Examples. This structure significantly improves output quality.
- **Context Awareness**: The AI needs to know the "why" behind the business problem to make better technical decisions.
- **Annotation Mode**: Extremely useful for visual tweaks and specific UI component modifications.

## Learning Progression
- **Phase 1 (Wednesday Evening)**: Initial exploration of the AI Studio interface. Discovered that the "Build" mode is highly sensitive to the initial prompt structure.
- **Phase 2 (Thursday Morning)**: Experimented with the R.I.C.E framework. Found that setting a specific "Role" (e.g., Senior Frontend Developer) significantly improved the code's modularity.
- **Phase 3 (Thursday Afternoon)**: Realized that the AI sometimes hallucinates library versions. Learned to verify `package.json` and provide specific version constraints in prompts.
- **Phase 4 (Friday Morning)**: Mastered the "Annotation Mode" for surgical UI fixes. This saved time compared to re-prompting the entire component.
