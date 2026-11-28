# Codebase layer strength — external research notes

Primary sources read on 2026-11-30 through Exa search. Quotes and numbers are
copied from the source pages; the URL is the citation.

## R-code-red — code quality and defects
Tornhill & Borg, "Code Red: The Business Impact of Code Quality", TechDebt 2022.
https://arxiv.org/abs/2203.04374
- 39 proprietary codebases, 30,737 files.
- "low quality code contains 15 times more defects than high quality code."
- "resolving issues in low quality code takes on average 124% more time in development."
- "9 times longer maximum cycle times."

## R-ai-friendly — code health and AI edits
Borg, Hagatulah, Tornhill, Söderberg, "Code for Machines, Not Just Humans", FORGE 2026.
https://dl.acm.org/doi/full/10.1145/3793655.3793722
- 5,000 Python files; LLM refactoring checked by tests.
- Break-rate difference healthy vs unhealthy (Holm-corrected): Qwen −8.58 pp, GPT −11.15 pp,
  GLM −10.16 pp, Gemma −15.12 pp, Granite −9.29 pp (all p < 0.001); Sonnet −2.74 pp (p 0.439),
  Claude agent −1.38 pp (p 0.439).
- Health measured by code smells such as God classes, deeply nested logic, duplicated code.

## R-cycles — dependency cycles
Oyetoyan, Falleri, Dietrich, Jezek, "Circular Dependencies and Change-Proneness: An Empirical Study", SANER 2015.
https://www.researchgate.net/publication/273757421_Circular_Dependencies_and_Change-Proneness_An_Empirical_Study
- "classes in and near cycles have an increased change probability."
- SCC direct neighbourhood: 75% of systems showed significant change proneness.
- Ant: SCCs and direct in-neighbours are 76.3% of classes but 94% of total change volume.

## R-clones — clone types
Svajlenko & Roy, "A Survey on the Evaluation of Clone Detection Performance and Benchmarking".
https://clones.usask.ca/pubfiles/articles/SvajlenkoRoyBenchmarksSurvey.pdf
- Type-1: identical ignoring whitespace, layout, comments.
- Type-2: also ignoring identifier names and literal values; detected by tokenizing and
  replacing each identifier and literal with a common token.
- Type-3: statement-level additions/removals; Type-4: semantic.

## R-cognitive — function-level complexity
G. Ann Campbell, "Cognitive Complexity", SonarSource white paper v1.7, 2023.
https://www.sonarsource.com/docs/CognitiveComplexity.pdf
- Cyclomatic complexity measures test paths, not understandability, and "is of little use
  above the method level"; Cognitive Complexity measures how hard a method is to understand.

## R-dead-code — reachability
Knip documentation, "How Knip works". https://knip.dev/explanations/how-knip-works
- Starts at entry files, follows every import; "a file no entry reaches, an export no file
  imports, a dependency no file uses" is unused. Accuracy depends on known entry points.

## R-data-isolation — module data ownership
M. Jovanović, "Modular Monolith Data Isolation" (secondary source; consistent with
Evans' bounded-context ownership). https://milanjovanovic.tech/blog/modular-monolith-data-isolation
- "Each module can only access its own tables"; "No sharing of tables or objects between
  modules"; "Joins are only allowed between tables of the same module"; other modules use the
  module's public API; enforceable with architecture tests.

## R-localization — agents finding the right code
Chai et al., "RepoNav", arXiv 2609.08355, 2026. https://arxiv.org/pdf/2609.08355
- LocBench, 560 Python instances: "Correct File, Wrong Function accounts for 44–58% of all misses."
- Adding file-structure browsing raised Function Acc@5 0.484 → 0.509, file-centered navigation → 0.557.

## Gaps
- No primary source fixes one universal function-length limit; thresholds proposed in the
  change are policy defaults, overridable only toward stricter values.
- Exa rate limit stopped further searches (Evans primary text, dependency-cruiser docs).
