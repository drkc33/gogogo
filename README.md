# Reviewers
A static study app: course picker, dashboard, practice with explanations, cram mode, notes, timed mock exams. Progress is saved in your browser (localStorage). No build step.

## Run locally
    python -m http.server 8000
then open http://localhost:8000 (do not double-click index.html; browsers block fetch() on file://).

## Deploy on GitHub Pages
1. Create a new public repo, then push these files to the `main` branch.
2. Repo Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
3. After about a minute your site is at https://YOUR-USERNAME.github.io/REPO-NAME/

## Add questions
Edit `data/courses.json`: course → topics → sections → questions. Each question has `q`, `options`, `answer` (index of the correct option, starting at 0), `explain`, and optional `"hy":true` to include it in Cram mode.
