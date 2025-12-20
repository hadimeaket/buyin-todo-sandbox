# Zitier- und Quellen-Audit (read-only)

Erstellt automatisiert; keine Änderungen an Thesis-Quellen.

## Kurzüberblick
- Step 1 (Build/Log): PDF gebaut; keine Citation-Warnungen/Undefined-Citation-Matches im Log-Scan; Biber INFO-only.
- Step 2 (Cite-Inventory): 27 Zitationsstellen, 25 eindeutige Keys.
- Step 3 (Bib-Formalia, cited keys): formale Risiken = 1.
- Step 4 (Coverage heuristics): OK=14, WEAK=13, MISMATCH=0. Missing-citation candidates: HIGH=9, MED=50, LOW=87 (total 146).
- Step 5 (Verdikt, strikt): NOT_OK

---

## Step 1 — Clean build + Logscan (Evidenz)
### main.log Treffer
- Output written: [thesis/main.log](thesis/main.log#L1593) — Output written on main.pdf (69 pages, 608766 bytes).

### main.blg Treffer
- Biber version: [thesis/main.blg](thesis/main.blg#L1) — [0] Config.pm:307> INFO - This is Biber 2.19
- Found citekeys: [thesis/main.blg](thesis/main.blg#L5) — [144] Biber.pm:979> INFO - Found 25 citekeys in bib section 0
- Looking for bib: [thesis/main.blg](thesis/main.blg#L7) — [165] Biber.pm:4610> INFO - Looking for bibtex file 'references.bib' for section 0

### main.bbl Evidenz (Beispiel-Key)
- Entry collins1989cognitive: [thesis/main.bbl](thesis/main.bbl#L166) —     \entry{collins1989cognitive}{incollection}{}

## Step 2 — Cite-key Inventory (alle Zitationsstellen)
- Eindeutige citekeys (25): `anderson1996act`, `barke2023grounded`, `bavarian2022efficient`, `brandtner2024brownfield`, `collins1989cognitive`, `cook1979quasi`, `dreyfus1986mind`, `forsgren2021space`, `green1989cognitive`, `horvitz1999mixed`, `iso25010`, `kahneman2011thinking`, `lave1991situated`, `leesee2004trust`, `mozannar2022reading`, `nadi2022humaicollab`, `parasuraman2010complacency`, `pearce2022asleep`, `peng2023copilot`, `saretsky1972johnhenry`, `sweller1988clt`, `vaithilingam2022codecompletion`, `vaswani2017attention`, `witte2023context`, `wohlin2012experimentation`

### Zitationsstellen
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L16) key=`vaswani2017attention` cmd=\parencite — Technologische Grundlagen: Transformer und In-Context Learning Moderne Assistenzumgebungen wie GitHub Copilot basieren auf der Transformer-…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L17) key=`bavarian2022efficient` cmd=\parencite — Moderne Assistenzumgebungen wie GitHub Copilot basieren auf der Transformer-Architektur [CITE] , mit der Abhängigkeiten in Sequenzen über l…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L23) key=`witte2023context` cmd=\parencite — Damit wird die Notwendigkeit für manuelles Prompt Engineering tendenziell reduziert, zugleich steigt die Abhängigkeit von einer sauberen Pr…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L31) key=`kahneman2011thinking` cmd=\parencite — Dieser Modus lässt sich durch die Dual-Process Theory von Kahneman [CITE] erklären: itemize
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L44) key=`horvitz1999mixed` cmd=\parencite — Theoretische Einordnung in die HCI-Forschung In der Human-Computer Interaction (HCI) lässt sich Vibe-Coding als eine Form der End-User Deve…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L52) key=`dreyfus1986mind` cmd=\parencite — Das Dreyfus-Modell der Expertise Das Dreyfus-Modell der Expertise [CITE] beschreibt den Erwerb von Fähigkeiten in fünf Stufen, von der stri…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L63) key=`anderson1996act` cmd=\textcite — Das Dreyfus-Modell wird oft als zu linear kritisiert.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L73) key=`lave1991situated` cmd=\parencite — Situated Learning und Cognitive Apprenticeship Ergänzend bietet der Ansatz des Situated Learning [CITE] und Cognitive Apprenticeship [CITE]…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L73) key=`collins1989cognitive` cmd=\parencite — Situated Learning und Cognitive Apprenticeship Ergänzend bietet der Ansatz des Situated Learning [CITE] und Cognitive Apprenticeship [CITE]…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L87) key=`parasuraman2010complacency` cmd=\parencite — Automation Bias und Vertrauen Ein zentrales Phänomen ist der Automation Bias [CITE] : Die Tendenz, automatisierten Systemen mehr zu vertrau…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L92) key=`leesee2004trust` cmd=\parencite — itemize Vertrauen (Trust) wird in der Literatur als kalibriert verstanden [CITE] .
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L95) key=`sweller1988clt` cmd=\parencite — Cognitive Load Theory (CLT) Die Cognitive Load Theory [CITE] unterscheidet drei Arten der kognitiven~Belastung: itemize
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L106) key=`horvitz1999mixed` cmd=\parencite — Mixed-Initiative Interaction Die Interaktion mit Copilot lässt sich als Beispiel für Mixed-Initiative Interaction [CITE] einordnen.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L111) key=`barke2023grounded` cmd=\textcite — itemize Grounded Copilot: [CITE] identifizierten zwei Modi der Interaktion: Acceleration (schnelleres Tippen bekannter Logik) und Explorati…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L112) key=`mozannar2022reading` cmd=\textcite — Grounded Copilot: [CITE] identifizierten zwei Modi der Interaktion: Acceleration (schnelleres Tippen bekannter Logik) und Exploration (Nutz…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L121) key=`iso25010` cmd=\parencite — Softwarequalität nach ISO/IEC 25010 Der Standard ISO/IEC 25010 definiert Softwarequalität über acht Hauptmerkmale [CITE] .
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L124) key=`nadi2022humaicollab` cmd=\parencite — Funktionale Eignung: Erfüllt der generierte Code die fachlichen Anforderungen korrekt?
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L125) key=`pearce2022asleep` cmd=\parencite — Wartbarkeit: Ist der Code modular, verständlich und konsistent strukturiert?
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L129) key=`forsgren2021space` cmd=\parencite — Produktivität: Das SPACE-Framework Produktivität in der Softwareentwicklung ist mehrdimensional.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L141) key=`peng2023copilot` cmd=\parencite — Bisherige Studien konzentrierten sich oft auf die technische Leistungsfähigkeit von Modellen oder allgemeine Produktivitätsgewinne [CITE] .
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L10) key=`wohlin2012experimentation` cmd=\citeauthor — auf ihrer Vorkenntnis in disjunkte Gruppen eingeteilt werden.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L10) key=`wohlin2012experimentation` cmd=\citeyear — auf ihrer Vorkenntnis in disjunkte Gruppen eingeteilt werden.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L36) key=`vaithilingam2022codecompletion` cmd=\textcite — textbf Theoretische Begründung: Novizen und Advanced Beginners (Dreyfus Stufe 1--2) fehlt das mentale Modell, um subtile Fehler zu erkennen.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L85) key=`brandtner2024brownfield` cmd=\parencite — Die Wahl einer Brownfield-Umgebung (bestehender Code) statt Greenfield (leeres Blatt) ist essenziell für die ökologische Validität der Stud…
- [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L58) key=`cook1979quasi` cmd=\textcite — Güte der Untersuchung (Threats to Validity) Die Validität der Studie wird anhand der Kategorien von [CITE] diskutiert.
- [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L74) key=`saretsky1972johnhenry` cmd=\parencite — Experimenter Bias (Rosenthal-Effekt): Die Erwartungshaltung des Versuchsleiters könnte die Teilnehmenden beeinflussen.
- [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L19) key=`green1989cognitive` cmd=\parencite — Die Sandbox ist als klassische Full-Stack-Webanwendung konzipiert.

