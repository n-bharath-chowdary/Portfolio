# N Bharath Chowdary: portfolio

Live: https://kiddosphere.in (GitHub Pages, branch `HIKE`, custom domain in `CNAME`).

One static page, no build step, no dependencies to install. Edit a file, push to `HIKE`, and
Pages publishes it.

## What is on it

- **SCOUT '24, London**: first place in the final pitch round. Selected from Karnataka among
  the top 1% of undergraduate students; 15 days of training on entrepreneurship, sustainability
  in entrepreneurship and business development. An animated Karnataka-to-London route, counters
  and confetti, in `index.html` (`#scout`) and `assets/fx.*`.
- **Kiddo**, a small guide robot (`assets/kiddo.js`, `assets/kiddo.css`): waves hello, follows the
  pointer with its eyes, offers a 60-second spotlight tour once, and can be summoned any time by
  clicking it. Skippable, keyboard friendly (arrows, Esc), and quiet after the first visit.
- Motion layer (`assets/fx.js`, `assets/fx.css`): living constellation background, scroll reveal,
  tilt cards, magnetic buttons, typed role line, self-drawing timeline, scroll progress. All of it
  turns itself off for visitors who ask their system for reduced motion.
- Light and dark theme (the toggle top right).

## How search engines and AI assistants find it (no Search Console needed)

| File | What it does |
|---|---|
| `robots.txt` | Allows everything, names the search and AI crawlers, and points to the sitemap. Google reads the sitemap from here. |
| `sitemap.xml` | The page, its images and the resume PDF. Update `<lastmod>` when the page changes. |
| `llms.txt` | A plain summary for AI assistants, including the SCOUT '24 win. |
| `index.html` | Title, description, Open Graph and X cards (`images/og.png`, 1200x630), and JSON-LD: Person (with `award`), ProfilePage, Organization, WebSite. |
| `<key>.txt` + `.github/workflows/indexnow.yml` | **IndexNow**: on every push to `HIKE` the workflow waits for Pages to publish, then tells Bing, Yandex, Naver, Seznam and Yep (and through Bing, several AI search products) that the page changed. |
| `404.html` | A `noindex` not-found page for GitHub Pages. |

Google does not accept IndexNow and has no open "submit this URL" API for ordinary pages. Without
Search Console it finds a site by following the sitemap named in `robots.txt` and by following
links. The quickest way to speed that up is links from places Google already crawls often: link
https://kiddosphere.in from trinetrolabs.com (an About/Founder page), LinkedIn, GitHub and X.

## Editing notes

- Paths are relative, and file names are case sensitive on GitHub Pages.
- Keep `CNAME` as it is.
- The share image source is a screenshot of a small HTML page; to change it, render a 1200x630
  image and keep it under 300 KB (WhatsApp drops larger previews).
