### Slide 1/14 — Titel

- Explorative Untersuchung von AI Coding Agents für Vibe-Coding in der Unternehmenssoftwareentwicklung: Fallstudie BuyIn
- Cihad Gök – Hochschule Bonn-Rhein-Sieg (H-BRS), FB02
- Erstprüfer: Prof. Dr. Peter Becker; Zweitprüfer: Prof. Dr. Hannes Tschofenig
- Datum: <16.01.2026>

Time: ~1.1 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Der detaillierte Auswertungsfahrplan (Triangulation)
Notes:
Guten Tag, ich bin Cihad Gök. Ich stelle heute meine Bachelorarbeit zur explorativen Auswertung eines KI-Assistenzsystems im Vibe-Coding-Kontext vor. Der Fokus liegt bewusst nicht auf „wie gut ist Copilot“ oder auf reinen Produktivitätszahlen, sondern darauf, wie wir in einer realistischeren Brownfield-Umgebung belastbar unterscheiden können zwischen: jemand hat etwas versucht, jemand hat Code produziert, und etwas läuft im Systemkontext tatsächlich durch.

Ich strukturiere den Vortrag entlang meines eigenen Beitrags: (1) Aufbau einer Brownfield-Sandbox als standardisierte Messumgebung, (2) die Pipeline-Logik als Diagnosemodell für Fortschritt und (3) die artefaktbasierte Auswertung inklusive Triangulation über Code-, Ausführungs-, Chat- und Survey-Artefakte. Ich habe diese Gliederung gewählt, weil sie meine methodischen Entscheidungen sichtbar macht – nicht nur die Ergebnisse.

Insgesamt ist der Vortrag auf ~25 Minuten ausgelegt, ich ziele aber auf ~23–24 Minuten Redezeit, damit Übergänge und Fragen Platz haben.

---

### Slide 2/14 — Problem: „Generierter Code“ ist nicht „Fortschritt“

- In Brownfield-Systemen entscheidet Integration, nicht Code-Menge
- Chat-Intention (Plan) kann plausibel wirken, ohne im System zu funktionieren
- Implementierter Code kann existieren, ohne dass er im End-to-End-Kontext „durchläuft“
- Konsequenz: Wir brauchen getrennte Evidenzebenen statt einer Proxy-Metrik

Time: ~1.9 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Das Beispiel „grün im CI ≠ fachlich korrekt“
Notes:
Ausgangspunkt ist eine sehr praktische Beobachtung: In der Diskussion um KI-Assistenzsysteme wird „Fortschritt“ oft am sichtbaren Output festgemacht – viel Code, schnelle Vorschläge, viele Chat-Zyklen. In Enterprise-Softwareentwicklung ist das aber nicht die Engstelle. Gerade im Brownfield ist die zentrale Schwierigkeit, bestehende Verträge, Datenmodelle, Konventionen und Tests nicht zu brechen.

Methodisch heißt das: Intentionen im Chat sind keine Implementation. Und selbst ein Code-Diff ist kein belastbarer Nachweis, dass das gewünschte Verhalten im Systemkontext erreicht wurde. Ich habe deshalb eine Auswertungslogik gebaut, die Plan, Artefakt und beobachtbare Ausführung getrennt abbildet.

Diese Trennung ist auch defensiv relevant, weil sie verhindert, dass wir aus einer einzelnen Kennzahl falsche Schlüsse ziehen – zum Beispiel aus Chat-Intensität auf Effizienz oder aus einem grünen Testsignal auf vollständige fachliche Korrektheit.

---

### Slide 3/14 — Scope & Intent (bewusst eng)

- Kein Tool-/Modell-Ranking, kein Greenfield-Benchmark
- Keine Produktivitätsmessung (keine Zeitersparnis-, Output- oder Speed-Metriken)
- Keine kausalen Effekte / keine inferenzstatistischen Gruppenvergleiche
- Ziel: Auswertungslogik für Vibe-Coding im Brownfield unter Timebox