## Step 3 — BibTeX/BibLaTeX Formalia (nur cited keys)
- Formales Risiko (`@incollection` ohne `editor`/`publisher`): key=`collins1989cognitive`
  - Bib-Eintrag: [thesis/references.bib](thesis/references.bib#L173-L179)

## Step 4 — Claim coverage + Missing-citation candidates
### Per-citation Check (heuristisch)
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L16) key=`vaswani2017attention` type=E verdict=OK — Technologische Grundlagen: Transformer und In-Context Learning Moderne Assistenzumgebungen wie GitHub Copilot basieren auf der Transformer-…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L17) key=`bavarian2022efficient` type=C verdict=OK — Moderne Assistenzumgebungen wie GitHub Copilot basieren auf der Transformer-Architektur [CITE] , mit der Abhängigkeiten in Sequenzen über l…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L23) key=`witte2023context` type=E verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Damit wird die Notwendigkeit für manuelles Prompt Engineering tendenziell reduziert, zugleich steigt die Abhängigkeit von einer sauberen Pr…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L31) key=`kahneman2011thinking` type=E verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Dieser Modus lässt sich durch die Dual-Process Theory von Kahneman [CITE] erklären: itemize
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L44) key=`horvitz1999mixed` type=E verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Theoretische Einordnung in die HCI-Forschung In der Human-Computer Interaction (HCI) lässt sich Vibe-Coding als eine Form der End-User Deve…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L52) key=`dreyfus1986mind` type=C verdict=OK — Das Dreyfus-Modell der Expertise Das Dreyfus-Modell der Expertise [CITE] beschreibt den Erwerb von Fähigkeiten in fünf Stufen, von der stri…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L63) key=`anderson1996act` type=C verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Das Dreyfus-Modell wird oft als zu linear kritisiert.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L73) key=`lave1991situated` type=E verdict=OK — Situated Learning und Cognitive Apprenticeship Ergänzend bietet der Ansatz des Situated Learning [CITE] und Cognitive Apprenticeship [CITE]…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L73) key=`collins1989cognitive` type=E verdict=WEAK reasons=FORMAL_BIB_RISK — Situated Learning und Cognitive Apprenticeship Ergänzend bietet der Ansatz des Situated Learning [CITE] und Cognitive Apprenticeship [CITE]…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L87) key=`parasuraman2010complacency` type=D verdict=OK — Automation Bias und Vertrauen Ein zentrales Phänomen ist der Automation Bias [CITE] : Die Tendenz, automatisierten Systemen mehr zu vertrau…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L92) key=`leesee2004trust` type=E verdict=OK — itemize Vertrauen (Trust) wird in der Literatur als kalibriert verstanden [CITE] .
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L95) key=`sweller1988clt` type=E verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Cognitive Load Theory (CLT) Die Cognitive Load Theory [CITE] unterscheidet drei Arten der kognitiven~Belastung: itemize
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L106) key=`horvitz1999mixed` type=E verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Mixed-Initiative Interaction Die Interaktion mit Copilot lässt sich als Beispiel für Mixed-Initiative Interaction [CITE] einordnen.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L111) key=`barke2023grounded` type=B verdict=WEAK reasons=EMPIRICAL_NUMERIC_NO_LOCATOR — itemize Grounded Copilot: [CITE] identifizierten zwei Modi der Interaktion: Acceleration (schnelleres Tippen bekannter Logik) und Explorati…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L112) key=`mozannar2022reading` type=B verdict=WEAK reasons=EMPIRICAL_NUMERIC_NO_LOCATOR — Grounded Copilot: [CITE] identifizierten zwei Modi der Interaktion: Acceleration (schnelleres Tippen bekannter Logik) und Exploration (Nutz…
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L121) key=`iso25010` type=A verdict=OK — Softwarequalität nach ISO/IEC 25010 Der Standard ISO/IEC 25010 definiert Softwarequalität über acht Hauptmerkmale [CITE] .
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L124) key=`nadi2022humaicollab` type=E verdict=OK — Funktionale Eignung: Erfüllt der generierte Code die fachlichen Anforderungen korrekt?
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L125) key=`pearce2022asleep` type=E verdict=OK — Wartbarkeit: Ist der Code modular, verständlich und konsistent strukturiert?
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L129) key=`forsgren2021space` type=C verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — Produktivität: Das SPACE-Framework Produktivität in der Softwareentwicklung ist mehrdimensional.
- [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L141) key=`peng2023copilot` type=B verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE+EMPIRICAL_NUMERIC_NO_LOCATOR — Bisherige Studien konzentrierten sich oft auf die technische Leistungsfähigkeit von Modellen oder allgemeine Produktivitätsgewinne [CITE] .
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L10) key=`wohlin2012experimentation` type=E verdict=OK — auf ihrer Vorkenntnis in disjunkte Gruppen eingeteilt werden.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L10) key=`wohlin2012experimentation` type=E verdict=OK — auf ihrer Vorkenntnis in disjunkte Gruppen eingeteilt werden.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L36) key=`vaithilingam2022codecompletion` type=C verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE — textbf Theoretische Begründung: Novizen und Advanced Beginners (Dreyfus Stufe 1--2) fehlt das mentale Modell, um subtile Fehler zu erkennen.
- [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L85) key=`brandtner2024brownfield` type=E verdict=OK — Die Wahl einer Brownfield-Umgebung (bestehender Code) statt Greenfield (leeres Blatt) ist essenziell für die ökologische Validität der Stud…
- [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L58) key=`cook1979quasi` type=D verdict=OK — Güte der Untersuchung (Threats to Validity) Die Validität der Studie wird anhand der Kategorien von [CITE] diskutiert.
- [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L74) key=`saretsky1972johnhenry` type=B verdict=WEAK reasons=MULTI_CLAIM_PARAGRAPH_SINGLE_CITE+EMPIRICAL_NUMERIC_NO_LOCATOR — Experimenter Bias (Rosenthal-Effekt): Die Erwartungshaltung des Versuchsleiters könnte die Teilnehmenden beeinflussen.
- [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L19) key=`green1989cognitive` type=E verdict=OK — Die Sandbox ist als klassische Full-Stack-Webanwendung konzipiert.

