# Kickoff Day — Command Runbook

Run these in order, in a VS Code terminal, inside your new project folder.

## 1. Clone the repo (once created)

```bash
git clone <repo-url>
cd <repo-folder-name>
```

## 2. Create your feature branches (do this for each area you own)

```bash
git checkout -b feature/cedar-policy
git checkout -b feature/audit-log
git checkout -b feature/executor
git checkout -b feature/infra
```

_(You only need to be ON one branch at a time — `git checkout -b <name>` creates and switches to it. Switch between them anytime with `git checkout <branch-name>`.)_

## 3. Set up Python environment

```bash
python -m venv .venv
```

Activate it (Windows):

```bash
.venv\Scripts\activate
```

You'll know it worked when you see `(.venv)` at the start of your terminal line.

## 4. Install your Python packages

```bash
pip install boto3 strands-agents strands-agents-tools
```

## 5. Confirm AWS CLI is working (should already be set up)

```bash
aws sts get-caller-identity
```

✅ Should print your Account ID and `user/Aaditya-dev` — confirms you're ready to interact with AWS.

## 6. Create your first commit

```bash
git add .
git commit -m "initial setup: venv + dependencies"
git push origin feature/cedar-policy
```

_(swap branch name for whichever one you're pushing)_

## 7. When ready to merge into main

Don't run `git merge` directly — instead:

1. Push your branch: `git push origin <branch-name>`
2. Go to GitHub → open a Pull Request → get it reviewed → merge there

## Everyday loop (repeat this while working)

```bash
git add .
git commit -m "short description of what you did"
git push
```

## If you ever get confused about what branch you're on

```bash
git status
git branch
```

---

**That's genuinely it for day one.** Don't worry about Cedar/OpenSearch/SAM commands yet — those come once the basic scaffolding above is working. One step at a time.