Time: ~1.7 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Kompetenzgruppen (nur als Perspektive)
Notes:
Ich grenze das bewusst klar ab, weil das typischerweise die erste Rückfrage in Kolloquien ist. Ich habe ein Tool-/Modell-Ranking und Greenfield-Benchmarks bewusst vermieden, weil sie in meinem Setup nicht das Messproblem lösen, sondern es verdecken.

Stattdessen ist es eine artefaktbasierte Beobachtungsstudie in einem kontrollierten Setting: alle Teilnehmenden arbeiten mit derselben Assistenzumgebung in VS Code (GitHub Copilot) und derselben Modellkonfiguration (Claude Sonnet 4.5 als Backend), unter identischem Zeitlimit. Kompetenzgruppen werden als Analyseperspektiven genutzt, nicht als Bewertung von Personen.

Die eigentliche Zielsetzung ist methodisch: Ich entwickle und dokumentiere eine nachvollziehbare Diagnose- und Auswertungslogik, mit der wir Fortschritt in einer Brownfield-Aufgabenserie differenziert abbilden können – ohne Kausalclaims und ohne eine einzelne Proxy-Metrik als „Wahrheit“ zu verkaufen.

---

### Slide 4/14 — Studiensetup (kurz, aber konkret)

- Brownfield Full-Stack-Sandbox (BuyIn Todo): Node/Express + React/Vite, containerisiert
- Laborsetting: Timebox 60 Minuten, standardisiertes Protokoll
- Stichprobe: $N=18$ Teilnehmende; Kompetenzgruppen No-/Low-/Mid-/High-Coder
- Aufgabenserie T1–T8, ausgewertet T1–T5 (Timebox begrenzt Reichweite)
- Artefakte pro Person vollständig: Branch, Chat-Export, Survey (je 18/18)

Figure placeholder: Tabelle 5.1 (Aufgaben-Design) / Tabelle 6.1 (Dateninventar)
Time: ~1.9 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Artefakt-Vollständigkeit (18/18)
Notes:
Die Studie ist als standardisierte Coding-Challenge umgesetzt. Ich habe mich bewusst für eine brownfield-nahe Full-Stack-Sandbox entschieden – also keine leere Codebasis, sondern eine strukturierte Anwendung mit typischen Layern und Abhängigkeiten – weil genau dort Integration und Abgleich die reale Engstelle sind.

Jede Sitzung folgt einem festen Ablauf: Onboarding, Pre-Survey, 60 Minuten Coding-Phase, Datensicherung und Debriefing. Unter der Timebox hat niemand Aufgaben über T5 hinaus bearbeitet; deshalb fokussiere ich die Auswertung auf T1–T5. Für die Triangulation sind Branch-Endstände, Chat-Exports und Survey-Daten vollständig verfügbar (18/18).

Ich habe die 60-Minuten-Timebox gewählt, um typische „unter Druck“-Strategien sichtbar zu machen, ohne daraus Kausalität abzuleiten.

---

### Slide 5/14 — Kernbeitrag: Pipeline-Logik als Diagnosemodell

- Attempted: Task im Chat explizit als Ziel/Schritt formuliert (Intention)
- Implemented_static: heuristische Code-/Struktursignale in Auswertungsartefakten
- Execution observed: testgebundener Statusausweis aus Integrationsläufen (verified)
- Implemented\*: konsistente Evidenzstufe für Trichterdarstellung (Attempted ∧ (Implemented_static ∨ Execution observed))
- Zweck: Trennung von Plan, Artefakt und beobachtbarem Verhalten

Time: ~2.0 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Implemented\* als Aggregationshilfe
Notes:
Mein zentraler konzeptioneller Beitrag ist diese Pipeline-Logik. Ich habe sie eingeführt, weil „viel Output“ in Brownfield kein belastbarer Fortschrittsnachweis ist – entscheidend ist, ob Aufgaben im Systemkontext stabil werden.

