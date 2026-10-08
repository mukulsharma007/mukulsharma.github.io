# mukulsharma007.github.io

Personal website of Mukul Sharma: machine learning scientist (LLMs, RAG, knowledge graphs).
Live at https://mukulsharma007.github.io

## Pages

| Menu item | File |
|---|---|
| Home | `index.html` |
| Projects | `projects.html` (master's thesis + all projects) |
| Seminar papers | `seminar-papers.html` |
| Experience | `experience.html` (work + education) |
| Skills | `skills.html` |
| Interests | `interests.html` |
| Trainings | `trainings.html` |
| Certifications | `certifications.html` |

`404.html` is shown for addresses that don't exist.
The bachelor thesis has no page of its own any more: it appears under **Selected work** on Home
(below the master's thesis) and as a card under **Research and AI** on the Projects page.
`bachelor-thesis.html` only forwards old links there and can be deleted.
The menu sits at the top with the name on the left; below 1100 px wide it folds into a **Menu** button.
The site is always light, even if the visitor's device uses dark mode.

## Editing: only `content.js`

All text, links, projects and menu labels live in `content.js`. Every page is built from it.

1. Open `content.js` on GitHub and click the pencil icon.
2. Edit, then **Commit changes**. The site updates in a minute or two (refresh with Ctrl+Shift+R).

- **Add a project:** copy one block in `projects`, change it, and pick `category: "research"` or `"software"`.
- **Choose the projects on Home:** list their titles in `selected`. The master's and bachelor's theses always come first.
- **Seminar papers** are written once in `papers` and appear on the Seminar papers page and under Research and AI.
- **"Coming soon" links:** a link set to `"#"` shows greyed out with a "coming soon" tag. Replace `"#"` with the real address when it's ready.
- **Add a PDF:** upload it to `papers/` (see `papers/README.md` for names), then set the path, e.g. `pdf: "papers/master-thesis.pdf"`.
- **Links inside text:** `[Leibniz University Hannover](https://www.uni-hannover.de/en/)`.
- **Rename a menu item:** change its `label` in `pages`. Don't change `id` or `file`.
- **See what's missing:** add `?draft` to any page address, e.g. `projects.html?draft`.
- **Page blank after an edit?** Usually a missing comma or quote: press F12 → Console for the line number.

## Files

| Path | What it is |
|---|---|
| `content.js` | All content (edit this) |
| `assets/style.css` | Colours, fonts, layout |
| `assets/app.js` | Builds menu, pages and footer from `content.js` |
| `assets/search.js` | "Ask my CV" on the Home page |
| `papers/` | PDFs of your theses and seminar papers |
| `worker/` | Optional Cloudflare Worker for LLM answers (see `worker/README.md`) |

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