### Missing-citation candidates (heuristisch; ohne Zitation im Absatz)
- HIGH [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L26) why=FORSCHUNGSLUECKE — Problemstellung In der Diskussion um KI-Assistenzsysteme werden häufig Produktivitätsannahmen formuliert, ohne hinreichend zu differenziere…
- HIGH [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L138) why=FORSCHUNGSLUECKE — Zusammenfassung und Forschungslücke sec:related-work
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L38) why=RISIKO_COMPLIANCE — quote Für die deskriptive Einordnung wird betrachtet, wie sich Pipeline-Fortschritt zwischen den Kompetenzgruppen verteilt (operationalisie…
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L53) why=RISIKO_COMPLIANCE — quote Aussagen zu selektiver Nutzung (z.B.
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L68) why=RISIKO_COMPLIANCE — Reduktion von Self-Report-Bias und Plausibilit\"atschecks.
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L72) why=RISIKO_COMPLIANCE — Threats to validity (Kompetenzmessung).
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L92) why=RISIKO_COMPLIANCE — table [ht] 1.25 [1] method=escape,ActualText= #1 [1] unicode,method=pdfstringdef,ActualText= #1 white .
- HIGH [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L109) why=RISIKO_COMPLIANCE — [Auditierbare Scoring-Rubrik zur Kompetenz-Operationalisierung] Auditierbare Scoring-Rubrik zur Kompetenz-Operationalisierung (0--13 Punkte…
- HIGH [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L96) why=RISIKO_COMPLIANCE+MODELL_KONZEPT — Die gewählte Architektur und Methodik spiegelt reale Herausforderungen bei BuyIn wider: itemize Legacy-Integration: Wie bei BuyIn arbeiten …
- MED [thesis/chapters/00_abstract.tex](thesis/chapters/00_abstract.tex#L3) why=MODELL_KONZEPT — Diese Arbeit untersucht ein interaktives KI-Assistenzsystem im Vibe-Coding-Kontext im Rahmen einer standardisierten Coding-Challenge in ein…
- MED [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L4) why=MODELL_KONZEPT — Motivation Große Sprachmodelle (Large Language Models, LLMs) werden zunehmend in der Softwareentwicklung eingesetzt und unterstützen Entwur…
- MED [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L12) why=RISIKO_COMPLIANCE+LITERATURBEZUG+MODELL_KONZEPT — Im Brownfield-Kontext ist diese Entwicklung besonders bedeutsam.
- MED [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L33) why=MODELL_KONZEPT — Sie trifft keine Aussagen über kausale Effekte und leitet keine Rangordnung von Tools oder Modellen ab.
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L4) why=MODELL_KONZEPT — Dieses Kapitel legt das theoretische Fundament für die Untersuchung der Interaktion zwischen menschlicher Kompetenz und KI-Assistenzsysteme…
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L10) why=MODELL_KONZEPT — KI-Assistenzsysteme und das Paradigma des Vibe-Coding sec:definition-agents
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L46) why=MODELL_KONZEPT — Kompetenzmodelle: Vom Dreyfus-Modell zu kognitiven Architekturen sec:competence-models
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L54) why=MODELL_KONZEPT — enumerate Novice (No-Code): Befolgt strikte Regeln, hat kein kontextuelles Verständnis.
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L84) why=MODELL_KONZEPT — Der Erfolg von KI-Assistenzsystemen hängt maßgeblich von der menschlichen Komponente ab.
- MED [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L102) why=LITERATURBEZUG+MODELL_KONZEPT — In der Literatur wird eine potenzielle Senkung von Extraneous Load (z.B.
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L1) why=MODELL_KONZEPT — Forschungsdesign und theoriegeleitete Perspektiven chap:forschungsdesign
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L4) why=MODELL_KONZEPT — Dieses Kapitel leitet das empirische Design der Studie aus den in Kapitel~ chap:hintergrund vorgestellten Theorien ab.
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L20) why=MODELL_KONZEPT — Theoriegeleitete Perspektiven
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L22) why=MODELL_KONZEPT — Die Perspektiven werden direkt aus dem Dreyfus-Modell, der Dual-Process Theory und der Cognitive Load Theory (siehe Abschnitt~ sec:competen…
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L26) why=MODELL_KONZEPT — P1: Der Sweet Spot der KI-Unterstützung (Mid-Code) textbf Theoretische Begründung: Nach der Cognitive Load Theory profitieren Lernende am m…
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L42) why=MODELL_KONZEPT — P3: Skeptizismus und Qualitätsfokus (High-Coder) textbf Theoretische Begründung: Experten (Dreyfus Stufe 4--5) haben starke mentale Modelle…
- MED [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L114) why=RISIKO_COMPLIANCE+MODELL_KONZEPT — table [ht] tabular |l|l|l|> p 6cm | textbf Gruppe & Dreyfus-Level & Score & Charakteristik \\ No-Code & Novice & 0 & Kein mentales Modell v…
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L4) why=MODELL_KONZEPT — Während das vorangegangene Kapitel das Forschungsdesign und theoriegeleitete Perspektiven definiert hat, beschreibt dieses Kapitel den konk…
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L8) why=NONTRIVIAL — Ablauf der Untersuchung Die Untersuchung wurde in einem standardisierten Laborsetting durchgeführt.
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L23) why=MODELL_KONZEPT — Werkzeuge, Konfiguration und Rahmenbedingungen Die Aufgabenbearbeitung erfolgte in Visual Studio Code als Entwicklungsumgebung.
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L32) why=MODELL_KONZEPT — Modellparameter (z.B.
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L39) why=LITERATURBEZUG — In der schriftlichen Ausarbeitung und in der Analyse werden diese Daten ausschließlich anonym behandelt.
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L45) why=MODELL_KONZEPT — Operationalisierung der Metriken Zur Einordnung der theoriegeleiteten Perspektiven wurden die abstrakten Beobachtungsdimensionen (Aufgabenf…
- MED [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L80) why=LITERATURBEZUG — itemize Hawthorne-Effekt: Das Wissen, beobachtet zu werden, verändert das Verhalten.
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L4) why=NONTRIVIAL — Dieses Kapitel dokumentiert die technische Implementierung der BuyIn Todo Sandbox,~die als Plattform für das standardisierte Laborsetting d…
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L10) why=NONTRIVIAL — enumerate Realismus (Brownfield): Die Codebasis ist nicht leer ( Greenfield ), sondern enthält bestehende Strukturen, technische Schulden u…
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L17) why=MODELL_KONZEPT — Architektur und Tech-Stack: Kognitive Dimensionen
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L21) why=MODELL_KONZEPT — Backend: Node.js \& Express (Layered Architecture) Das Backend basiert auf Node.js mit dem Express-Framework und folgt einer strikten Schic…
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L39) why=MODELL_KONZEPT — Prompt Construction und Context Retrieval Copilot sendet nicht nur den Code vor dem Cursor an das Modell.
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L49) why=MODELL_KONZEPT — Token Prediction und Ranking Das Modell generiert mehrere Vorschläge (Beams) und rankt diese nach Wahrscheinlichkeit.
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L80) why=MODELL_KONZEPT — Um die Auswertung der Ergebnisse zu standardisieren, wurde ein Auswertungs-Framework entwickelt.
- MED [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L90) why=LITERATURBEZUG — Grenzen der LLM-gestützten Code-Analyse Zusätzlich zur rein funktionalen Auswertung wird ein LLM-Prompt-Template verwendet, um qualitative …
- MED [thesis/chapters/06_results/06_01_context.tex](thesis/chapters/06_results/06_01_context.tex#L6) why=LITERATURBEZUG+MODELL_KONZEPT — Studiensetting und Rahmenbedingungen Die Studie wurde unter einheitlichen Rahmenbedingungen durchgeführt, um die Vergleichbarkeit der Ergeb…
- MED [thesis/chapters/06_results/06_04_code_quality.tex](thesis/chapters/06_results/06_04_code_quality.tex#L46) why=MODELL_KONZEPT — Architektur- und Strukturindikatoren sec:results_quality_architecture
- MED [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L17) why=MODELL_KONZEPT — textbf Messdefinition.
- MED [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L63) why=MODELL_KONZEPT — Beobachtete Antwortmuster in den Modellantworten (Claude Sonnet 4.5) sec:results_chat_model_patterns
- MED [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L66) why=MODELL_KONZEPT — Messdefinition.
- MED [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L69) why=MODELL_KONZEPT — Ergebnis.
- MED [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L72) why=MODELL_KONZEPT — Tooling-/Aktionsformulierungen (operationalisiert über Marker wie Ran terminal command oder Replace String in File ) treten in 41 von 335 M…
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L39) why=RISIKO_COMPLIANCE+LITERATURBEZUG+MODELL_KONZEPT — Group comparability \& confounders.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L70) why=MODELL_KONZEPT — R\"uckbindung an theoriegeleitete Perspektiven sec:discussion_perspectives
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L87) why=NONTRIVIAL — textbf Finale Einordnung.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L278) why=MODELL_KONZEPT — Die Studie ist in ihrer Aussagekraft durch mehrere Faktoren begrenzt.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L284) why=MODELL_KONZEPT — F\"unftens sind die Ergebnisse an den konkreten Erhebungszeitraum gebunden.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L328) why=RISIKO_COMPLIANCE+LITERATURBEZUG+MODELL_KONZEPT — Group comparability \& confounders.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L565) why=MODELL_KONZEPT — Die Studie ist in ihrer Aussagekraft durch mehrere Faktoren begrenzt.
- MED [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L571) why=MODELL_KONZEPT — Aus diesen Limitationen ergeben sich unmittelbare Ansatzpunkte für weitere Forschung.
- MED [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L4) why=LITERATURBEZUG+MODELL_KONZEPT — Ziel und Einordnung des Kapitels Kapitel 8 schließt die Arbeit ab, indem die in Kapitel 6 berichteten Ergebnisse zusammengeführt und die in…
- MED [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L7) why=LITERATURBEZUG+MODELL_KONZEPT — Übergeordnetes Ziel der Arbeit war die Auswertung eines interaktiven KI-Assistenzsystems.
- MED [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L64) why=LITERATURBEZUG — Einordnung im BuyIn-Kontext Die folgende Einordnung wird ausschließlich aus den in Kapitel 6 berichteten Mustern und der Einordnung in Kapi…
- LOW [thesis/chapters/00_abstract.tex](thesis/chapters/00_abstract.tex#L5) why=NONTRIVIAL — Methodisch basiert die Studie auf einer standardisierten Coding-Challenge mit $N = 18$ Teilnehmenden, einer Timebox von 60 Minuten und eine…
- LOW [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L47) why=MODELL_KONZEPT — Zielsetzung der Arbeit Ziel dieser Arbeit ist die Auswertung eines KI-Assistenzsystems im Vibe-Coding-Kontext in einer kontrollierten Brown…
- LOW [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L68) why=MODELL_KONZEPT — Forschungsfragen.
- LOW [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L79) why=MODELL_KONZEPT — Aufbau der Arbeit Kapitel~2 führt die theoretischen Grundlagen ein und ordnet Vibe-Coding als Arbeitsstil in relevante Perspektiven ein, da…
- LOW [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L84) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~5 dokumentiert die technische Brownfield-Sandbox, ihre Architektur und die Automatisierungs- und Auswertungsinfrastruktur, die eine…
- LOW [thesis/chapters/01_einleitung.tex](thesis/chapters/01_einleitung.tex#L89) why=MODELL_KONZEPT — Abgrenzung und wissenschaftlicher Beitrag.
- LOW [thesis/chapters/02_hintergrund.tex](thesis/chapters/02_hintergrund.tex#L79) why=MODELL_KONZEPT — Die in diesem Theorieblock dargestellten Modelle (u.\,a.
- LOW [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L57) why=LITERATURBEZUG+MODELL_KONZEPT — Die Perspektiven werden in dieser Arbeit theoriegeleitet formuliert und im Sinne einer explorativen Strukturierung der Ergebnisdiskussion v…
- LOW [thesis/chapters/03_forschungsdesign.tex](thesis/chapters/03_forschungsdesign.tex#L61) why=MODELL_KONZEPT — Die Kompetenzgruppen (No-Code/Low-Code/Mid-Code/High-Coder) werden in dieser Arbeit ausschlie lich als Analyseperspektiven verwendet (Strat…
- LOW [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L6) why=NONTRIVIAL — Die in dieser Arbeit verwendete Bezeichnung eines kontrollierten Vorgehens bezieht sich auf die Standardisierung des Ablaufs und der Rahmen…
- LOW [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L51) why=LITERATURBEZUG — Code- und Ausführungsartefakte (Surrogatindikatoren) Zur Einordnung der Umsetzungsstände werden zusätzlich struktur- und ausführungsnahe Ar…
- LOW [thesis/chapters/04_methodik.tex](thesis/chapters/04_methodik.tex#L100) why=LITERATURBEZUG — enumerate Deskriptive Quantifizierung: Pipeline-Status (Attempted, Implemented static und Execution observed; sowie Implemented$^ $ für die…
- LOW [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L56) why=NONTRIVIAL — table [ht] 3pt tabular |p 0.08 |> p 0.28 |> p 0.58 | Task & Beschreibung & Kognitive Anforderung \\ 1 & Persistenz (JSON) & Verstehen des R…
- LOW [thesis/chapters/05_implementierung.tex](thesis/chapters/05_implementierung.tex#L107) why=LITERATURBEZUG — Reproduzierbarkeit / Artefaktzugang Die in dieser Arbeit berichteten quantitativen Ergebnisse (Ausführungsläufe, Linting und daraus abgelei…
- LOW [thesis/chapters/06_results/06_01_context.tex](thesis/chapters/06_results/06_01_context.tex#L72) why=NONTRIVIAL — itemize Statische Code-Analyse: Einsatz von ESLint zur Analyse der Code-Qualität und Einhaltung von Standards.
- LOW [thesis/chapters/06_results/06_02_pipeline.tex](thesis/chapters/06_results/06_02_pipeline.tex#L4) why=LITERATURBEZUG — In diesem Abschnitt wird der Fortschritt der Probanden entlang der Aufgaben-Pipeline (T1--T5) dargestellt.
- LOW [thesis/chapters/06_results/06_02_pipeline.tex](thesis/chapters/06_results/06_02_pipeline.tex#L17) why=MODELL_KONZEPT — Abgeleitete Evidenzstufe.
- LOW [thesis/chapters/06_results/06_02_pipeline.tex](thesis/chapters/06_results/06_02_pipeline.tex#L54) why=LITERATURBEZUG — Messung.
- LOW [thesis/chapters/06_results/06_02_pipeline.tex](thesis/chapters/06_results/06_02_pipeline.tex#L128) why=LITERATURBEZUG — Messung.
- LOW [thesis/chapters/06_results/06_03_strategies.tex](thesis/chapters/06_results/06_03_strategies.tex#L39) why=MODELL_KONZEPT — T3 -- Kategorien enumerate Ziel des Tasks (kurz, technisch).
- LOW [thesis/chapters/06_results/06_03_strategies.tex](thesis/chapters/06_results/06_03_strategies.tex#L47) why=MODELL_KONZEPT — Beobachtete Implementationsmuster.
- LOW [thesis/chapters/06_results/06_03_strategies.tex](thesis/chapters/06_results/06_03_strategies.tex#L74) why=MODELL_KONZEPT — Beobachtete Implementationsmuster.
- LOW [thesis/chapters/06_results/06_04_code_quality.tex](thesis/chapters/06_results/06_04_code_quality.tex#L23) why=LITERATURBEZUG — Als Surrogat für Typisierungsstrenge und potenziellen ``Escape'' aus dem Typsystem wird die Nutzung von any ausgewiesen ( anyUsage in evalu…
- LOW [thesis/chapters/06_results/06_04_code_quality.tex](thesis/chapters/06_results/06_04_code_quality.tex#L71) why=MODELL_KONZEPT — itemize ESLint: 4/18 Branches ohne ESLint-Fehler, 14/18 mit genau einem Fehler (keine Regelkategorien verfügbar).
- LOW [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L4) why=LITERATURBEZUG — Dieses Unterkapitel beschreibt beobachtbare Muster der Interaktion zwischen den Teilnehmenden (Teilnehmer A--R) und dem im Experiment einge…
- LOW [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L57) why=LITERATURBEZUG — Messdefinition.
- LOW [thesis/chapters/06_results/06_05_chat_patterns.tex](thesis/chapters/06_results/06_05_chat_patterns.tex#L85) why=MODELL_KONZEPT — Dieses Unterkapitel beschreibt ausschließlich beobachtbare Interaktionsmuster und deren Messwerte.
- LOW [thesis/chapters/06_results/06_06_triangulation.tex](thesis/chapters/06_results/06_06_triangulation.tex#L4) why=LITERATURBEZUG — Dieses Unterkapitel stellt die in Abschnitt~6.2 bis 6.5 berichteten Ergebnisse sowie Survey-Merkmale nebeneinander.
- LOW [thesis/chapters/06_results/06_06_triangulation.tex](thesis/chapters/06_results/06_06_triangulation.tex#L12) why=LITERATURBEZUG — sloppypar Messdefinition.
- LOW [thesis/chapters/06_results/06_06_triangulation.tex](thesis/chapters/06_results/06_06_triangulation.tex#L30) why=LITERATURBEZUG — sloppypar Messdefinition.
- LOW [thesis/chapters/06_results/06_06_triangulation.tex](thesis/chapters/06_results/06_06_triangulation.tex#L64) why=LITERATURBEZUG — Messdefinition.
- LOW [thesis/chapters/06_results/06_06_triangulation.tex](thesis/chapters/06_results/06_06_triangulation.tex#L69) why=LITERATURBEZUG — Ergebnis.
- LOW [thesis/chapters/06_results/06_07_summary.tex](thesis/chapters/06_results/06_07_summary.tex#L8) why=LITERATURBEZUG — Pipeline-Ergebnisse entlang der Tasks (T1--T5).
- LOW [thesis/chapters/06_results/06_07_summary.tex](thesis/chapters/06_results/06_07_summary.tex#L19) why=LITERATURBEZUG — Technische Qualität (aggregiert, ohne Kausalannahmen).
- LOW [thesis/chapters/06_results/06_07_summary.tex](thesis/chapters/06_results/06_07_summary.tex#L26) why=LITERATURBEZUG — Chat-Interaktionsmuster (kompakt).
- LOW [thesis/chapters/06_results/06_07_summary.tex](thesis/chapters/06_results/06_07_summary.tex#L32) why=LITERATURBEZUG — Triangulation auf Meta-Ebene.
- LOW [thesis/chapters/06_results/06_07_summary.tex](thesis/chapters/06_results/06_07_summary.tex#L39) why=LITERATURBEZUG — Abgrenzung zu Kapitel~7.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L18) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 hat die Ergebnisse ausschlie lich deskriptiv berichtet; Kapitel~7 ordnet diese Befunde im Licht des in Kapitel~2 eingef\"uhrten t…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L24) why=LITERATURBEZUG — Methodischer Rahmen (Kausalit\"at, Gruppenvergleiche).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L29) why=LITERATURBEZUG — Geltungsbereich der Ergebnisse.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L50) why=LITERATURBEZUG — textbf Begr\"undung (Befunde).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L57) why=LITERATURBEZUG — textbf Begr\"undung (Befunde).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L68) why=MODELL_KONZEPT — Zur begrifflichen Trennung wird -- wie in Kapitel~1 eingef\"uhrt -- zwischen Assistenzumgebung (Tool), Modell (LLM) und KI-Assistenzsystem …
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L73) why=LITERATURBEZUG+MODELL_KONZEPT — Die Perspektiven wurden im Forschungsdesign als theoriegeleitete Deutungsfolien formuliert, wie Kompetenz und Arbeitsmodus mit dem KI-Assis…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L85) why=LITERATURBEZUG — textbf St\"arkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L96) why=LITERATURBEZUG — textbf St\"arkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L107) why=LITERATURBEZUG — textbf St\"arkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L114) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 berichtet, dass Branches sich nicht nur im Umsetzungsstand unterscheiden, sondern auch in der Art der Interaktion, in der Struktu…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L124) why=MODELL_KONZEPT — Die Befunde aus Kapitel~6 werden so gelesen, dass im vorliegenden Setting der Zugang zu umsetzungsnahen Artefakten in den beobachteten Durc…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L134) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 berichtet, dass Low-Code sichtbare Implementationsartefakte erzeugt, w\"ahrend Execution observed bei st\"arker integrierten Aufg…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L144) why=LITERATURBEZUG — Kapitel~6 berichtet, dass bei Mid-Code sowohl Umsetzungsartefakte als auch Iterationen der Nachjustierung und des Abgleichs beobachtbar sin…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L154) why=LITERATURBEZUG — Kapitel~6 berichtet, dass unter Zeitlimit bei anspruchsvollen Integrationsaufgaben Execution observed nicht durchg\"angig ausgewiesen wird.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L176) why=MODELL_KONZEPT — Die beobachtete Differenz zwischen Attempted und Implemented static ist plausibel als Integrationsph\"anomen einzuordnen.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L196) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 berichtet f\"ur bestimmte Integrationsaufgaben, dass Execution observed ausbleibt.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L207) why=NONTRIVIAL — Die Chat-Ergebnisse aus Kapitel~6 zeigen starke Variation der Interaktionsintensit\"at und wiederkehrende Muster von Debugging-Sequenzen.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L224) why=LITERATURBEZUG — Kapitel~6 berichtet Debugging-Iterationen als wiederkehrendes Strukturmerkmal.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L234) why=LITERATURBEZUG — Kapitel~2 unterscheidet Interaktionsmodi wie Exploration und Beschleunigung.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L244) why=LITERATURBEZUG — Die folgenden Abschnitte fassen Einordnungen zusammen, die an die in Kapitel~6 berichteten Befunde anschlie en.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L259) why=LITERATURBEZUG — Kapitel~6 berichtet, dass einzelne Signale wie Ausf\"uhrungsausg\"ange, Linting oder Interaktionsintensit\"at isoliert schwer interpretierb…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L268) why=LITERATURBEZUG — In der \"offentlichen Darstellung werden h\"aufig generische Produktivit\"atsgewinne hervorgehoben.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L307) why=LITERATURBEZUG — Kapitel~6 hat die Ergebnisse ausschließlich deskriptiv berichtet; Kapitel~7 ordnet diese Befunde im Licht des in Kapitel~2 eingeführten the…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L313) why=LITERATURBEZUG — Methodischer Rahmen (Kausalität, Gruppenvergleiche).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L318) why=LITERATURBEZUG — Geltungsbereich der Ergebnisse.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L336) why=LITERATURBEZUG — RQ1: Kompetenz und Pipeline-Status textbf Antwortsatz (gewichtet).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L345) why=LITERATURBEZUG — textbf Begründung (Befunde).
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L356) why=MODELL_KONZEPT — Zur begrifflichen Trennung wird -- wie in Kapitel~1 eingeführt -- zwischen Assistenzumgebung (Tool), Modell (LLM) und KI-Assistenzsystem al…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L361) why=LITERATURBEZUG — Die Hypothesen wurden im Forschungsdesign als Erwartung darüber formuliert, wie Kompetenz und Arbeitsmodus mit dem KI-Assistenzsystem zusam…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L373) why=LITERATURBEZUG — textbf Stärkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L384) why=LITERATURBEZUG — textbf Stärkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L395) why=LITERATURBEZUG — textbf Stärkstes Contra-Argument.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L402) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 berichtet, dass Branches sich nicht nur im Umsetzungsstand unterscheiden, sondern auch in der Art der Interaktion, in der Struktu…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L412) why=MODELL_KONZEPT — Die Befunde aus Kapitel~6 legen nahe, dass für No-Code der Zugang zu umsetzungsnahen Artefakten erleichtert werden kann.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L422) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 legt nahe, dass Low-Code sichtbare Implementationsartefakte erzeugt, während testgebundene Bestätigung bei stärker integrierten A…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L432) why=LITERATURBEZUG — Kapitel~6 berichtet, dass bei Mid-Code sowohl Umsetzungsartefakte als auch Iterationen der Nachjustierung und Validierung beobachtbar sind.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L442) why=LITERATURBEZUG — Kapitel~6 berichtet, dass unter Zeitlimit bei anspruchsvollen Integrationsaufgaben testgebundene Bestätigung nicht durchgängig erreicht wir…
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L464) why=MODELL_KONZEPT — Die beobachtete Differenz zwischen Attempted und Implemented static ist plausibel als Integrationsphänomen einzuordnen.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L484) why=LITERATURBEZUG+MODELL_KONZEPT — Kapitel~6 berichtet für bestimmte Integrationsaufgaben, dass testbasierte Bestätigung ausbleibt.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L495) why=NONTRIVIAL — Die Chat-Ergebnisse aus Kapitel~6 zeigen starke Variation der Interaktionsintensität und wiederkehrende Muster von Debugging-Sequenzen.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L512) why=LITERATURBEZUG — Kapitel~6 berichtet Debugging-Iterationen als wiederkehrendes Strukturmerkmal.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L522) why=LITERATURBEZUG — Kapitel~2 unterscheidet Interaktionsmodi wie Exploration und Beschleunigung.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L532) why=LITERATURBEZUG — Aus der Diskussion ergeben sich Implikationen für Praxis und Forschung, die über die konkrete Sandbox hinausreichen.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L547) why=LITERATURBEZUG — Kapitel~6 berichtet, dass einzelne Signale wie Teststatus, Linting oder Interaktionsintensität isoliert schwer interpretierbar sind.
- LOW [thesis/chapters/07_diskussion.tex](thesis/chapters/07_diskussion.tex#L555) why=LITERATURBEZUG — In der öffentlichen Darstellung werden häufig generische Produktivitätsgewinne hervorgehoben.
- LOW [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L27) why=NONTRIVIAL — textbf Verdichtete Begründung.
- LOW [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L29) why=NONTRIVIAL — Zentrale Erkenntnisse der Arbeit Die Arbeit verdichtet sich in folgenden Befundlinien.
- LOW [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L72) why=LITERATURBEZUG — Einordnung (Group comparability \& Confounder).
- LOW [thesis/chapters/08_fazit.tex](thesis/chapters/08_fazit.tex#L76) why=NONTRIVIAL — In dieser Arbeit werden singuläre Produktivitäts- oder Proxy-Metriken als nur begrenzt belastbar eingeordnet, weil Integrations- und Abglei…

## Step 5 — Entscheidungsfähiges Gesamturteil (strikt)
- Gesamturteil: **NOT_OK**
- Risikozählung:
  - BLOCKER (Build/Log/Biber): 0
  - FORMAL_RISK (cited bib entries): 1
  - CONTENT_RISK: cite WEAK=13; missing HIGH=9 (MED=50, LOW=87)
- Begründung (evidenzbasiert):
  - FORMAL: At least one cited BibTeX entry has formal incompleteness.
  - CONTENT: High-risk non-trivial claims without any nearby citation detected.