Dazu trenne ich drei Evidenzebenen. Erstens „Attempted“: Ein Task gilt als versucht, wenn er im Chat explizit genannt wird – also als Intention oder nächster Schritt. Zweitens „Implemented_static“: Das ist ein White-Box-Artefaktsignal, abgeleitet aus Code-/Strukturheuristiken in den Auswertungsartefakten. Drittens „Execution observed“: Das ist ein Black-Box-Signal, das an protokollierte Ausführungsausgaben gebunden ist, konkret an definierte Integrationsläufe.

Wichtig ist die defensive Lesart: Execution observed bedeutet hier nicht „fachlich vollständig korrekt“, sondern „durchläuft die definierten Integrationsläufe“. Ich habe Implemented\* ergänzt, um Diskrepanzen zwischen heuristischen und testgebundenen Signalen konsistent aggregieren zu können.

---

### Slide 6/14 — Operationalisierung & Evidenz (Triangulation)

- Chat-Artefakte: Task-Mentions, Prompt-Struktur, Debugging-Marker (aus /thesis/chats)
- Code-Artefakte: Branch-Endstände, Strukturindikatoren (z.B. Persistenz-/Featureklassen)
- Ausführungsartefakte: Test-/CI-Ausgänge; Pipeline-Status aus `task_pipeline_v3.json`
- Survey: Kompetenzgruppen + Hürdenkategorien (Mapping auf Branches)
- Reproduzierbarkeit: Auswertungsskripte + Ergebnisartefakte versioniert im Repo

Figure placeholder: Tabelle 5.2 (Zentrale Auswertungsartefakte)
Time: ~1.7 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Survey-Mapping (Kompetenz/Hürden)
Notes:
Hier liegt mein zweiter Beitrag: Ich habe die Pipeline-Stufen so operationalisiert, dass jede Stufe an ein konkretes Artefakt gebunden ist.

Kurz die Triangulation: Chat liefert Intentionssignale (Attempted). Code liefert White-Box-Spuren (Implemented_static). Ausführung liefert ein Black-Box-Signal über definierte Integrationsläufe (Execution observed) – ohne daraus „Korrektheit“ abzuleiten.

Survey nutze ich dabei nur als Kontext (Kompetenz/Hürden), nicht als Bewertung oder Ranking.

Wichtig ist mir die Nachvollziehbarkeit: Die Auswertung ist über versionierte Artefakte und Skripte im Repository reproduzierbar, sodass die Ergebnisse nicht von Einzelinterpretationen abhängen.

Ich habe absichtlich nur diese drei Evidenzarten genutzt, weil sie im Datensatz stabil verfügbar und auditierbar sind.

---

### Slide 7/14 — Ergebnisse I: Pipeline-Funnel (T1–T5)

- Attempted ist breit vorhanden (z.B. T1/T2: 18/18)
- Execution observed fällt stark ab: T1 10/18, T2 4/18
- Integrationsaufgaben brechen: T4/T5 jeweils 0/18 Execution observed
- Diskrepanzen sichtbar: T3 ist 13/18 verified, aber nur 7/18 implemented_static
- Kernaussage: Pipeline-Stufen fallen empirisch auseinander

Figure placeholder: Tabelle 6.2 (Task-Pipeline) / Abbildung 6.1 (Pipeline-Ergebnisse)
Time: ~2.5 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: T3-Diskrepanz (why it matters)
Notes:
Die stärkste Ergebnisfolie ist der Pipeline-Funnel über T1 bis T5. Ich habe diese Darstellung gewählt, weil sie den Unterschied zwischen „versucht“ und „im System bestätigt“ sofort sichtbar macht.

Erstens: Intention ist fast immer da. Für T1 und T2 liegt Attempted in 18 von 18 Branches vor. Auch T4 und T5 werden noch in 13 von 18 Chats als Ziel genannt. Zweitens: Sobald ich die testgebundene Ebene betrachte, bricht es ein. Für T1 erreichen 10 von 18 Branches Execution observed, für T2 nur 4 von 18. Für T4 und T5 ist Execution observed in allen Branches 0.

