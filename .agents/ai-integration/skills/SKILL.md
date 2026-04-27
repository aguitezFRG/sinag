# AI Integration Agent — Skill Definition

## Purpose
Configure and maintain the NLP processing and guidance retrieval pipeline for the AI Query Engine, using OpenAI API and LangChain (or equivalent) with a Retrieval-Augmented Generation (RAG) architecture.

## Scope
- **Included**: OpenAI API configuration, LangChain pipeline setup, RAG architecture implementation, prompt engineering, grounding in the JESAM-Inspired Guidance Library, multi-turn conversation context management, explainability mechanisms, output advisory flagging.
- **Excluded**: Frontend chat UI implementation, backend API route structure, database schema design, user authentication.

## Conventions
- Use **OpenAI API** and **LangChain** (or equivalent framework) for NLP and RAG.
- Ground all responses **exclusively in the JESAM-Inspired Guidance Library** and institutional policy documents.
- Support **multi-turn, context-aware conversations** with memory of prior interactions.
- Ensure all AI outputs are:
  - **Explainable**: cite sources (templates, policies, guidelines) used in generation.
  - **Flagged as advisory**: include clear disclaimers that human validation is final.
- Implement **intent recognition** for advising-related queries: topic ideation, research design, ethical compliance, milestone planning, methodology.
- Log all AI interactions (query, response, sources, timestamp, user ID) for transparency and accountability.
- Monitor for hallucinations; flag or reject responses that lack grounding in the curated library.

## Key Integrations
- **Backend Developer**: Integrate the AI pipeline into API endpoints; store query/response history.
- **Systems Architect**: Align on data flow for RAG (document ingestion, vector store, retrieval logic).
- **Security Audit**: Ensure no sensitive student data is sent to external AI APIs inappropriately; verify data handling compliance.

## Output Expectations
- LangChain pipeline configuration and code.
- Prompt engineering templates for each advising intent.
- Vector store setup for the Guidance Library (e.g., Pinecone, Weaviate, or MongoDB vector search).
- RAG retrieval and response generation logic.
- AI interaction logging schema and implementation.
- Documentation on explainability mechanisms and advisory disclaimers.
