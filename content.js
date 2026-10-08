/* ==========================================================================
   content.js: EVERYTHING ON THE WEBSITE COMES FROM THIS FILE
   --------------------------------------------------------------------------
   Edit text here and every page updates. The "Ask my CV" search on the
   Home page is built from this file too.

   Tips
   - Write links inside text like this: [Leibniz University Hannover](https://www.uni-hannover.de/en/)
   - Empty fields ("") and empty lists ([]) are hidden on the live site.
   - A link set to "#" is shown greyed out and marked "coming soon".
     Replace the "#" with the real address once the PDF or code is online,
     e.g. pdf: "papers/master-thesis.pdf" (put the file in the papers folder).
   - Add ?draft to any page address (e.g. .../projects.html?draft) to see a
     dashed placeholder for every empty link.
   - Lines marked TODO are the ones to check or fill in.
   - If a page goes blank after an edit, a comma or quote is usually
     missing. Press F12 and open the Console to see the line number.
   ========================================================================== */

window.SITE = {

  /* ---------- You ------------------------------------------------------- */
  meta: {
    name: "Mukul Sharma",
    title: "Machine Learning Scientist",
    statement: "Machine learning scientist in Hannover. I build retrieval-augmented generation systems that reason over evidence and show their sources.",
    tagline: "From software engineering at HCL and Adobe to knowledge-graph RAG.",
    location: "Hannover, Germany",
    email: "sharma.mukul290@gmail.com",
    linkedin: "https://www.linkedin.com/in/mukulsharma290",
    github: "https://github.com/mukulsharma007",
    cv: "Mukul_Sharma_CV.pdf",
    photo: "profile.jpg"
  },

  /* ---------- Menu -------------------------------------------------------
     Order here = order in the top menu. Change "label" to rename a page.
     "intro" is the line under the page title. "blurb" appears in the
     "On this site" list on the Home page. Don't change id or file.      */
  pages: [
    { id: "home",           file: "index.html",          label: "Home" },
    { id: "projects",       file: "projects.html",       label: "Projects",
      intro: "Everything I have built, from my master's thesis on knowledge-graph RAG to computer vision research, seminar papers and software projects.",
      blurb: "Master's and bachelor's theses, computer vision, RAG, seminar papers and software projects." },
    { id: "seminars",       file: "seminar-papers.html", label: "Seminar papers",
      intro: "Papers and reports from my master's seminars.",
      blurb: "Two-factor authentication, LLM-based agents, single-cell embeddings and molecular communication." },
    { id: "experience",     file: "experience.html",     label: "Experience",
      intro: "Research and industry roles, most recent first.",
      blurb: "IFW, Adobe and HCL Technologies, plus education." },
    { id: "skills",         file: "skills.html",         label: "Skills",
      intro: "What I work with, grouped by area.",
      blurb: "RAG, LLMs, machine learning, computer vision, cloud and DevOps." },
    { id: "interests",      file: "interests.html",      label: "Interests",
      intro: "The questions I want to keep working on.",
      blurb: "Retrieval, trustworthy LLMs, agents and AI in biomedicine." },
    { id: "training",       file: "trainings.html",      label: "Trainings",
      intro: "Courses and hands-on training outside my degrees.",
      blurb: "Google Cloud, Microsoft 365, Android, full-stack web development, PHP, Java and networking." },
    { id: "certifications", file: "certifications.html", label: "Certifications",
      intro: "Industry certifications in cloud and Microsoft 365.",
      blurb: "Google Cloud and Microsoft certifications." }
  ],

  /* ---------- Home ------------------------------------------------------ */
  about: [
    "I recently finished my M.Sc. in Computer Science at [Leibniz University Hannover](https://www.uni-hannover.de/en/), focusing on machine learning, deep learning and natural language processing. For my thesis I built four retrieval-augmented generation systems from scratch, comparing retrieval over text with retrieval over a knowledge graph, and evaluated them on [HotpotQA](https://hotpotqa.github.io/).",
    "Alongside my studies I worked as a research assistant at the [IFW](https://www.ifw.uni-hannover.de/) in Garbsen, building a computer vision system that takes a technical drawing as a PDF or image and returns it labelled with the detected components, symbols and text.",
    "Before my master's I spent four years in industry: three at [HCL Technologies](https://www.hcltech.com/), building ETL pipelines, ML models and CI/CD workflows and supporting overseas clients, and one at [Adobe](https://www.adobe.com/), writing features in C."
  ],

  // Short facts shown next to "About" on the Home page
  facts: [
    { label: "Currently", value: "Open to roles in LLM and RAG engineering, NLP and applied ML" },
    { label: "Studied", value: "M.Sc. Computer Science, Leibniz University Hannover, 2026 (grade 1.9)" },
    { label: "Focus", value: "Retrieval-augmented generation, knowledge graphs, NLP" },
    { label: "Based in", value: "Hannover, Germany" },
    { label: "Languages", value: "English (C1), German (A2)" }
  ],

  // "Selected work" on Home shows the master's thesis, then the bachelor thesis,
  // then these projects (titles must match the projects list below)
  selected: [
    "Technical drawing analyser",
    "RAG assistant for first-level website support"
  ],

  /* ---------- "Ask my CV" search (Home page) ---------------------------- */
  ai: {
    semantic: true,   // small embedding model in the visitor's browser (about 30 MB, once)
    endpoint: "",     // your Cloudflare Worker URL for LLM answers (see worker/README.md)
    examples: [
      { label: "Thesis systems",  q: "How do your thesis systems differ?" },
      { label: "Evaluation",      q: "How did you evaluate the thesis systems?" },
      { label: "Computer vision", q: "computer vision and OCR experience" },
      { label: "Cloud and DevOps", q: "Docker, CI/CD and cloud deployment" },
      { label: "Seminar papers",  q: "What seminar papers did you write?" },
      { label: "Certifications",  q: "Which certifications do you have?" }
    ]
  },

  /* ---------- Master's thesis (top of the Projects page) ---------------- */
  thesis: {
    title: "Knowledge Graph Retrieval for Reasoning-Augmented Generation in Factual Open-Domain Question Answering",
    short: "Knowledge-graph RAG for open-domain question answering",
    degree: "M.Sc. thesis",
    university: "Leibniz University Hannover",
    year: "2026",
    supervisors: ["Prof. Dr. Wolfgang Nejdl", "Prof. Dr. Nicolas Navarro"],   // TODO: check names and titles

    summary: "Can a language model answer multi-hop factual questions more reliably when it retrieves from a knowledge graph and reasons over what it retrieved? I built four retrieval-augmented systems from scratch to find out. Each system reasons over the retrieved evidence and returns that evidence with its answer, so every answer can be checked.",

    // Key numbers shown on the Home page. TODO: add results, e.g. { value: "0.62", label: "best F1 (KG-ReAG)" }
    stats: [
      { value: "4", label: "RAG systems built from scratch" },
      { value: "2", label: "knowledge sources: text and an LLM-built graph" },
      { value: "HotpotQA", label: "multi-hop QA benchmark" }
    ],

    // source: "text" or "kg"     retrieval: "direct" or "reasoning"
    systems: [
      { name: "RAG", source: "text", retrieval: "direct",
        desc: "Baseline. Splits documents into chunks, stores them in ChromaDB and retrieves them by semantic embedding similarity." },
      { name: "ReAG", source: "text", retrieval: "reasoning",
        desc: "Reasoning-augmented generation. An LLM reads candidate documents and decides which are relevant, instead of relying on embedding similarity." },
      { name: "KG-RAG", source: "kg", retrieval: "direct",
        desc: "An LLM builds a knowledge graph from unstructured text. The graph then serves as the retriever for answer generation." },
      { name: "KG-ReAG", source: "kg", retrieval: "reasoning",
        desc: "Adds a critique step to the knowledge graph retriever. It filters out irrelevant documents and organises the remaining evidence before the LLM answers." }
    ],

    evaluation: "I evaluated all four systems on the HotpotQA dataset, tuned each one to its best settings and then compared them against each other at those settings.",

    // Listed under "Evaluation" on the Projects page
    evaluationPoints: [
      "Evaluated the systems with the [RAGAS](https://docs.ragas.io/) evaluation framework.",
      "Tuned every system and model with hyperparameter optimisation in [Optuna](https://optuna.org/).",
      "Used SLURM to run the large language models and embedding models on a GPU cluster (NVIDIA Pascal, Volta and Ampere), running jobs in parallel."
    ],

    // TODO: add your numbers. The table appears once this list has rows.
    // Example row: { system: "KG-ReAG", em: "0.00", f1: "0.00", note: "best overall" },
    results: [
    ],
    resultColumns: { em: "Exact match", f1: "F1" },

    points: [
      "Implemented the retrieval pipelines myself: query processing, semantic search and vector-database retrieval.",
      "Used an LLM to turn unstructured text into a knowledge graph, then retrieved from that graph.",
      "Researched trustworthy, knowledge-grounded generation: answers come with the evidence they are based on."
    ],
    tools: ["Python", "LLM APIs", "Embedding models", "ChromaDB", "Knowledge graphs", "HotpotQA", "RAGAS", "Optuna", "SLURM", "NVIDIA GPUs"],

    // "#" shows a "coming soon" button. Shown on Home and on the Projects page.
    links: {
      pdf: "#",    // TODO: upload the PDF as papers/master-thesis.pdf, then write "papers/master-thesis.pdf" here
      code: "#",   // TODO: e.g. "https://github.com/mukulsharma007/kg-reag"
      slides: ""
    }
  },

  /* ---------- All projects (Projects page) ------------------------------
     category: "research" (Research and AI) or "software" (Software engineering)
     private: true shows "Code not public"
     links: code (GitHub), pdf and demo. "#" shows "coming soon".
     related: an extra link, e.g. to a seminar paper

     Research and AI also shows two things that are written further down,
     so you only edit them in one place:
     - the bachelor thesis (University recommendation system): see "bachelor"
     - one card per seminar paper: see "papers"                          */
  projects: [
    {
      title: "Technical drawing analyser",
      category: "research", when: "2025–2026", context: "Research assistant, IFW, Leibniz University Hannover",
      summary: "A system that takes a technical drawing as a PDF or image and returns a labelled image with the detected components, symbols and text.",
      points: [
        "OCR-based information extraction and YOLO-based object and symbol detection.",
        "STEP file processing to evaluate geometric 3D product information automatically.",
        "Dataset preparation, structuring and augmentation with OpenCV; training on HPC clusters."
      ],
      tools: ["Python", "YOLO", "OCR", "OpenCV", "STEP", "SLURM"],
      private: true,
      links: { code: "", demo: "" }
    },
    {
      title: "RAG assistant for first-level website support",
      category: "research", when: "Ongoing", context: "Personal project",
      summary: "An assistant that acts as the first point of contact for website visitors, answering their questions from the site's own content.",
      points: [
        "Hybrid retrieval finds the most relevant content for each question.",
        "An LLM critique step filters out irrelevant passages before answer generation.",
        "Chain-of-thought prompting keeps answers clear and grounded in the retrieved context."
      ],
      tools: ["Python", "Hybrid retrieval", "LLM APIs", "Prompt engineering"],
      links: { code: "#", demo: "" }   // TODO: replace "#" with the repository address
    },
    {
      title: "Weather app with a Node.js API",
      category: "software", when: "2019", context: "Training at Vinove",   // TODO: check year
      summary: "A weather application with a Node.js and Express backend and a frontend in HTML, CSS, JavaScript and basic Vue.js, containerised with Docker.",
      points: [],
      tools: ["Node.js", "Express", "Vue.js", "JavaScript", "Docker"],
      links: { code: "", demo: "" }   // TODO
    },
    {
      title: "College canteen app",
      category: "software", when: "", context: "B.Tech. project",   // TODO: year
      summary: "An Android app for the college canteen.",   // TODO: e.g. menu, ordering, payment
      points: [],
      tools: ["Android", "Java"],   // TODO: check
      links: { code: "", pdf: "#", demo: "" }   // TODO: upload the PDF as papers/college-canteen-app.pdf, then write that path in pdf
    },
    {
      title: "Online voting system",
      category: "software", when: "", context: "B.Tech. project",   // TODO: year
      summary: "A web-based voting system written in Java.",   // TODO: features
      points: [],
      tools: ["Java"],
      links: { code: "", demo: "" }   // TODO
    }
  ],

  /* ---------- Seminar papers --------------------------------------------
     Shown on the Seminar papers page and as cards under Research and AI
     on the Projects page. "#" shows "coming soon".
     PDFs: upload to the papers folder, then write the path, e.g.
     pdf: "papers/seminar-two-factor-authentication.pdf"                  */
  papers: [
    {
      title: "Two Factor Authentication Usage: An Analysis of User Preferences in Different Scenarios",
      kind: "Seminar paper, IT Security",
      year: "",   // TODO
      summary: "An analysis of user preferences for two-factor authentication in different scenarios. The seminar ran as a simulation of a real academic conference, from writing the paper to presenting it.",
      tags: ["IT security", "Two-factor authentication", "User preferences"],
      links: { pdf: "#", code: "#", slides: "" }   // TODO: replace "#" with the PDF path and the repository address
    },
    {
      title: "Large Language Models Based Agents",
      kind: "Seminar paper",
      year: "",   // TODO
      summary: "A literature review and report on agentic AI: systems in which language models plan, use tools and act over several steps.",
      tags: ["Agentic AI", "LLM agents", "Literature review"],
      links: { pdf: "#", code: "#", slides: "" }   // TODO: replace "#" with the PDF path and the repository address
    },
    {
      title: "Comparative Evaluation of Zero-Shot Cell Embeddings for PBMC 3k",
      kind: "Seminar paper, AI in Biomedicine",
      year: "",   // TODO
      summary: "Benchmarked three single-cell foundation models, scFoundation, scGPT and Geneformer, on the PBMC 3k single-cell RNA-sequencing dataset in zero-shot and few-shot settings, and wrote a detailed report on the results.",
      tags: ["scGPT", "Geneformer", "scFoundation", "PBMC 3k", "scRNA-seq", "zero-shot", "few-shot"],
      links: { pdf: "#", code: "#", slides: "" }   // TODO: replace "#" with the PDF path and the repository address
    },
    {
      title: "Age of Information in Molecular Communication for Drug Delivery System",
      kind: "Seminar paper",   // TODO: add the seminar name, e.g. "Seminar paper, <seminar>"
      year: "",   // TODO
      summary: "Studied the age of information, a measure of how fresh received information is, in molecular communication for drug delivery systems.",   // TODO: check
      tags: ["Age of information", "Molecular communication", "Drug delivery"],
      links: { pdf: "#", code: "#", slides: "" }   // TODO: replace "#" with the PDF path and the repository address
    }
  ],

  /* ---------- Experience (newest first) --------------------------------- */
  experience: [
    {
      role: "Research assistant (student)",
      org: "IFW, Institute of Production Engineering and Machine Tools, Leibniz University Hannover",
      place: "Garbsen, Germany",
      start: "Mar 2025", end: "Jun 2026",
      summary: "Research on automated recognition and analysis of component information from technical drawings and 3D data.",
      points: [
        "Developed a system that takes a drawing as a PDF or image and returns a labelled image.",
        "Built Python machine learning and computer vision pipelines with OCR-based information extraction and YOLO-based object and symbol detection.",
        "Analysed and processed STEP files to evaluate geometric 3D product information automatically.",
        "Prepared, structured and augmented datasets for machine learning, and trained models on HPC clusters."
      ]
    },
    {
      role: "Software developer",
      org: "Adobe", place: "India",
      start: "Mar 2023", end: "Mar 2024",
      summary: "",
      points: [
        "Designed and implemented small functional features in C for Adobe software."
      ]
    },
    {
      role: "Senior analyst (software)",
      org: "HCL Technologies", place: "India",
      start: "Jan 2020", end: "Feb 2023",
      summary: "Worked with overseas clients including Husqvarna, Mondelez and Wacker.",
      points: [
        "Analysed requirements and supported the software development lifecycle from design through deployment.",
        "Developed software components in Python, JavaScript, HTML and CSS, with testing, debugging, documentation and code review.",
        "Built automated ETL pipelines for data ingestion, cleaning, transformation and preprocessing.",
        "Developed machine learning models for predictive analysis and trend forecasting.",
        "Implemented CI/CD with Git and Jenkins, containerised applications with Docker and deployed them on Google Cloud Platform.",
        "Automated data-processing and deployment workflows to improve efficiency, reliability and maintainability.",
        "Resolved IT support tickets in ServiceNow.",
        "Administered Microsoft Entra ID and Active Directory Domain Services, and supported infrastructure operations.",
        "Managed and troubleshot Microsoft applications."
      ]
    }
  ],

  education: [
    { degree: "M.Sc. Computer Science", school: "Leibniz University Hannover", place: "Germany",
      start: "Apr 2024", end: "Jun 2026", grade: "Final grade 1.9",
      note: "Focus on machine learning, deep learning and NLP. Thesis on knowledge-graph retrieval for reasoning-augmented generation." },
    { degree: "B.Tech. Computer Science", school: "Dr. A.P.J. Abdul Kalam Technical University", place: "India",
      start: "Aug 2015", end: "Oct 2019", grade: "78/100 (about 2.3 on the German scale)",
      note: "Focus on data structures and Python. Thesis: university recommendation system." }
  ],

  /* ---------- Skills ---------------------------------------------------- */
  skills: [
    { group: "RAG and retrieval", items: ["Retrieval-augmented generation", "Reasoning-augmented generation (ReAG)", "Knowledge-graph construction and retrieval", "Hybrid and semantic search", "Document chunking", "LLM-based critique and relevance filtering", "ChromaDB"] },
    { group: "LLMs and evaluation", items: ["LLM API integration", "Prompt engineering", "Chain-of-thought prompting", "Knowledge-grounded generation", "Transformers", "HotpotQA evaluation", "Hyperparameter optimisation"] },
    { group: "Machine learning", items: ["PyTorch", "scikit-learn", "Pandas", "NumPy", "CNNs, RNNs, LSTMs, GANs", "Single-cell foundation models (scGPT, Geneformer, scFoundation)"] },
    { group: "Computer vision", items: ["OCR", "YOLO object detection", "Image segmentation", "OpenCV", "STEP file processing"] },
    { group: "Software engineering", items: ["Python", "Java", "JavaScript", "C", "PHP", "HTML and CSS", "Node.js and Express", "Vue.js", "Android", "Git", "Testing and code review"] },
    { group: "Cloud and DevOps", items: ["Google Cloud Platform", "Docker", "CI/CD with Jenkins", "Linux", "HPC with SLURM", "ETL pipelines"] },
    { group: "IT operations", items: ["ServiceNow", "Microsoft Entra ID", "Active Directory Domain Services", "Microsoft 365 application management", "Troubleshooting"] }
  ],

  languages: [
    { name: "English", level: "Fluent (C1)" },
    { name: "German", level: "Basic (A2)" }
  ],

  /* ---------- Interests ------------------------------------------------- */
  interests: {
    // TODO: check these describe what you want to work on
    research: [
      { title: "Retrieval and knowledge graphs", text: "How structured knowledge can make retrieval more precise and answers easier to verify." },
      { title: "Trustworthy LLMs", text: "Grounding answers in evidence, critiquing retrieved context and reducing hallucinations." },
      { title: "LLM agents", text: "Systems that plan, use tools and act over several steps, the topic of my Agentic AI seminar." },
      { title: "AI in biomedicine", text: "Foundation models for single-cell data, which I benchmarked in a seminar." },
      { title: "Computer vision for engineering", text: "Reading technical drawings and 3D data automatically, as in my work at the IFW." }
    ],
    // TODO: hobbies or interests outside work. Hidden while the list is empty.
    // Example: { title: "Cricket", text: "I play in a local club on weekends." },
    personal: [
    ]
  },

  /* ---------- Trainings ------------------------------------------------- */
  training: [
    { name: "Google Cloud Associate Cloud Engineer", provider: "", place: "", year: "", context: "Certification training",   // TODO: provider, year
      summary: "Deploying, monitoring and operating applications and infrastructure on Google Cloud. Certified in 2022, see [Certifications](certifications.html).",
      points: [], tools: ["Google Cloud Platform"], links: { certificate: "" } },
    { name: "Google Cloud Digital Leader", provider: "", place: "", year: "", context: "Certification training",   // TODO: provider, year
      summary: "Google Cloud products and how cloud technology supports business goals. Certified in 2023, see [Certifications](certifications.html).",
      points: [], tools: ["Google Cloud Platform"], links: { certificate: "" } },
    { name: "Microsoft 365 Fundamentals (MS-900)", provider: "", place: "", year: "", context: "Certification training",   // TODO: provider, year
      summary: "Microsoft 365 services, security, compliance and licensing. Certified in 2022, see [Certifications](certifications.html).",
      points: [], tools: ["Microsoft 365"], links: { certificate: "" } },
    {
      name: "Software development training", provider: "Vinove", place: "India",
      year: "2019",   // TODO: exact months
      summary: "Hands-on training in full-stack web development before joining HCL.",
      points: [
        "Built a weather application with a Node.js and Express API and an HTML, CSS, JavaScript and Vue.js frontend (see Projects).",
        "First hands-on work with containerisation using Docker."
      ],
      tools: ["Node.js", "Express", "Vue.js", "JavaScript", "HTML", "CSS", "Docker"],
      links: { certificate: "" }
    },
    { name: "Android app development", provider: "", place: "", year: "", context: "",   // TODO: provider, year, e.g. context: "During my bachelor's"
      summary: "", points: [], tools: ["Android", "Java"], links: { certificate: "" } },   // TODO: check tools
    { name: "PHP training", provider: "", place: "", year: "", context: "During my bachelor's",   // TODO: provider, year
      summary: "", points: [], tools: ["PHP"], links: { certificate: "" } },
    { name: "Java training", provider: "", place: "", year: "", context: "During my bachelor's",
      summary: "", points: [], tools: ["Java"], links: { certificate: "" } },
    { name: "Networking fundamentals", provider: "", place: "", year: "", context: "During my bachelor's",
      summary: "", points: [], tools: [], links: { certificate: "" } }
  ],

  /* ---------- Certifications -------------------------------------------- */
  // url: link to verify the credential (e.g. Credly)
  certificates: [
    { name: "Associate Cloud Engineer", issuer: "Google Cloud", year: "2022",
      about: "Deploying, monitoring and operating applications and infrastructure on Google Cloud.", url: "" },
    { name: "Cloud Digital Leader", issuer: "Google Cloud", year: "2023",
      about: "Google Cloud products and how cloud technology supports business goals.", url: "" },
    { name: "Microsoft 365 Fundamentals (MS-900)", issuer: "Microsoft", year: "2022",
      about: "Microsoft 365 services, security, compliance and licensing.", url: "" }
  ],

  /* ---------- Bachelor thesis -------------------------------------------
     Shown under "Selected work" on Home (below the master's thesis) and as
     a card under Research and AI on the Projects page.                   */
  bachelor: {
    title: "University recommendation system",
    degree: "B.Tech. thesis",
    school: "Dr. A.P.J. Abdul Kalam Technical University",
    year: "2019",
    supervisor: "",   // TODO (the grade is in "education" above, on the Experience page)
    summary: "A system that recommends universities to students.",   // TODO: 2–3 sentences on what it did and how
    // TODO: what you built, e.g. the data, the recommendation method, results
    points: [
    ],
    tools: ["Python"],   // TODO
    // "#" shows a "coming soon" button
    links: {
      pdf: "#",    // TODO: upload the PDF as papers/bachelor-thesis.pdf, then write "papers/bachelor-thesis.pdf" here
      code: "#"    // TODO: the repository address
    }
  },

  /* ---------- Extra facts for the search only --------------------------- */
  extraFacts: [
    "I'm looking for roles in LLM and RAG engineering, NLP and applied machine learning.",
    "I am based in Hannover, Germany, and the best way to reach me is by email at sharma.mukul290@gmail.com."
  ]
};