Das ist genau der Punkt „generierter Code ist nicht Fortschritt“: Unter Brownfield- und Timebox-Bedingungen ist das Erzeugen von Artefakten deutlich leichter als die stabile Integration.

Besonders wichtig ist auch die Diskrepanz bei T3: heuristische Artefaktsignale und testgebundene Statusausweise können auseinanderlaufen. Genau deshalb trenne ich die Evidenzebenen und nutze Implemented\* als konsistente Aggregationslogik.

---

### Slide 8/14 — Ergebnisse II: Kompetenz (als Analyseperspektive, kein Ranking)

- Kompetenzgruppen: No-Code 5/18, Low-Code 4/18, Mid-Code 5/18, High-Coder 4/18
- Implemented_static-Tasks pro Branch: 1–4 (T5 überall 0)
- Vier implemented_static-Tasks treten nur in No-Code (1) und Mid-Code (2) auf
- Low-Code enthält den einzigen Fall mit nur 1 implemented_static-Task
- Für Execution observed ergibt sich kein ausgewiesenes, gruppenstabiles Muster

Figure placeholder: Tabelle 6.3 (Kompetenz vs. implemented_static) / Tabelle 3.1 (Rubrik)
Time: ~1.9 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Die „Nutzungstypen“-Lesart
Notes:
Zum Kompetenzaspekt: Ich nutze Kompetenzgruppen bewusst nur als Analyseperspektive, nicht als Leistungsbewertung. Die Zuordnung basiert auf einer auditierbaren Pre-Survey-Rubrik und ist als pragmatische Heuristik deklariert.

Wenn man die Branches nach der Anzahl als implemented markierter Tasks betrachtet, liegt die Spannweite zwischen 1 und 4. Dabei ist der Befund interessant, aber nicht trivial: Die Kategorie „4 implemented Tasks“ tritt nur in No-Code und Mid-Code auf, nicht bei High-Codern. Umgekehrt liegt der einzige Fall mit nur 1 implemented Task in der Low-Code-Gruppe.

Das klingt zunächst kontraintuitiv, wenn man Kompetenz als lineare Skala versteht. Genau deshalb ist die Arbeit vorsichtig: Ich leite daraus keine Rangordnung ab. In der Diskussion nutze ich das eher als Hinweis auf unterschiedliche Nutzungstypen (z.B. schnelleres Delegieren vs. konservativeres Vorgehen).

Wichtig ist außerdem: Durch den globalen Engpass bei T4/T5 wäre ein „einfaches Ranking“ methodisch fragwürdig. Der Befund passt eher zur Lesart „Kompetenz als Kontext“, nicht zu einer eindimensionalen Erfolgsskala.

---

### Slide 9/14 — Ergebnisse III: Chat-Intensität ≠ Effizienz + Qualitäts-Surrogate

- Chat-Volumen streut stark: 4046–26833 Wörter; 12–45 Prompt-Antwort-Zyklen
- Prompt-Struktur: 56.1% Ein-Satz-Prompts; 13.9% strukturierte Mehrpunkt-Prompts
- Debugging-Marker: 8.7% der Nutzerbeiträge; Iterationssequenzen bis Länge 9
- ESLint: 4/18 Branches mit 0 Fehlern, 14/18 mit 1 Fehler
- TypeScript-Surrogate streuen: anyUsage 2–42; test_pass 0–14, test_fail 9–37

Time: ~1.6 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Lint-/Test-Surrogate (Nebenbefund)
Notes:
Eine naheliegende Frage ist: Kann ich über Chat-Metriken oder einfache Qualitätskennzahlen Fortschritt erklären? Die Daten sprechen dagegen.

Die Interaktionsintensität streut sehr stark (z.B. von ca. 4.000 bis 26.000 Wörtern pro Chat). Ich habe diese Metriken deshalb bewusst nur als Prozessbeschreibung genutzt – nicht als Effizienzmaß: ein langer Chat kann sorgfältigen Abgleich bedeuten oder einfach „stecken bleiben“.

