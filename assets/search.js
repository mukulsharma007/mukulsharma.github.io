/* search.js: "Ask my CV"
   Pipeline:
     1 Retrieve        BM25 keywords + character trigrams (typos) + MiniLM
                       sentence embeddings in the browser (Transformers.js)
     2 Check relevance threshold on the fused score, or an LLM critique when
                       SITE.ai.endpoint points to the Cloudflare Worker
     3 Answer          kept passages, or an LLM answer citing them
   The searchable passages are built automatically from content.js. */
(function () {
  "use strict";

  var S = window.SITE;
  if (!S) return;
  var AI = S.ai || {};
  var TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js";
  var EMBED_MODEL = "onnx-community/all-MiniLM-L6-v2-ONNX";
  var TOP_K = 5, MAX_KEEP = 4;

  /* ---------- 1. Build passages from content.js ---------- */
  function buildCorpus(S) {
    var C = [];
    function list(a) { return (a || []).filter(Boolean); }
    function file(id) { var p = list(S.pages).filter(function (x) { return x.id === id; })[0]; return p ? p.file : "index.html"; }
    function slug(t) { return String(t).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
    function plain(t) { return String(t || "").replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1"); }
    function add(src, href, text, kw) {
      text = plain(text);
      if (text && text.trim()) C.push({ id: "p" + C.length, src: src, href: href, text: text.trim(), kw: kw || "" });
    }

    list(S.about).forEach(function (p) { add("About", "index.html", p, "background profile"); });
    list(S.facts).forEach(function (f) { add("About", "index.html", f.label + ": " + f.value + ".", "facts"); });

    var T = S.thesis, P = file("projects");
    if (T) {
      var k = "thesis master research " + T.title;
      add("Master's thesis", P + "#thesis", T.title + ". " + T.summary, k);
      if (list(T.supervisors).length) add("Master's thesis", P + "#thesis", "My thesis was supervised by " + T.supervisors.join(" and ") + " at " + T.university + ".", k + " supervisor professor");
      list(T.systems).forEach(function (s) { add("Thesis: " + s.name, P + "#thesis", s.name + ": " + s.desc, k + " system systems approach differ difference compare comparison " + s.name); });
      add("Thesis evaluation", P + "#thesis", T.evaluation, k + " evaluation evaluate dataset benchmark results");
      list(T.evaluationPoints).forEach(function (p) { add("Thesis evaluation", P + "#thesis", p, k + " evaluation evaluate experiments setup"); });
      list(T.results).forEach(function (r) {
        if (r.system) add("Thesis results", P + "#thesis", r.system + ": exact match " + (r.em || "n/a") + ", F1 " + (r.f1 || "n/a") + (r.note ? " (" + r.note + ")" : "") + ".", k + " results score evaluation");
      });
      list(T.points).forEach(function (p) { add("Master's thesis", P + "#thesis", p, k); });
    }
    list(S.projects).forEach(function (p) {
      var kw = "project projects " + (p.category || "") + " " + (p.context || "") + " " + list(p.tools).join(" ") + " " + (p.when || "") + " " + p.title;
      var h = P + "#" + slug(p.title);
      add(p.title, h, p.title + ": " + p.summary, kw);
      list(p.points).forEach(function (pt) { add(p.title, h, pt, kw); });
    });
    list(S.papers).forEach(function (p) {
      add(p.title, file("seminars") + "#" + slug(p.title), p.title + ". " + p.summary, "paper papers seminar seminars report " + (p.kind || "") + " " + list(p.tags).join(" "));
    });
    list(S.experience).forEach(function (e) {
      var org = String(e.org || "").split(",")[0];
      var kw = "job work experience " + e.role + " " + e.org + " " + (e.place || "");
      add(org, file("experience"), e.summary, kw);
      list(e.points).forEach(function (pt) { add(org, file("experience"), pt, kw); });
    });
    list(S.education).forEach(function (ed) {
      add(ed.degree, file("experience") + "#education", ed.degree + ", " + ed.school + " (" + ed.start + " to " + ed.end + ")" + (ed.grade ? ". " + ed.grade : "") + "." + (ed.note ? " " + ed.note : ""),
        "education degree study university grade " + ed.degree + " " + ed.school);
    });
    list(S.skills).forEach(function (g) { add("Skills", file("skills"), g.group + ": " + list(g.items).join(", ") + ".", "skills tools " + g.group); });
    if (list(S.languages).length) add("Languages", file("skills"), "Languages: " + S.languages.map(function (l) { return l.name + ", " + l.level; }).join("; ") + ".", "language languages speak");
    var I = S.interests || {};
    list(I.research).concat(list(I.personal)).forEach(function (t) { add("Interests", file("interests"), t.title + ": " + (t.text || ""), "interest interests hobby hobbies"); });
    list(S.training).forEach(function (t) {
      var kw = "training trainings course " + t.name + " " + (t.provider || "") + " " + (t.context || "") + " " + list(t.tools).join(" ");
      add(t.name, file("training"), t.name + (t.provider ? " at " + t.provider : "") + (t.year ? " (" + t.year + ")" : "") + (t.context ? ", " + t.context.toLowerCase() : "") + "." + (t.summary ? " " + t.summary : ""), kw);
      list(t.points).forEach(function (pt) { add(t.name, file("training"), pt, kw); });
    });
    list(S.certificates).forEach(function (c) {
      add("Certifications", file("certifications"), c.issuer + " " + c.name + (c.year ? " (" + c.year + ")" : "") + "." + (c.about ? " " + c.about : ""), "certificate certificates certification certifications certified");
    });
    var B = S.bachelor;
    if (B) {
      var bk = "bachelor thesis b.tech " + B.title;
      add("Bachelor thesis", P + "#bachelor-thesis", "My bachelor thesis: " + B.title + ". " + (B.summary || ""), bk);
      list(B.points).forEach(function (pt) { add("Bachelor thesis", P + "#bachelor-thesis", pt, bk); });
    }
    list(S.extraFacts).forEach(function (f) { add("About", "index.html", f, ""); });
    return C;
  }
  var CORPUS = buildCorpus(S);

  /* ---------- Text processing ---------- */
  var STOP = new Set(("a about all also an and any are as at be been by can could did do does for from give good had has have how i if in into is it its just me more most much my of on or our please show so some tell than that the their them then there these they this to us was we well were what when where which who why will with would you your yours know " +
    String((S.meta && S.meta.name) || "").toLowerCase()).split(/\s+/));

  var SYN = {
    kg: ["knowledge graph"], rag: ["retrieval augmented generation"], reag: ["reasoning augmented generation"],
    gpt: ["llm"], llms: ["llm"], chatbot: ["assistant support"], ai: ["machine learning llm"], ml: ["machine learning"],
    vision: ["opencv yolo ocr"], cloud: ["google cloud platform"], gcp: ["google cloud"], container: ["docker"], containers: ["docker"],
    devops: ["jenkins docker"], ci: ["jenkins"], cd: ["jenkins"], cicd: ["jenkins"], deploy: ["deployed"], deployment: ["deployed"],
    deutsch: ["german"], languages: ["english german speak"], language: ["english german"],
    vector: ["chromadb"], database: ["chromadb vector"], embeddings: ["semantic embedding"],
    masters: ["master"], degree: ["education"], university: ["education"], study: ["education"], studies: ["education"],
    build: ["built"], built: ["build"], detection: ["detect"], cad: ["step 3d geometric"],
    experience: ["job work"], job: ["work"], contact: ["email reach"], email: ["reach"],
    supervisor: ["supervised professor"], supervised: ["supervisor"], professor: ["supervised"],
    nlp: ["natural language processing"], certificate: ["certified"], certificates: ["certified"], certifications: ["certified"],
    location: ["based hannover"], based: ["hannover"], live: ["based hannover"], where: ["based hannover"],
    evaluate: ["evaluation"], evaluated: ["evaluation"], evaluation: ["evaluate"], benchmark: ["evaluation benchmarked"],
    differences: ["difference"], compared: ["compare"], seminars: ["seminar"],
    biology: ["biomedicine single cell"], biomedical: ["biomedicine"], genes: ["single cell rna"],
    servicenow: ["servicenow tickets"], azure: ["entra"], ad: ["active directory"],
    c: ["programming adobe"], android: ["android app"], web: ["javascript html"], frontend: ["javascript vue html"], backend: ["node express"],
    gpu: ["slurm nvidia cluster"], gpus: ["slurm nvidia cluster"], hpc: ["slurm cluster"], cluster: ["slurm"], nvidia: ["gpu"],
    tuning: ["hyperparameter optuna"], tuned: ["hyperparameter optuna"], hyperparameters: ["hyperparameter optuna"],
    metrics: ["ragas evaluation"], "2fa": ["two factor authentication"], mfa: ["two factor authentication"]
  };

  function words(t) {
    return (String(t).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g)) || [];
  }
  var SUF = ["ations", "ation", "ions", "ion", "ings", "ing", "ers", "er", "ed", "es", "als", "al", "e", "s"];
  function stem(w) {
    if (w.length <= 3) return w;
    if (/ies$/.test(w) && w.length > 4) return w.slice(0, -3) + "y";
    for (var i = 0; i < SUF.length; i++) {
      var s = SUF[i];
      if (w.length - s.length >= 4 && w.slice(-s.length) === s) {
        if (s === "s" && /ss$/.test(w)) return w;
        return w.slice(0, -s.length);
      }
    }
    return w;
  }
  function content(ws) { return ws.filter(function (w) { return w.length > 1 && !STOP.has(w); }); }
  function grams(ws) {
    var g = new Set();
    ws.forEach(function (w) { var p = " " + w + " "; for (var i = 0; i < p.length - 2; i++) g.add(p.slice(i, i + 3)); });
    return g;
  }

  /* ---------- BM25 index ---------- */
  var K1 = 1.2, B = 0.75;
  var DOCS = CORPUS.map(function (c) {
    var ws = content(words(c.src + " " + c.text + " " + c.kw));
    var tf = new Map();
    ws.map(stem).forEach(function (t) { tf.set(t, (tf.get(t) || 0) + 1); });
    return { len: ws.length, tf: tf, grams: grams(content(words(c.text + " " + c.kw))) };
  });
  var N = DOCS.length;
  var AVGDL = DOCS.reduce(function (a, d) { return a + d.len; }, 0) / Math.max(N, 1);
  var DF = new Map();
  DOCS.forEach(function (d) { d.tf.forEach(function (_, k) { DF.set(k, (DF.get(k) || 0) + 1); }); });

  function bm25(qt, d) {
    var s = 0;
    qt.forEach(function (t) {
      var f = d.tf.get(t); if (!f) return;
      var n = DF.get(t);
      s += Math.log(1 + (N - n + 0.5) / (n + 0.5)) * (f * (K1 + 1)) / (f + K1 * (1 - B + B * d.len / AVGDL));
    });
    return s;
  }
  function queryTerms(q) {
    var out = [];
    words(q).forEach(function (w) {
      if (SYN[w]) SYN[w].forEach(function (s) { content(words(s)).forEach(function (x) { out.push(stem(x)); }); });
      if (w.length > 1 && !STOP.has(w)) out.push(stem(w));
    });
    return Array.from(new Set(out));
  }

  /* ---------- Semantic model (Transformers.js, runs in the browser) ---------- */
  var SEM = { state: "off", extractor: null, vecs: null, promise: null };
  var saveData = navigator.connection && navigator.connection.saveData;

  function loadSemantic() {
    if (!AI.semantic || saveData || SEM.promise) return SEM.promise;
    SEM.state = "loading";
    setStatus("loading", "Loading the semantic model (about 30 MB, only once)");
    SEM.promise = import(TRANSFORMERS_URL)
      .then(function (mod) { return mod.pipeline("feature-extraction", EMBED_MODEL); })
      .then(function (extractor) {
        SEM.extractor = extractor;
        return extractor(CORPUS.map(function (c) { return c.text; }), { pooling: "mean", normalize: true });
      })
      .then(function (out) {
        SEM.vecs = out.tolist();
        SEM.state = "ready";
        setStatus("ready", "Hybrid search ready: keywords plus a MiniLM embedding model running in your browser");
        if (lastQuery && !busy) run(lastQuery, { animate: false, llm: false });
      })
      .catch(function (err) {
        console.warn("Semantic model unavailable:", err);
        SEM.state = "failed";
        setStatus("idle", "Semantic model unavailable on this device, using keyword search");
      });
    return SEM.promise;
  }
  function embedQuery(q) {
    if (SEM.state !== "ready") return Promise.resolve(null);
    return SEM.extractor(q, { pooling: "mean", normalize: true })
      .then(function (out) { return out.tolist()[0]; })
      .catch(function () { return null; });
  }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

  /* ---------- Hybrid retrieval + threshold relevance check ---------- */
  function retrieve(q, qvec) {
    var qt = queryTerms(q);
    var qg = grams(content(words(q)));
    if (!qt.length && !qg.size && !qvec) return null;
    var rows = CORPUS.map(function (c, i) {
      var d = DOCS[i], hit = 0;
      qg.forEach(function (g) { if (d.grams.has(g)) hit++; });
      return { c: c, bm: bm25(qt, d), tri: qg.size ? hit / qg.size : 0, cos: qvec ? Math.max(0, dot(qvec, SEM.vecs[i])) : 0 };
    });
    var max = function (key) { return Math.max.apply(null, rows.map(function (r) { return r[key]; })); };
    var bmMax = max("bm"), triMax = max("tri"), cosMax = max("cos");
    var useSem = !!qvec && cosMax > 0;
    if (bmMax === 0 && triMax < 0.5 && (!useSem || cosMax < 0.3)) return null;

    rows.forEach(function (r) {
      var b = bmMax ? r.bm / bmMax : 0, t = triMax ? r.tri / triMax : 0, s = useSem ? r.cos / cosMax : 0;
      if (useSem) r.score = bmMax > 0 ? 0.45 * b + 0.15 * t + 0.4 * s : 0.2 * t + 0.8 * s;
      else r.score = bmMax > 0 ? 0.7 * b + 0.3 * t : t;
    });
    rows.sort(function (a, b) { return b.score - a.score; });
    var top = rows.slice(0, TOP_K).filter(function (r) { return r.score > 0; });
    var kept = 0;
    top.forEach(function (r) {
      var ok = r.score >= 0.5 && (r.bm > 0 || r.tri >= 0.6 || r.cos >= 0.35);
      if (ok && kept < MAX_KEEP) { r.keep = true; kept++; }
      else { r.keep = false; r.why = ok ? "not needed" : "weak match"; }
    });
    return { qt: new Set(qt), top: top, kept: kept, semantic: useSem };
  }

  /* ---------- Optional LLM critique + answer (Cloudflare Worker) ---------- */
  function askLLM(question, top) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    return fetch(AI.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        passages: top.map(function (r, i) { return { id: r.c.id, n: i + 1, source: r.c.src, text: r.c.text }; })
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || typeof data.answer !== "string" || !Array.isArray(data.kept)) throw new Error("Unexpected response");
      return data;
    });
  }

  /* ---------- Rendering ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }
  function highlight(text, qt) {
    return text.split(/([A-Za-zÀ-ÿ0-9]+)/).map(function (part, i) {
      if (i % 2 === 0) return esc(part);
      var w = words(part)[0];
      return (w && w.length > 1 && !STOP.has(w) && qt.has(stem(w))) ? "<mark>" + esc(part) + "</mark>" : esc(part);
    }).join("");
  }
  function cite(n, r) { return '<sup><a href="' + r.c.href + '" aria-label="Source ' + n + ": " + esc(r.c.src) + '">[' + n + "]</a></sup>"; }
  function setStatus(state, text) { var el = $("ai-status"); if (el) { el.setAttribute("data-state", state); el.textContent = text; } }
  function setStage(n, on, label) { $("st" + n).setAttribute("data-on", on ? "1" : "0"); $("st" + n + "n").textContent = label; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var runId = 0, lastQuery = "", busy = false;

  function renderCandidates(res) {
    $("cands").innerHTML = res.top.map(function (r) {
      var title = "keyword " + r.bm.toFixed(2) + ", trigram " + r.tri.toFixed(2) + (res.semantic ? ", semantic " + r.cos.toFixed(2) : "");
      return '<li class="cand" data-judged="0" data-keep="' + (r.keep ? 1 : 0) + '">' +
        '<div><div class="cand-top"><span class="cand-src">' + esc(r.c.src) + "</span>" +
        '<span class="bar" aria-hidden="true"><i style="width:' + Math.round(r.score * 100) + '%"></i></span>' +
        '<span class="score" title="' + title + '">' + r.score.toFixed(2) + "</span>" +
        '<span class="verdict"></span></div>' +
        '<div class="cand-text">' + highlight(r.c.text, res.qt) + "</div></div></li>";
    }).join("");
  }
  function judge(res) {
    Array.prototype.forEach.call($("cands").children, function (li, i) {
      var r = res.top[i];
      li.setAttribute("data-keep", r.keep ? "1" : "0");
      li.setAttribute("data-judged", "1");
      li.querySelector(".verdict").textContent = r.keep ? "Kept" : "Dropped: " + r.why;
    });
    setStage(2, true, res.kept + " kept, " + (res.top.length - res.kept) + " dropped");
  }
  function extractiveAnswer(res) {
    var kept = [];
    res.top.forEach(function (r, i) { if (r.keep) kept.push("<li>" + esc(r.c.text) + cite(i + 1, r) + "</li>"); });
    $("answer").innerHTML = kept.length
      ? '<p class="answer-label">Relevant passages</p><ul>' + kept.join("") + "</ul>"
      : "<p>None of the retrieved passages passed the relevance check. Try a more specific question, or email me.</p>";
    $("answer").hidden = false;
    setStage(3, true, res.kept ? "From " + res.kept + " source" + (res.kept > 1 ? "s" : "") : "No answer");
  }
  function llmAnswer(res, data) {
    var keptIds = new Set(data.kept);
    res.top.forEach(function (r) { r.keep = keptIds.has(r.c.id); if (!r.keep) r.why = "filtered by critique"; });
    res.kept = res.top.filter(function (r) { return r.keep; }).length;
    judge(res);
    var html = esc(data.answer).replace(/\[(\d+)\]/g, function (m, n) {
      var r = res.top[Number(n) - 1];
      return r ? cite(Number(n), r) : m;
    });
    $("answer").innerHTML = '<p class="answer-label">Answer generated by an LLM from the passages above</p><p>' + html + "</p>";
    $("answer").hidden = false;
    setStage(3, true, "Generated");
  }

  function run(q, opt) {
    opt = opt || {};
    var id = ++runId;
    lastQuery = q;
    $("answer").hidden = true;
    [1, 2, 3].forEach(function (n) { setStage(n, false, "–"); });

    return embedQuery(q).then(function (qvec) {
      if (id !== runId) return;
      var res = retrieve(q, qvec);
      if (!res || !res.top.length) {
        $("cands").innerHTML = '<li class="empty">Nothing on this site matches that. Try “knowledge graph”, “YOLO” or “Docker”.</li>';
        setStage(1, true, "0 passages");
        return;
      }
      renderCandidates(res);
      var animate = opt.animate && !reduce;
      $("cands").classList.toggle("is-pending", !!animate);
      if (animate) requestAnimationFrame(function () { $("cands").classList.remove("is-pending"); });
      setStage(1, true, res.top.length + " passages" + (res.semantic ? ", hybrid" : ""));

      if (opt.llm && AI.endpoint) {
        busy = true; $("ask-btn").disabled = true;
        setStage(2, false, "Asking the model");
        return askLLM(q, res.top).then(function (data) {
          if (id === runId) llmAnswer(res, data);
        }).catch(function (err) {
          console.warn("LLM step failed:", err);
          if (id !== runId) return;
          judge(res); extractiveAnswer(res);
          $("answer").insertAdjacentHTML("afterbegin", '<p class="answer-src">The AI answer is unavailable right now, so here are the matching passages.</p>');
        }).then(function () { busy = false; $("ask-btn").disabled = false; });
      }
      if (!animate) { judge(res); extractiveAnswer(res); return; }
      setTimeout(function () { if (id === runId) judge(res); }, 450);
      setTimeout(function () { if (id === runId) extractiveAnswer(res); }, 900);
    });
  }

  /* ---------- Wire up ---------- */
  var examples = AI.examples || [];
  $("chips").innerHTML = examples.map(function (e, i) {
    return '<li><button type="button" data-i="' + i + '">' + esc(e.label) + "</button></li>";
  }).join("");
  $("ask-note").textContent = AI.endpoint
    ? "Retrieval combines BM25 keyword scoring, character trigrams and MiniLM sentence embeddings. An LLM then critiques the passages and writes the answer, citing them by number. Generated answers can contain mistakes, so check the cited passages."
    : "Retrieval combines BM25 keyword scoring, character trigrams for typos and, once loaded, MiniLM sentence embeddings. A score threshold stands in for the LLM critique step my real systems use.";
  if (!AI.semantic || saveData) setStatus("idle", "Keyword search ready");
  else setStatus("idle", "Keyword search ready. The semantic model loads when you start searching.");

  function submit(q) {
    q = String(q || "").trim().slice(0, 200);
    if (!q || busy) return;
    loadSemantic();
    run(q, { animate: true, llm: true });
  }
  $("ask-form").addEventListener("submit", function (e) { e.preventDefault(); submit($("q").value); });
  $("chips").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]"); if (!b) return;
    var ex = examples[Number(b.getAttribute("data-i"))];
    $("q").value = ex.q; submit(ex.q);
  });
  $("q").addEventListener("focus", loadSemantic, { once: true });

  // First view: a local-only search (no model download, no LLM call).
  if (examples.length) { $("q").value = examples[0].q; run(examples[0].q, { animate: true, llm: false }); }

  // Exposed for debugging in the console: SITE_SEARCH.corpus, SITE_SEARCH.retrieve("query")
  window.SITE_SEARCH = { corpus: CORPUS, retrieve: function (q) { return retrieve(q, null); } };
})();
