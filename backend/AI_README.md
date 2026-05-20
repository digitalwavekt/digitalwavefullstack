AI generation option

The backend supports optional automatic AI generation after a successful paid order.

To enable automatic AI content generation set the following environment variable in your backend `.env`:

AUTO_GENERATE_AI=true

Notes:
- Generation runs in a background task and updates the `ai_projects` record when completed.
- If `AUTO_GENERATE_AI` is not set or is `false`, admins can trigger generation from the admin panel using the `POST /api/ai-project-delivery/admin/orders/:id/generate-ai` endpoint.
- Ensure `OPENAI_API_KEY` and `OPENAI_MODEL` are configured before enabling automatic generation to avoid failures.