Ich nenne hier bewusst nur die Spannweite; die Detailmetriken stehen in der Thesis, aber für die Aussage reicht „hohe Varianz“.

Für defensible Aussagen verlasse ich mich daher nicht auf Chat-Länge, Lint oder ein einzelnes Testsymptom, sondern auf die Pipeline-Evidenz (Plan → Artefakt → beobachtbare Ausführung) und deren Triangulation.

---

### Slide 10/14 — Diskussion: Integration & Validierung als Engpass

- Mit steigender Kopplung (Schema → API → UI) sinken Implemented\* und Execution observed
- Brownfield erhöht Intrinsic Load: Kontext verstehen, Verträge einhalten, Abweichungen debuggen
- Execution observed ist methodengebunden (Integrationslauf-Konfiguration), kein Qualitätsurteil
- Konsequenz: Bewertung darf nicht auf Chat, Lint oder „ein Testsignal“ reduziert werden

Time: ~2.0 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Cognitive-Load-Einordnung
Notes:
Die Diskussion bündelt das Ergebnis in einem Satz: In diesem Setting ist nicht die Codeproduktion der Flaschenhals, sondern Integration und Validierung. Ich lese das als Brownfield-Diagnose, nicht als Tool-Urteil.

Warum? Ab T3 werden Aufgaben stärker gekoppelt. Es reicht nicht mehr, „irgendeinen Controller“ zu schreiben, sondern man muss Datenmodelle, API-Verträge, Frontend-State und Tests konsistent halten. In einer Brownfield-Umgebung kommt hinzu, dass relevante Kontextteile oft in anderen Dateien liegen und nicht automatisch im Assistenzkontext sind. Damit steigt die kognitive Belastung, insbesondere der Aufwand für semantischen Abgleich und Debugging.

Methodisch wichtig: Execution observed ist eng an die eingesetzten Integrationsläufe gebunden. Das Signal ist hilfreich, weil es beobachtbares Verhalten im Systemkontext repräsentiert. Aber es ersetzt keine vollständige fachliche Abdeckung und ist kein generisches Qualitätsurteil.

Genau deshalb ist die Pipeline-Logik defensiv: Sie verhindert, dass wir eine griffige, aber falsche Geschichte erzählen – etwa „viel Chat = ineffizient“ oder „grün im CI = gelöst“. Stattdessen zwingt sie dazu, Intention, Artefakt und Ausführung getrennt zu betrachten und Abweichungen explizit zu berichten.

---

### Slide 11/14 — Implikationen (Unternehmen & Forschung)

- Unternehmen: KI-Einsatz braucht Prozesshygiene (Review, CI, klare Verträge), nicht nur Tool-Zugang
- Training-Schwerpunkt: Kontextbereitstellung, Abgleichroutinen, Debugging im Systemkontext
- Governance: Risikoaspekte (Security/Compliance) + kontrollierte Nutzung (Artefaktspur)
- Forschung: Brownfield-Designs + mehrstufige Outcome-Logik statt Single-Metric-Benchmarks

Time: ~1.8 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Governance/Security-Aspekt
Notes:
Für Praxis und Forschung ergibt sich eine ähnliche Botschaft: Der Wert eines KI-Assistenzsystems ist keine automatische Eigenschaft des Tools, sondern entsteht durch Einbettung.

Ich leite diese Implikationen bewusst aus den Drop-offs zwischen Artefakt und Ausführung ab.

Für Unternehmen heißt das

erstens: Wenn man KI-Coding einführt, muss man mindestens genauso stark in Review- und Integrationspraktiken investieren wie in den Tool-Rollout. Der Output wird schneller, aber damit steigt die Notwendigkeit, Verträge und Tests konsequent zu nutzen.

Zweitens: Qualifizierung sollte nicht nur „Prompting“ sein, sondern Kontextbereitstellung im Projekt, Lesen/Review und kontrolliertes Debugging. Das ist gerade im Brownfield entscheidend.

