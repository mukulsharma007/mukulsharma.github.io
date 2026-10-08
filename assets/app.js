/* app.js: builds the menu, the current page and the footer from content.js.
   You normally don't need to edit this file; change content.js instead. */
(function () {
  "use strict";

  var S = window.SITE;
  var PAGE = document.body.getAttribute("data-page") || "home";
  var DRAFT = /[?&]draft\b/.test(location.search);
  var ROOT = PAGE === "404" ? "/" : "";
  var slots = 0;

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function list(a) { return (a || []).filter(Boolean); }
  function isExternal(url) { return /^https?:\/\//i.test(url); }
  function href(url) { return isExternal(url) || /^(mailto:|#|\/)/.test(url) ? url : ROOT + url; }
  function a(url, label, cls) {
    return '<a href="' + esc(href(url)) + '"' + (cls ? ' class="' + cls + '"' : "") + (isExternal(url) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(label) + "</a>";
  }
  // Escapes text and turns [label](url) into links.
  function rich(text) {
    return esc(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      var u = url.replace(/&amp;/g, "&");
      return '<a href="' + esc(href(u)) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener"' : "") + ">" + label + "</a>";
    });
  }
  function slug(t) { return String(t).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function link(url, label, where) {
    if (url === "#") return soon(label);
    if (url) return a(url, label);
    if (DRAFT && where) { slots++; return '<span class="slot">' + esc(label) + ": add link in " + esc(where) + "</span>"; }
    return "";
  }
  // A link set to "#" in content.js: shown greyed out and marked "coming soon" instead of linking anywhere.
  function soon(label, cls) {
    return '<span class="soon' + (cls ? " " + cls : "") + '">' + esc(label) + ' <span class="soon-tag">coming soon</span></span>';
  }
  // Button version of link(), used for the thesis PDFs and code.
  function button(url, label, opt) {
    opt = opt || {};
    if (url === "#") return soon(label, "btn");
    if (!url) return link("", label, opt.where);
    var ext = isExternal(url);
    return '<a class="btn' + (opt.primary ? " primary" : "") + '" href="' + esc(href(url)) + '"' +
      (opt.download && !ext ? " download" : "") + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(label) + "</a>";
  }
  function actions(parts) { parts = parts.filter(Boolean); return parts.length ? '<div class="actions">' + parts.join("") + "</div>" : ""; }
  function slot(text) { if (!DRAFT) return ""; slots++; return '<p><span class="slot">' + esc(text) + "</span></p>"; }
  function linkRow(parts) { parts = parts.filter(Boolean); return parts.length ? '<p class="item-links">' + parts.join("") + "</p>" : ""; }
  function points(items) {
    items = list(items);
    return items.length ? '<ul class="points">' + items.map(function (p) { return "<li>" + rich(p) + "</li>"; }).join("") + "</ul>" : "";
  }
  function tools(items, label) { items = list(items); return items.length ? '<p class="tools"><b>' + (label || "Tools") + ":</b> " + esc(items.join(", ")) + "</p>" : ""; }
  function joinNames(items) { items = list(items); return items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1]; }
  function compact(parts) { return parts.filter(Boolean).map(esc).join(", "); }
  function span(s, e) { return !e || s === e ? esc(s) : esc(s) + " – " + esc(e); }
  function entries(items, whenOf, bodyOf) {
    var hasWhen = items.some(function (it) { return !!whenOf(it); });
    return '<ul class="entries' + (hasWhen ? "" : " no-when") + '">' + items.map(function (it, i) {
      return '<li class="entry"' + (it.title ? ' id="' + slug(it.title) + '"' : "") + '><div class="entry-when">' + esc(whenOf(it) || "") + "</div><div>" + bodyOf(it, i) + "</div></li>";
    }).join("") + "</ul>";
  }
  function pageInfo(id) { return list(S.pages).filter(function (p) { return p.id === id; })[0] || {}; }
  function pageHead(id) {
    var p = pageInfo(id);
    return '<header class="page-head"><h1>' + esc(p.label) + "</h1>" + (p.intro ? '<p class="page-intro">' + rich(p.intro) + "</p>" : "") + "</header>";
  }
  function fileOf(id) { return pageInfo(id).file || "index.html"; }

  /* ---------- Shared pieces ---------- */
  // at: where the item lives in content.js (e.g. "projects[2]"), named by the ?draft placeholders
  function projectCard(p, at, compactCard) {
    var L = p.links || {};
    var meta = compact([p.context, p.when]);
    return '<li class="card" id="' + esc(p.id || slug(p.title)) + '">' +
      (meta ? '<p class="meta">' + meta + "</p>" : "") +
      "<h3>" + esc(p.title) + "</h3>" +
      (p.byline ? '<p class="meta">' + esc(p.byline) + "</p>" : "") +
      '<p class="lede">' + rich(p.summary) + "</p>" + (compactCard ? "" : points(p.points)) + tools(p.tools, p.toolsLabel) +
      linkRow([
        link(L.pdf, p.pdfLabel || "Download PDF", ""),
        p.private ? '<span class="note">Code not public</span>' : link(L.code, "Code on GitHub", at ? at + ".links.code" : ""),
        link(L.slides, "Slides", ""),
        link(L.demo, "Live demo", ""),
        p.related ? a(p.related.href, p.related.label) : ""
      ]) + "</li>";
  }

  // The bachelor thesis and the seminar papers, in the shape of a project so they can share projectCard()
  function bachelorAsProject(B) {
    var L = B.links || {};
    return { id: "bachelor-thesis", title: B.title, context: B.degree, when: B.year, summary: B.summary,
      byline: B.supervisor ? "Supervised by " + B.supervisor : "",
      points: B.points, tools: B.tools, links: { pdf: L.pdf, code: L.code }, pdfLabel: "Thesis (PDF)" };
  }
  function paperAsProject(p) {
    return { title: p.title, context: p.kind, when: p.year, summary: p.summary,
      tools: p.tags, toolsLabel: "Topics", links: p.links, pdfLabel: "Paper (PDF)" };
  }

  // Bachelor thesis in "Selected work" on Home, below the master's thesis
  function bachelorFeature(B) {
    var L = B.links || {};
    return '<article class="feature minor">' +
      '<p class="kicker">Bachelor\'s thesis</p>' +
      "<h3>" + esc(B.title) + "</h3>" +
      '<p class="meta">' + compact([B.degree, B.school, B.year]) + "</p>" +
      (B.summary ? '<p class="lede">' + rich(B.summary) + "</p>" : "") +
      actions([
        button(L.pdf, "Download PDF", { primary: true, download: true, where: "bachelor.links.pdf" }),
        button(L.code, "Code on GitHub", { where: "bachelor.links.code" })
      ]) +
    "</article>";
  }

  function thesisMatrix(T) {
    var sys = list(T.systems);
    var find = function (src, ret) { return sys.filter(function (s) { return s.source === src && s.retrieval === ret; })[0]; };
    var cells = [find("text", "direct"), find("text", "reasoning"), find("kg", "direct"), find("kg", "reasoning")];
    var rowName = { text: "Text passages", kg: "Knowledge graph" };
    var cell = function (s) {
      return '<div class="mx-cell"><p class="mx-tag">' + rowName[s.source] + ", " + (s.retrieval === "direct" ? "direct retrieval" : "LLM reasoning and critique") + "</p>" +
        "<h4>" + esc(s.name) + "</h4><p>" + rich(s.desc) + "</p></div>";
    };
    if (sys.length === 4 && cells.every(Boolean)) {
      return '<div class="matrix"><div class="mx-corner"></div><div class="mx-head">Direct retrieval</div><div class="mx-head">LLM reasoning and critique</div>' +
        '<div class="mx-head">' + rowName.text + "</div>" + cell(cells[0]) + cell(cells[1]) +
        '<div class="mx-head">' + rowName.kg + "</div>" + cell(cells[2]) + cell(cells[3]) + "</div>" +
        '<p class="caption">Four systems built from scratch, varying where the evidence comes from and how it is selected.</p>';
    }
    return '<ul class="entries" style="margin-top:2rem">' + sys.map(function (s) {
      return '<li class="entry"><div class="entry-when">' + esc(s.name) + "</div><div><p style=\"margin:0\">" + rich(s.desc) + "</p></div></li>";
    }).join("") + "</ul>";
  }

  /* ---------- Pages ---------- */
  var R = {};

  R.home = function () {
    var m = S.meta || {};
    var T = S.thesis, TL = (T && T.links) || {}, B = S.bachelor;
    var byTitle = {};
    list(S.projects).forEach(function (p) { byTitle[p.title] = p; });
    var selected = list(S.selected).map(function (t) { return byTitle[t]; }).filter(Boolean);
    var stats = T ? list(T.stats) : [];

    return '<section class="hero">' +
        '<div class="hero-text">' +
          "<h1>" + esc(m.name) + "</h1>" +
          '<p class="statement">' + rich(m.statement) + "</p>" +
          '<ul class="hero-links">' +
            (m.email ? '<li><a class="btn primary" href="mailto:' + esc(m.email) + '">Email me</a></li>' : "") +
            (m.linkedin ? "<li>" + a(m.linkedin, "LinkedIn", "btn") + "</li>" : "") +
            (m.github ? "<li>" + a(m.github, "GitHub", "btn") + "</li>" : "") +
            (m.cv ? '<li><a class="btn" href="' + esc(m.cv) + '" download>CV (PDF)</a></li>' : "") +
          "</ul>" +
        "</div>" +
        (m.photo ? '<figure class="hero-photo"><img src="' + esc(m.photo) + '" alt="Portrait of ' + esc(m.name) + '" width="261" height="360">' +
          (m.tagline ? "<figcaption>" + rich(m.tagline) + "</figcaption>" : "") + "</figure>" : "") +
      "</section>" +

      '<section class="section about">' +
        '<div><h2>About</h2><div class="prose">' + list(S.about).map(function (p) { return "<p>" + rich(p) + "</p>"; }).join("") + "</div></div>" +
        (list(S.facts).length ? '<aside class="facts" aria-label="Quick facts"><dl>' + S.facts.map(function (f) {
          return "<div><dt>" + esc(f.label) + "</dt><dd>" + rich(f.value) + "</dd></div>";
        }).join("") + "</dl></aside>" : "") +
      "</section>" +

      '<section class="section" id="selected-work"><h2>Selected work</h2>' +
        (T ? '<article class="feature tinted">' +
          '<p class="kicker">Master\'s thesis</p>' +
          "<h3>" + esc(T.short || T.title) + "</h3>" +
          '<p class="meta">' + compact([T.degree, T.university, T.year]) + "</p>" +
          '<p class="lede">' + rich(T.summary) + "</p>" +
          (stats.length ? '<ul class="stats">' + stats.map(function (s) { return "<li><strong>" + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></li>"; }).join("") + "</ul>" : "") +
          actions([
            button(TL.pdf, "Download PDF", { primary: true, download: true, where: "thesis.links.pdf" }),
            button(TL.code, "Code on GitHub", { where: "thesis.links.code" }),
            a(fileOf("projects") + "#thesis", "Methods and systems", "text-link")
          ]) +
        "</article>" : "") +
        (B ? bachelorFeature(B) : "") +
        (selected.length ? '<ul class="cards fit">' + selected.map(function (p) { return projectCard(p, null, true); }).join("") + "</ul>" : "") +
        '<p class="see-all">' + a(fileOf("projects"), "See all projects") + "</p>" +
      "</section>" +

      '<section class="section" id="ask">' + askPanel() + "</section>" +

      '<section class="section"><h2>On this site</h2><ul class="directory">' +
        list(S.pages).filter(function (p) { return p.id !== "home" && p.show !== false; }).map(function (p) {
          return "<li>" + a(p.file, p.label) + (p.blurb ? "<p>" + esc(p.blurb) + "</p>" : "") + "</li>";
        }).join("") +
      "</ul></section>";
  };

  function askPanel() {
    return '<div class="ask" aria-labelledby="ask-title">' +
      '<h2 id="ask-title">Ask my CV</h2>' +
      '<p class="ask-desc">Search my projects, papers and experience. Retrieval runs in your browser: it finds matching passages, checks which ones are relevant and answers from those.</p>' +
      '<form class="ask-form" id="ask-form" role="search">' +
        '<label class="visually-hidden" for="q">Question about my work</label>' +
        '<input id="q" name="q" type="search" autocomplete="off" maxlength="200" placeholder="e.g. How did you evaluate your thesis?">' +
        '<button type="submit" id="ask-btn">Search</button>' +
      "</form>" +
      '<ul class="chips" id="chips" aria-label="Example questions"></ul>' +
      '<p class="ai-status" id="ai-status" data-state="idle">Keyword search ready</p>' +
      '<ol class="stages" aria-hidden="true">' +
        '<li id="st1"><strong>1 Retrieve</strong><span id="st1n">–</span></li>' +
        '<li id="st2"><strong>2 Check relevance</strong><span id="st2n">–</span></li>' +
        '<li id="st3"><strong>3 Answer</strong><span id="st3n">–</span></li>' +
      "</ol>" +
      '<div id="results" aria-live="polite"><ol class="cands" id="cands"></ol><div class="answer" id="answer" hidden></div></div>' +
      '<p class="ask-note" id="ask-note"></p>' +
    "</div>";
  }

  R.projects = function () {
    var T = S.thesis, B = S.bachelor, html = pageHead("projects");
    var all = list(S.projects), papers = list(S.papers);
    var groups = [["research", "Research and AI"], ["software", "Software engineering"]];

    // Cards per group. Research and AI also gets the bachelor thesis and, under
    // their own sub-heading, the seminar papers (both written once in content.js).
    var cards = {};
    groups.forEach(function (g) {
      cards[g[0]] = all.filter(function (p) { return (p.category || "research") === g[0]; })
        .map(function (p) { return projectCard(p, "projects[" + all.indexOf(p) + "]"); });
    });
    if (B) cards.research.push(projectCard(bachelorAsProject(B), "bachelor"));
    var seminarCards = papers.map(function (p, i) { return projectCard(paperAsProject(p), "papers[" + i + "]"); });
    var hasGroup = function (g) { return cards[g[0]].length > 0 || (g[0] === "research" && seminarCards.length > 0); };

    html += '<ul class="jump" aria-label="On this page">' + (T ? '<li><a href="#thesis">Master\'s thesis</a></li>' : "") +
      groups.filter(hasGroup).map(function (g) { return '<li><a href="#' + g[0] + '">' + g[1] + "</a></li>"; }).join("") + "</ul>";

    if (T) {
      var rows = list(T.results).filter(function (r) { return r.system; });
      var cols = T.resultColumns || { em: "Exact match", f1: "F1" }, keys = Object.keys(cols);
      var table = rows.length
        ? '<div class="table-wrap"><table class="results"><thead><tr><th scope="col">System</th>' +
          keys.map(function (k) { return '<th scope="col">' + esc(cols[k]) + "</th>"; }).join("") + '<th scope="col">Note</th></tr></thead><tbody>' +
          rows.map(function (r) { return '<tr><th scope="row">' + esc(r.system) + "</th>" + keys.map(function (k) { return '<td class="num">' + esc(r[k]) + "</td>"; }).join("") + "<td>" + esc(r.note || "") + "</td></tr>"; }).join("") +
          "</tbody></table></div>"
        : slot("Results table: add rows in thesis.results");
      var L = T.links || {};
      html += '<article class="feature" id="thesis">' +
        '<p class="kicker">Master\'s thesis</p>' +
        "<h3>" + esc(T.title) + "</h3>" +
        '<p class="meta">' + compact([T.degree, T.university, T.year]) + "</p>" +
        (list(T.supervisors).length ? '<p class="meta">Supervised by ' + esc(joinNames(T.supervisors)) + "</p>" : "") +
        '<p class="lede">' + rich(T.summary) + "</p>" +
        actions([
          button(L.pdf, "Download PDF", { primary: true, download: true, where: "thesis.links.pdf" }),
          button(L.code, "Code on GitHub", { where: "thesis.links.code" }),
          button(L.slides, "Slides")
        ]) +
        thesisMatrix(T) + points(T.points) +
        '<div class="eval"><h4>Evaluation</h4><p>' + rich(T.evaluation) + "</p>" + points(T.evaluationPoints) + table + "</div>" +
        tools(T.tools) +
      "</article>";
    }
    groups.forEach(function (g) {
      if (!hasGroup(g)) return;
      var own = cards[g[0]], sem = g[0] === "research" ? seminarCards : [];
      html += '<section class="section" id="' + g[0] + '"><h2>' + g[1] + "</h2>" +
        (own.length ? '<ul class="cards">' + own.join("") + "</ul>" : "") +
        (sem.length ? '<h3 class="subhead" id="seminar-papers">Seminar papers</h3><ul class="cards">' + sem.join("") + "</ul>" : "") +
        "</section>";
    });
    return html;
  };

  R.seminars = function () {
    return pageHead("seminars") + entries(list(S.papers), function (p) { return p.year; }, function (p, i) {
      var L = p.links || {};
      return "<h3>" + esc(p.title) + "</h3>" + '<p class="meta">' + esc(p.kind || "") + "</p>" +
        '<p class="lede">' + rich(p.summary) + "</p>" + tools(p.tags, "Topics") +
        linkRow([link(L.pdf, "Paper (PDF)", "papers[" + i + "].links.pdf"), link(L.code, "Code on GitHub", ""), link(L.slides, "Slides", "")]);
    });
  };

  function timeline(items, kind) {
    return '<ol class="timeline">' + items.map(function (e) {
      var title = kind === "edu" ? e.degree : e.role;
      var where = kind === "edu" ? compact([e.school, e.place]) + (e.grade ? ". " + esc(e.grade) : "") : compact([e.org, e.place]);
      return '<li><div class="when">' + span(e.start, e.end) + '</div><div class="what"><h3>' + esc(title) + "</h3>" +
        '<p class="meta">' + where + "</p>" +
        (e.summary ? '<p class="lede">' + rich(e.summary) + "</p>" : "") +
        (e.note ? '<p class="lede">' + rich(e.note) + "</p>" : "") +
        points(e.points) + "</div></li>";
    }).join("") + "</ol>";
  }

  R.experience = function () {
    return pageHead("experience") + timeline(list(S.experience), "job") +
      (list(S.education).length ? '<section class="section" id="education"><h2>Education</h2>' + timeline(list(S.education), "edu") + "</section>" : "");
  };

  R.skills = function () {
    var langs = list(S.languages);
    var row = function (label, items) {
      return "<div><dt>" + esc(label) + '</dt><dd><ul class="chips-list">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></dd></div>";
    };
    return pageHead("skills") + '<dl class="skills">' +
      list(S.skills).map(function (g) { return row(g.group, list(g.items)); }).join("") +
      (langs.length ? row("Languages", langs.map(function (l) { return l.name + ": " + l.level; })) : "") +
      "</dl>";
  };

  R.interests = function () {
    var I = S.interests || {};
    var tiles = function (items) {
      return '<ul class="tiles">' + items.map(function (t) { return "<li><h4>" + esc(t.title) + "</h4>" + (t.text ? "<p>" + rich(t.text) + "</p>" : "") + "</li>"; }).join("") + "</ul>";
    };
    var research = list(I.research), personal = list(I.personal);
    return pageHead("interests") +
      (research.length ? "<section><h2>Research interests</h2>" + tiles(research) + "</section>" : "") +
      (personal.length ? '<section class="section"><h2>Outside work</h2>' + tiles(personal) + "</section>"
        : (DRAFT ? '<section class="section"><h2>Outside work</h2>' + slot("Hobbies: add items in interests.personal") + "</section>" : ""));
  };

  R.training = function () {
    return pageHead("training") + entries(list(S.training), function (t) { return t.year; }, function (t) {
      var L = t.links || {};
      return "<h3>" + esc(t.name) + "</h3>" +
        ((t.provider || t.place || t.context) ? '<p class="meta">' + compact([t.provider, t.place, t.context]) + "</p>" : "") +
        (t.summary ? '<p class="lede">' + rich(t.summary) + "</p>" : "") + points(t.points) + tools(t.tools) +
        linkRow([link(L.certificate, "Certificate", "")]);
    });
  };

  R.certifications = function () {
    return pageHead("certifications") + '<ul class="cards">' + list(S.certificates).map(function (c, i) {
      return '<li class="card"><p class="meta">' + compact([c.issuer, c.year]) + "</p><h3>" + esc(c.name) + "</h3>" +
        (c.about ? '<p class="lede">' + rich(c.about) + "</p>" : "") +
        linkRow([link(c.url, "Verify credential", "certificates[" + i + "].url")]) + "</li>";
    }).join("") + "</ul>";
  };

  R["404"] = function () {
    return '<header class="page-head"><h1>Page not found</h1><p class="page-intro">This address doesn\'t exist on the site. Try the ' + a("index.html", "home page") + " or " + a(fileOf("projects"), "projects") + ".</p></header>";
  };

  /* ---------- Menu ---------- */
  function renderNav() {
    $("nav-list").innerHTML = list(S.pages).filter(function (p) { return p.show !== false; }).map(function (p) {
      return '<li><a href="' + esc(href(p.file)) + '"' + (p.id === PAGE ? ' aria-current="page"' : "") + ">" + esc(p.label) + "</a></li>";
    }).join("");
    var brand = document.querySelector(".brand");
    if (brand && S.meta) brand.textContent = S.meta.name;
  }
  var nav = $("site-nav"), btn = $("menu-btn");
  function setMenu(open, focusBtn) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
    else if (focusBtn) btn.focus();
  }
  btn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open"), false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true); });
  document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setMenu(false, false); });
  window.matchMedia("(min-width: 1100px)").addEventListener("change", function () { setMenu(false, false); });

  /* ---------- Footer ---------- */
  function renderFooter() {
    var m = S.meta || {};
    $("footer").innerHTML = '<div class="footer-inner"><span>© ' + new Date().getFullYear() + " " + esc(m.name) + "</span><ul>" +
      (m.email ? '<li><a href="mailto:' + esc(m.email) + '">Email</a></li>' : "") +
      (m.github ? "<li>" + a(m.github, "GitHub") + "</li>" : "") +
      (m.linkedin ? "<li>" + a(m.linkedin, "LinkedIn") + "</li>" : "") +
      (m.cv ? '<li><a href="' + esc(href(m.cv)) + '" download>CV (PDF)</a></li>' : "") + "</ul></div>";
  }

  /* ---------- Go ---------- */
  var main = $("main");
  if (!S) {
    main.insertAdjacentHTML("afterbegin", '<p class="load-error">content.js did not load. This usually means a missing comma or quote in that file. Open the browser console (F12) to see the line number.</p>');
    return;
  }
  try {
    renderNav();
    var body = (R[PAGE] || R.home)();
    main.insertAdjacentHTML("beforeend", (DRAFT ? '<p class="draft-banner" id="draft-banner"></p>' : "") + body);
    if (DRAFT) $("draft-banner").textContent = "Draft view: " + slots + " dashed boxes mark empty fields in content.js on this page. Remove ?draft from the address to see the live version.";
    renderFooter();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  } catch (err) {
    console.error(err);
    main.insertAdjacentHTML("afterbegin", '<p class="load-error">Something in content.js has an unexpected shape: ' + esc(err.message) + ". Check the console (F12) for details.</p>");
  }
})();
