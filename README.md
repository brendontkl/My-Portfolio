# 0xBREN — My Personal Portfolio
> **Brendon Teo** · Senior Penetration Tester · Singapore

[![My Website](https://img.shields.io/badge/🌐_My_Website-0xbren.com-8b5cf6?style=for-the-badge&labelColor=0d1117)](https://0xbren.com)

[![CVEs](https://img.shields.io/badge/CVEs_Filed-1-ff4757?style=for-the-badge&labelColor=0d1117)](https://github.com/brendontkl/My-CVEs)
[![VAPT Tools](https://img.shields.io/badge/VAPT_Tools-4-00d4ff?style=for-the-badge&labelColor=0d1117)](https://github.com/brendontkl/VAPT-Tools)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077b5?style=for-the-badge&logo=linkedin&labelColor=0d1117)](https://www.linkedin.com/in/brendon-teo-195971152/)

---

```
~$ whoami
Brendon Teo · Senior Penetration Tester · Singapore
~$ cat specializations.txt
> Web VAPT | Infra VAPT | Active Directory Testing
> Kiosk PT | Thick Client PT | Source Code Reviews
> Cloud Security (Azure, AWS) | Mobile App Testing
> Phishing Campaigns | Host Config Reviews
~$ cat sectors.txt
Government | MNCs | SMEs
~$ ls cves/
CVE-2024-40125  [CRITICAL 9.8]
~$ _
```

---

## 📁 Repository Structure

```
portfolio/
├── index.html          # Main landing page
├── blog.html           # Research & writeups listing
├── css/
│   ├── style.css       # Global terminal noir theme
│   └── blog.css        # Blog page styles
└── js/
    ├── scene.js        # Scroll-driven Canvas animation
    ├── main.js         # Main JS File
    └── blog.js         # Blog search + category filters
```

---

## ✨ Features

**Live Stats**
Years of experience auto-calculates from May 2022 and increments every anniversary. CVE count fetches live from the GitHub API on every visit — no manual updates needed.

**CVE Database**
Filterable by severity with direct links to NVD and PoC advisories. Syncs count automatically from `brendontkl/My-CVEs`.

**Research & Blog**
Searchable and filterable by category — Web VAPT, Infra VAPT, Active Directory, Kiosk/Thick Client, CVE Research, and Certifications.

**Zero Dependencies**
Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no npm.

---

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/brendontkl/portfolio.git
cd portfolio

# Serve locally (Python)
python3 -m http.server 8080

# Or with Node
npx serve .
```

Open `http://localhost:8080`

> Fonts load from Google Fonts CDN — an internet connection is needed for correct rendering.

---

## 🔧 Customisation

### Update your stats

In `js/main.js`, the YOE is calculated dynamically from your start date:
```js
// Change this date to your actual start date
const start = new Date('2022-05-01');
```

CVE count is fetched live — just push new CVEs to your `My-CVEs` repo and the counter updates itself.

### Add a new CVE

Copy a `.cve-card` block in `index.html` and update the fields:
```html
<div class="cve-card reveal" data-severity="critical">
  <div class="cve-top">
    <span class="cve-id">CVE-XXXX-XXXXX</span>
    <span class="severity critical">CRITICAL 9.X</span>
  </div>
  <h3 class="cve-title">Your CVE Title</h3>
  ...
</div>
```

### Add a blog post

In `blog.html`, copy a `.blog-post-card` block:
```html
<article class="blog-post-card reveal" data-cat="web" data-title="your searchable title">
```

Available categories: `cert`, `web`, `infra`, `ad`, `kiosk`, `cve`

### Change the accent colour

In `css/style.css`, edit the root variables:
```css
:root {
  --green: #00ff88;   /* Main accent */
  --cyan:  #00d4ff;   /* Secondary accent */
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, grid, animations) |
| Animation | Canvas 2D API, CSS keyframes |
| Interactivity | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Orbitron, IBM Plex Mono, Share Tech Mono) |
| Hosting | GitHub Pages |
| CVE Data | GitHub REST API (live fetch) |

---

## 🔒 My CVEs

| CVE ID | Severity | Description | Published |
|---|---|---|---|
| [CVE-2024-40125](https://nvd.nist.gov/vuln/detail/CVE-2024-40125) | 🔴 **CRITICAL 9.8** | Arbitrary File Upload → RCE in Closed-Loop CLESS Server v4.5.2 | Sep 2024 |

Full advisories and PoCs: **[brendontkl/My-CVEs](https://github.com/brendontkl/My-CVEs)**

---

## 🧰 VAPT Tools

| Tool | Description | Link |
|---|---|---|
| **BT-WebSuite** | Automated web recon, parameter fuzzing & vulnerability discovery | [GitHub](https://github.com/brendontkl/VAPT-Tools/tree/main/BT-WebSuite) |
| **CIS-NessusToExcel** | Converts Nessus CIS compliance scans into client-ready Excel reports | [GitHub](https://github.com/brendontkl/VAPT-Tools/tree/main/CIS-NessusToExcel) |
| **VA-Automater** | Automates VA reporting — removes risk-accepted findings, buckets by category, reassesses CVSS scores | [GitHub](https://github.com/brendontkl/VAPT-Tools/tree/main/Infra-VA) |
| **OSED-Automation** | Exploit dev automation — bad char analysis, shellcode gen, skeleton scaffolding | [GitHub](https://github.com/brendontkl/VAPT-Tools/tree/main/OSED-Automation) |

Full collection: **[brendontkl/VAPT-Tools](https://github.com/brendontkl/VAPT-Tools)**

---

## 📜 Certifications

`OSCP` `OSEP` `OSWE` `CRT` `CEH Master` `CKBPro` `C-AI/ML` `CCNA CyberOps`

---

## 📬 Contact

| Platform | Link |
|---|---|
| Email | [btkl123@gmail.com](mailto:btkl123@gmail.com) |
| LinkedIn | [linkedin.com/in/brendon-teo-195971152](https://www.linkedin.com/in/brendon-teo-195971152/) |
| GitHub | [github.com/brendontkl](https://github.com/brendontkl) |
| Medium | [medium.com/@btkl123](https://medium.com/@btkl123) |

---

## ⚖️ Disclaimer

> All vulnerability research and CVEs documented here were discovered and disclosed through responsible disclosure processes. All penetration testing activities were conducted under proper authorisation. This portfolio is for informational and professional showcase purposes only.

---

<div align="center">
  <sub>Built with 💚 and too much caffeine · Singapore · <a href="https://brendontkl.github.io">0xBREN</a></sub>
</div>