Drittens sind Governance-Fragen real: in der Arbeit wird Security/Compliance explizit als relevante Qualitätsperspektive genannt, und Copilot-Risiken werden in der Literatur diskutiert. Das spricht für klare Regeln, welche Artefakte akzeptiert werden, wie geprüft wird und wie Datenflüsse kontrolliert werden.

Für Forschung ergibt sich ein Design-Impuls: Statt Greenfield-Benchmarks mit einer Outcome-Zahl sind brownfield-nahe Aufgabenserien und eine mehrstufige Outcome-Logik sinnvoller, weil sie die reale Engstelle – Integration und Abgleich – überhaupt messbar machen.

---

### Slide 12/14 — Limitationen (was die Studie nicht leistet)

- $N=18$; Gruppen klein → keine belastbaren inferenzstatistischen Vergleiche
- Kompetenzmessung ist heuristisch (Pre-Survey), kein psychometrisches Instrument
- Implemented_static und Chat-Metriken sind regel-/heuristikbasiert (Fehlklassifikationen möglich)
- Keine IDE-Telemetrie (z.B. wie oft Tests lokal liefen, welche Dateien geöffnet waren)
- Execution observed ist an die Test-/Integrationslauf-Konfiguration gebunden

Time: ~1.6 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Kompetenzmessung (Heuristik) im Detail
Notes:
Ich nenne die Limitationen bewusst klar, weil sie die Reichweite der Aussagen definieren. Ich habe die Studie deskriptiv gehalten und vermeide Kausalinterpretationen, weil Design und Stichprobe das nicht seriös hergeben.

Erstens ist die Stichprobe klein. Dadurch sind gruppenspezifische Effekte nur eingeschränkt trennscharf, und es wäre methodisch nicht seriös, hier inferenzstatistisch zu argumentieren. Die Arbeit bleibt deshalb deskriptiv.

Zweitens ist die Kompetenzzuordnung eine pragmatische, auditierbare Heuristik aus Selbstauskunft – kein psychometrisch validiertes Messinstrument. Die Gruppen sind Analyseperspektiven.

Drittens arbeiten einige Metriken regel- und heuristikbasiert: Attempted wird über Chat-Signale operationalisiert, Implemented_static über statische Artefakt-Erkennung. Beides kann fehlklassifizieren. Der Vorteil ist Transparenz und Reproduzierbarkeit, der Nachteil ist begrenzte Sensitivität.

Viertens ist die Prozesssicht unvollständig: Chat-Exports enthalten keine IDE-Aktionen. Ich sehe nicht direkt, wie oft lokal Tests ausgeführt wurden, welche Dateien geöffnet waren oder wie Kontext in der Assistenz bereitgestellt wurde.

Fünftens ist Execution observed methodengebunden: Es ist ein starkes Signal für beobachtbares Verhalten, aber es hängt an den Integrationsläufen und ist nicht identisch mit vollständiger fachlicher Korrektheit.

---

### Slide 13/14 — Fazit: 3 Takeaways + Unique Contribution

- Takeaway 1: Fortschritt muss in Brownfield entlang von Evidenzstufen berichtet werden
- Takeaway 2: Integration/Abgleich sind der wiederkehrende Engpass (nicht Codeproduktion)
- Takeaway 3: Kompetenz wirkt als Nutzungstyp-Kontext, nicht als lineares Erfolgsranking
- Unique Contribution: auditierbare Pipeline-Auswertung + reproduzierbare Brownfield-Sandbox als Messumgebung

Time: ~1.6 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Takeaway 3 (Kompetenz als Kontext)
Notes:
Zum Abschluss drei komprimierte Takeaways.

Ich habe die Takeaways bewusst defensiv formuliert: keine Tool-Rangordnung, nur Evidenz aus Artefakten.

Erstens: Wenn wir KI-Assistenzsysteme im Vibe-Coding evaluieren, brauchen wir eine Outcome-Logik mit getrennten Evidenzstufen. Chat-Intention, Code-Artefakt und beobachtbare Ausführung sind unterschiedliche Ebenen, die empirisch auseinanderfallen können.

