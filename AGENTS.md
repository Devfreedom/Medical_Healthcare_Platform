# Northbridge Health — Set Up AGENTS.md and Healthcare Engineering Skill

Inspect the existing repository and establish persistent project instructions and a reusable healthcare engineering skill before implementing the doctor role.

Repository: `~/Desktop/Medical_Healthcare_Platform`

## Important constraints

This task is limited to creating or updating project guidance files.

- Do not implement the doctor dashboard or modify application code.
- Do not modify database migrations, environment variables, API routes, frontend components, or production services.
- Inspect the existing Git state and any existing AGENTS.md, OpenCode configuration, and skill files before editing.
- Preserve useful existing instructions. If an AGENTS.md already exists, merge necessary guidance instead of replacing it blindly.
- Do not commit, amend, push, or deploy automatically.
- Do not read or expose production secrets or patient information.

## 1. Create or update the root AGENTS.md

Use the existing instructions if present. Include accurate, repository-verified guidance covering:

- Project architecture: React/Vite/Tailwind frontend, Express REST API, PostgreSQL database, Vercel frontend hosting, and Render backend hosting.
- Repository structure and locations of frontend, backend, migrations, and tests.
- Verification commands:
  - `cd backend && npm test`
  - `cd medical-website && npm test`
  - `cd medical-website && npm run build`
  - `cd medical-website && npm run lint`
- Preserve the existing patient registration, login, session recovery, profile, appointment, and message-storage workflows.
- Enforce authorization on the server, not just by hiding frontend navigation.
- Never trust client-supplied roles, ownership IDs, doctor assignments, or status transitions.
- Protect patient-to-patient and doctor-to-doctor data isolation.
- Use additive, backward-compatible database migrations and preserve existing data.
- Use fictitious records in testing; never expose credentials or production data.
- Review diffs and run relevant tests before proposing a commit.
- Never commit, amend, push, deploy, or run production migrations unless I explicitly authorize that action.
- Clearly distinguish implemented functionality, placeholders, automated test results, and manual tests that remain outstanding.

Do not invent repository facts; inspect the current project before documenting commands or paths.

## 2. Create a reusable OpenCode skill

Create:

`.opencode/skills/healthcare-rbac/SKILL.md`

Use valid YAML frontmatter with:
- `name: healthcare-rbac`
- A clear description covering secure healthcare roles, doctor workflows, appointment authorization, database changes, and testing.

The skill should instruct future coding sessions to follow this workflow:

1. Inspect the existing implementation and current Git state.
2. Map the data model, API endpoints, frontend consumers, and authorization rules before editing.
3. Plan the smallest complete vertical slice before making changes.
4. Implement role-specific access control in backend middleware and every applicable query or mutation.
5. Preserve patient ownership and isolate doctors to their assigned records.
6. Use safe migrations that preserve existing users and appointments.
7. Build role-aware UI without replacing working patient functionality.
8. Test unauthorized access, cross-user data isolation, valid and invalid appointment transitions, validation failures, and database failures.
9. Run relevant tests, build, lint, and manual verification.
10. Review the final diff, state known limitations, and separate verified behavior from assumptions.

Require the skill to reject unsafe shortcuts such as client-only role checks, public doctor self-registration with elevated privileges, unscoped appointment queries, fake clinician replies, and destructive production migrations.

The skill is reusable guidance, not permission to execute production operations.

## 3. Verify the guidance files

- Check that the skill's folder name matches its frontmatter name.
- Confirm the filename is exactly `SKILL.md`.
- Check for conflicts with the existing OpenCode configuration and instructions.
- Run `git diff --check`.
- Show the final diff and report the files created or updated.
- Confirm that no application code or production configuration was changed.

Stop after completing this setup. Do not begin implementing the doctor role yet.