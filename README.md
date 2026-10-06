<div align="center">

# 🎯 NextPR

**Find GitHub issues you can actually merge.**

Personalized open-source issue discovery, ranked by language fit, difficulty, maintainer responsiveness, repo activity, and freshness.

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

<img src="./assets/screen.gif" alt="NextPR demo" width="800" />

</div>

---

## 📖 Table of Contents

- [Why NextPR?](#-why-nextpr)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why NextPR?

Searching GitHub for a good first issue means scrolling through stale threads, unresponsive maintainers, and tasks far outside your skill set. NextPR does the filtering for you and surfaces issues that are **relevant, recent, and likely to get reviewed**.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎯 | **Personalized matching** | Issues matched to your languages and experience level |
| 🧠 | **Smart ranking** | Multi-signal scoring: language fit, difficulty, maintainer responsiveness, freshness, repo activity |
| 🔐 | **GitHub OAuth** | Secure sign-in with your GitHub account |
| 🔎 | **Issue discovery** | Browse with filters and sorting |
| ❤️ | **Saved issues** | Bookmark issues and come back later |
| 📊 | **Developer dashboard** | Recommendations tailored to your profile |
| ⚡ | **Fast UI** | Responsive interface built on Next.js |

---

## 🧠 How It Works

```mermaid
flowchart TD
    A[GitHub API] --> B[Issue Crawler]
    B --> C[(MongoDB)]
    C --> D[Ranking Engine]
    P[Developer Profile] --> D
    D --> E[Language Fit]
    D --> F[Difficulty]
    D --> G[Maintainer Responsiveness]
    D --> H[Freshness]
    D --> I[Repo Activity]
    E & F & G & H & I --> J[Personalized Matches]
    J --> K[Dashboard]
```

1. **Crawl**: the crawler pulls open issues from GitHub and stores them in MongoDB.
2. **Score**: the ranking engine scores each issue against your profile across five signals.
3. **Recommend**: top matches appear on your dashboard, ready to save or start working on.

---

## 🛠 Tech Stack

- **Framework:** Next.js, React, TypeScript
- **Auth:** GitHub OAuth
- **Database:** MongoDB
- **Data source:** GitHub REST/GraphQL API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)
- A [GitHub OAuth App](https://github.com/settings/developers)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/nextpr.git
cd nextpr

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### GitHub OAuth setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to your auth callback route (e.g. `http://localhost:3000/api/auth/callback/github`)
4. Copy the Client ID and Secret into `.env.local`

---

## 🔑 Environment Variables

> Adjust names to match your `.env.example`.

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GITHUB_TOKEN` | Personal access token used by the crawler |
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Session/JWT secret |
| `NEXTAUTH_URL` | App base URL |

---

## 📁 Project Structure

```text
nextpr/
├── assets/          # README images and demo GIF
├── src/
│   ├── app/         # Next.js routes
│   ├── components/  # UI components
│   ├── lib/         # DB, auth, GitHub client
│   └── ranking/     # Scoring logic
├── .env.example
└── package.json
```

> Update this tree to match your actual layout.

---

## 🗺 Roadmap

- [ ] Email / weekly digest of new matches
- [ ] Skill-level auto-detection from your GitHub history
- [ ] Label and topic filters
- [ ] Track PR status for saved issues
- [ ] Browser extension

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

Please check the [open issues](../../issues) for good places to start.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

Built to help developers ship their next PR. ⭐ Star the repo if it helped you!

</div>