Zweitens: In dem untersuchten Brownfield-Setting unter Zeitlimit ist Integration und Abgleich der Engpass. Das zeigt sich daran, dass Attempted und teils Artefaktspuren breit auftreten, während Execution observed bei stärker integrierten Aufgaben ausbleibt. Das ist keine Tool-Beschimpfung, sondern eine Diagnose, wo die reale Arbeit liegt.

Drittens: Kompetenz sollte nicht als Ranking missverstanden werden. Die Daten legen nahe, dass unterschiedliche Kompetenzlagen unterschiedliche Nutzungstypen und Abgleichstrategien plausibel machen – aber sie liefern keine Grundlage für eine einfache, gruppenstabile Leistungsskala.

Mein eigener, einzigartiger Beitrag ist die Kombination aus (a) einer reproduzierbaren Brownfield-Sandbox als Messumgebung und (b) einer auditierbaren Auswertungslogik, die Fortschritt als Pipeline trennt und über Artefakte trianguliert. Damit wird eine defensiv robuste Evaluation möglich, die Marketing-Narrative methodisch abfedert.

---

### Slide 14/14 — Q&A

- Thank you / Fragen
- Fokus: Pipeline-Definitionen, Operationalisierung, Grenzen der Signale
- Optional: Follow-up-Ideen (Telemetrie, robustere Heuristiken)

Time: ~0.4 min
Footer: BA Kolloquium – Cihad Gök
Skip if short on time: Optionaler Mini-Trace eines Pipeline-Falls
Notes:
Vielen Dank für Ihre Aufmerksamkeit. Ich freue mich auf Fragen – insbesondere zu den Definitionen der Pipeline-Stufen, zu den Grenzen von „Execution observed“ und zu den Entscheidungen im Studiendesign.

Wenn hilfreich, kann ich in den Antworten konkret auf die Artefakte im Repository verweisen: Welche JSON-Dateien welche Signale erzeugen, wie die Chat-Signale operationalisiert wurden und warum die Arbeit bewusst keine Tool-Rangordnung und keine Kausalclaims ableitet.

Typische Nachfragen, auf die ich gerne eingehe: (1) Validität – wo könnten Fehlklassifikationen in Attempted/Implemented_static entstehen, und wie begegnet die Triangulation dem? (2) Interpretation der Drop-offs – warum sind T4/T5 im testgebundenen Signal durchgehend 0, und was heißt das für Praxis (Integration/Review/CI) statt für Tool-“Performance”? (3) Follow-up – welche zusätzliche Telemetrie oder Testabdeckung würde das Modell in einer Replikationsstudie stärker machen.

Wenn Sie möchten, kann ich einzelne Pipeline-Fälle als Mini-Trace erläutern: Chat-Intention → konkrete Codeänderung → Ausführungsartefakt. So bleibt die Diskussion nah an den Daten und an meinem methodischen Beitrag.

---

## Design / Layout suggestions (for PPT/Google Slides)

- Use a clean 16:9 layout with generous margins; keep each slide to one claim.
- Fonts: headings 36–44 pt, body 24–28 pt; prefer 1.15–1.25 line spacing for readability.
- Preserve the “3–6 bullets” rule visually: avoid wrapping bullets into 3+ lines.
- Treat the “Figure placeholder:” line as “insert a cropped screenshot of the thesis figure/table”; place it consistently (e.g., right column).
- When showing a figure/table, add one short callout label; don’t read numbers aloud.
- Use consistent color coding for pipeline stages across slides (Attempted / Implemented\* / Execution observed).
- Add a small defensiveness micro-footer on results slides (e.g., “descriptive, method-bound; not correctness”).
- Use progressive disclosure: reveal bullets one-by-one, reveal the figure last.
- Use 1–2 subtle emphasis boxes for your contribution lines (“I chose… because…”) on Slides 4–6.
- For time pressure, visually de-emphasize the “Skip if short on time” line (smaller font, lighter color).
