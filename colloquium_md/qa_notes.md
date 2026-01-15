# Q&A preparation notes (BA colloquium)

## Likely questions and answer skeletons

### 1) Why did you not do a tool/model ranking?

- Explicit scope decision (Chapter 1): no ranking, no model comparison, no marketing-style “best tool” claim.
- Same tool setup for all participants (controlled setting): Copilot in VS Code; model configuration fixed.
- Goal is evaluation logic in brownfield, not benchmark performance in greenfield.
- Ranking would require different design: controlled tasks + randomization + comparable exposure + outcome definitions.

### 2) Why a brownfield sandbox instead of greenfield tasks?

- Ecological validity: enterprise work is predominantly brownfield (Chapter 3: Ecological Validity argument).
- Brownfield surfaces real bottlenecks: integration, contracts, hidden dependencies, multi-file navigation.
- Greenfield benchmarks risk overestimating “progress” because integration constraints are absent.
- The pipeline logic is specifically motivated by brownfield measurement problems (Chapter 1).

### 3) What is the single most important contribution of your work?

- A concrete, auditable pipeline outcome model: Attempted vs Implemented_static vs Execution observed.
- Implemented\* as a pragmatic derived level to aggregate inconsistencies between heuristics and tests.
- Full triangulation across versioned artefacts (code, tests, chats, surveys) with repo reproducibility.

### 4) How exactly is “Attempted” detected, and how robust is it?

- Definition: a task is Attempted if explicitly mentioned as goal/next step in the chat export (Chapter 6.2).
- It intentionally does _not_ rely on “files exist” as evidence; it is tied to explicit intent.
- Risk: undercount if participants act without stating it; overcount if they mention but abandon.
- Mitigation: separation from Implemented_static and Execution observed; Attempted alone is never treated as success.

### 5) What does “Execution observed” mean, and what does it _not_ mean?

- Means: the task passes the defined integration/test runs (verified flag), i.e., an observable system signal.
- Does not mean: full functional correctness, completeness, security, or maintainability.
- It is method-bound: depends on the chosen test configuration (Chapter 6.2 + Chapter 7.6).
- Value: creates a defensible boundary against “looks plausible” in chat/code.

### 6) Why do you need the intermediate stage “Implemented_static” at all?

- Tests are expensive to interpret and method-dependent; code-level artefact signals provide a white-box layer.
- Static heuristics capture “structural implementation traces” even when tests don’t cover or don’t pass.
- The observed T3 discrepancy (verified > implemented_static) shows why multiple evidences are needed.
- Implemented_static is explicitly heuristic; it is never framed as ground truth.

### 7) Why no inferential statistics / causal claims?

- Study is designed as descriptive, artefact-based observation (Chapter 4; Chapter 7 scope).
- Small per-group counts; confounders cannot be controlled robustly.
- Competence groups are analysis perspectives (survey heuristic), not validated psychometrics.
- Therefore: report distributions, spans, and co-occurrences only.

### 8) Chat intensity varies a lot—why not use it as an efficiency metric?

- High intensity can indicate exploration, careful review, context mismatch, or being stuck.
- Data shows wide spread in words/cycles and no single reliable mapping to outcome signals.
- Thesis explicitly warns against interpreting chat metrics as performance (Chapter 6.5; Chapter 7.7).
- Without IDE telemetry (tests executed locally, files opened), chat-only efficiency interpretations are unsafe.

### 9) What are the strongest empirical results you would defend?

- Pipeline funnel drop-offs: T4/T5 have 0/18 Execution observed; T2 drops to 4/18.
- Strong separation between “Attempted” and “Execution observed” under timebox + brownfield conditions.
- Competence groups differ in implemented_static distributions, but do not justify a simple ranking.
- Large variance in interaction intensity and technical surrogates reinforces the need for triangulation.

### 10) What would you change in a follow-up study?

- Add process telemetry: file-open events, test runs, branch diffs over time (not only end state).
- Improve/validate heuristics: error taxonomies, more robust implemented_static detectors.
- Expand sample size and/or replicate in a different brownfield codebase.
- Include sensitivity analyses for competence cutoffs/mappings (suggested as future work in thesis).

### 11) Why was the time limit 60 minutes, and how does it affect results?

- It is an intentional stressor to increase heuristic behavior and mimic deadline pressure (Chapter 4).
- It structurally limits task reach (no one goes beyond T5), so analysis focuses on T1–T5.
- It likely amplifies integration bottlenecks (less time for stabilization/validation).
- Therefore, results are explicitly bound to timeboxed conditions.

### 12) Could “Execution observed = 0” be an artefact of your tests?

- Yes, partially possible: Execution observed is method-bound to the configured integration runs.
- Thesis explicitly notes that failing the run can reflect contract mismatch or configuration expectations.
- This is why the work separates evidence levels and uses Implemented\* to aggregate.
- For defensibility: the claim is not “they can’t do it”, but “in this method-bound setting, stable integration was not observed.”

### 13) How do validity threats relate to “Execution observed” being method-bound?

- I treat Execution observed as an operational, test-bound signal — not as “truth” and not as full correctness.
- Threat: construct validity (does the run capture the intended behaviour?) and conclusion validity (over-interpreting 0/verified).
- Mitigation: explicit separation of evidence levels + transparent definition of the run + reporting limitations (Ch. 4 / Ch. 7).
- Defensive phrasing: “observed under this method/configuration”, not “solved/unsolved in general”.

### 14) Why can Implemented_static and verified diverge (e.g., the T3 issue)?

- They measure different things: static heuristics look for artefact traces; verified comes from execution outputs.
- Divergence can happen via heuristic false negatives/positives or via tests covering behaviour without matching the heuristic pattern.
- This is exactly why I introduced multiple evidence levels and the derived Implemented\* for funnel aggregation.
- Defensive takeaway: divergence is a finding about measurement and integration complexity, not a contradiction to “progress”.

### 15) What would change if you had IDE telemetry / process instrumentation?

- It would strengthen process-level interpretation: which files were opened, when tests were run locally, how often context was refreshed.
- It would reduce ambiguity in Attempted vs. silently-implemented actions (chat omissions) and in debugging effort.
- It would enable richer triangulation (process → artefact → execution), but the current thesis intentionally relies on repo-available artefacts.
- Design note: telemetry would still not justify causal claims without a different study design (randomization/control).
