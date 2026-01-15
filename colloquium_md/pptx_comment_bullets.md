# PPTX-Kommentar-Bullets (Spickzettel)

Ziel: Du kannst pro Slide schnell „wieder reinkommen“, wenn du kurz den Faden verlierst.

Roter Faden durch den ganzen Vortrag:

- Problem: „Output“ (Chat/Code) ist im Brownfield nicht gleich „Fortschritt“.
- Meine Lösung: Ich trenne Fortschritt in **Evidenzstufen** (Attempted → Implemented_static → Execution observed) und trianguliere über Artefakte.
- Ergebnis: In der Praxis fallen diese Stufen auseinander – Integration/Validierung ist der Engpass.

---

## Slide 1 — Titel

Worum geht’s hier? In 1–2 Sätzen die Arbeit einordnen und direkt sagen, was der Vortrag _nicht_ ist (kein Tool-Ranking), sondern was du methodisch zeigst.

- Kurz vorstellen: Name, BA, Kontext BuyIn.
- Fokus in einfachen Worten: „Ich schaue nicht, ob Copilot gut oder schlecht ist – ich schaue, **wie man Fortschritt im Brownfield sauber misst**.“
- Mini-Teaser: „Ich unterscheide: versucht (im Chat), im Code umgesetzt, und im System tatsächlich gelaufen.“
- Rote Linie ankündigen: Sandbox → Pipeline-Logik → Auswertung/Triangulation.
- Zeit: Slot ~25 Min, Redezeit bewusst ~23–24.

## Slide 2 — Problem: „Generierter Code“ ist nicht „Fortschritt"

Worum geht’s hier? Du erklärst die Kern-Motivation: In bestehenden Systemen ist Integration der harte Teil, nicht das Produzieren von Code.

- „Brownfield“ heißt: vieles existiert schon (Verträge, Datenmodelle, Tests) – das darf nicht kaputtgehen.
- Chat-Plan kann gut klingen, ohne dass es im System funktioniert.
- Ein Code-Diff kann existieren, ohne dass End-to-End wirklich „durchläuft“.
- Deshalb: Nicht mit einer Proxy-Zahl argumentieren (z.B. Chat-Länge), sondern Ebenen trennen.
- Defensiver Satz für den Kopf: „grün im CI“ ist ein Signal, aber nicht automatisch fachliche Korrektheit.

## Slide 3 — Scope & Intent (bewusst eng)

Worum geht’s hier? Du setzt Leitplanken, damit das Publikum deine Ergebnisse nicht überinterpretiert.

- Kein Ranking / kein Benchmark: „Ich bewerte nicht Tools gegeneinander.“
- Keine Produktivitätsmessung: keine Zeitersparnis-/Speed-Claims.
- Keine Kausalität: keine inferenzstatistischen Gruppenvergleiche, nur deskriptive Auswertung.
- Ziel: eine **Auswertungslogik** für timeboxed Vibe-Coding im Brownfield.
- Kompetenzgruppen: nur Kontext/Analyseperspektive, nicht „Leistungsnoten“.

## Slide 4 — Studiensetup (kurz, aber konkret)

Worum geht’s hier? Du erklärst in 1–2 Sätzen, wie die Studie praktisch ablief (Setting, Timebox, Artefakte) und warum das für Brownfield passt.

- BuyIn-Sandbox: Full-Stack (Backend + Frontend), containerisiert, realistisch gekoppelt.
- Ablauf: Onboarding → Pre-Survey → 60 Min Coding → Datensicherung/Debrief.
- Stichprobe: N=18; Einteilung in No/Low/Mid/High als grobe Heuristik.
- Tasks: T1–T8 angelegt, real ausgewertet T1–T5 (weil Timebox).
- Datengrundlage ist komplett: Branch + Chat-Export + Survey (für alle 18).
- Warum so designt: damit Integration/Abgleich sichtbar wird (nicht nur „Code tippen“).

## Slide 5 — Kernbeitrag: Pipeline-Logik als Diagnosemodell

Worum geht’s hier? Du erklärst dein zentrales Modell: Fortschritt wird als Pipeline mit klaren Definitionen berichtet.

- Hauptsatz: „Ich trenne Plan, Code-Artefakt und beobachtbares Verhalten.“
- Attempted = im Chat als Ziel/Schritt explizit genannt (Intent).
- Implemented_static = im Code/Struktur erkennbar (Heuristik, White-Box).
- Execution observed = in definierten Integrationsläufen sichtbar (Black-Box, testgebunden).
- Defensiv: Execution observed heißt „läuft durch definierte Checks“, nicht „fachlich perfekt“.
- Implemented\* kurz: hilft beim Zusammenfassen, wenn Signale auseinanderlaufen.

## Slide 6 — Operationalisierung & Evidenz (Triangulation)

Worum geht’s hier? Du zeigst, wie du die Pipeline praktisch messbar machst: welche Artefakte liefern welche Evidenz.

- „Mein zweiter Beitrag“: Jede Stufe ist an ein konkretes, auditierbares Artefakt gebunden.
- Triangulation als Merksatz: Chat sagt „was wollte ich“, Code zeigt „was habe ich verändert“, Ausführung zeigt „was lief im System“.
- Survey ist Kontext (Kompetenz/Hürden), nicht Bewertung.
- Reproduzierbarkeit: Scripts + Ergebnisartefakte sind versioniert im Repo.
- Defensiv: Du nutzt absichtlich nur Evidenzen, die stabil verfügbar und nachvollziehbar sind.

## Slide 7 — Ergebnisse I: Pipeline-Funnel (T1–T5)

Worum geht’s hier? Du präsentierst das Hauptresultat: Viele versuchen Aufgaben, aber deutlich weniger bekommen sie im System bestätigt.

- „Das ist die wichtigste Ergebnisfolie“: sie zeigt Drop-offs auf einen Blick.
- Attempted ist fast immer da (z.B. T1/T2: 18/18).
- Execution observed fällt stark ab (T1 10/18, T2 4/18).
- Bei Integrationsaufgaben: T4/T5 jeweils 0/18 Execution observed.
- T3-Diskrepanz: verified hoch, implemented_static niedriger → Begründung, warum Ebenen trennen.
- Defensiv: Das ist eine Diagnose im Setup (Brownfield + Timebox), kein generelles Tool-Urteil.

## Slide 8 — Ergebnisse II: Kompetenz (Analyseperspektive, kein Ranking)

Worum geht’s hier? Du zeigst, dass „mehr Kompetenz = automatisch besseres Ergebnis“ hier nicht sauber aufgeht – und dass simple Rankings gefährlich wären.

- Erst sagen: „Kein Ranking, nur Kontext-Perspektive.“
- Gruppen kurz: No/Low/Mid/High.
- Implemented_static-Tasks pro Branch: 1–4, T5 überall 0.
- Nichtlineares Muster: „4 implemented Tasks“ tritt nicht nur bei High-Codern auf.
- Interpretation vorsichtig: Nutzungstypen/Strategien (Delegieren vs Abgleich/Absicherung).
- Takeaway: Kompetenz ist im Datensatz eher ein Kontextfaktor als eine lineare Erfolgsskala.

## Slide 9 — Ergebnisse III: Chat-Intensität ≠ Effizienz + Qualitäts-Surrogate

Worum geht’s hier? Du entkräftest die „naive“ Idee, man könne Fortschritt über Chat-Länge oder simple Qualitäts-Proxies erklären.

- Leitfrage: „Kann ich aus Chat-Metriken ableiten, wer effizient oder erfolgreich ist?“
- Varianz nennen: ca. 4k–26k Wörter → sehr unterschiedlich.
- Einfache Erklärung: langer Chat kann gründlicher Abgleich sein oder festhängen – das sieht man an der Länge allein nicht.
- Lint/Tests/Surrogates: interessante Nebenbeobachtung, aber nicht das Kern-Outcome.
- Rückbindung: deshalb Pipeline-Evidenz + Triangulation, nicht „eine Zahl = Wahrheit“.

## Slide 10 — Diskussion: Integration & Validierung als Engpass

Worum geht’s hier? Du verbindest die Ergebnisse zu einer plausiblen Erklärung: Sobald Aufgaben stärker gekoppelt sind, wird Integration/Validierung der Flaschenhals.

- One-liner: „Der Engpass ist Integration & Validierung, nicht Codeproduktion.“
- Ab T3 mehr Kopplung (Schema/API/UI) → weniger Execution observed.
- Brownfield-Realität: Kontext ist verteilt, Verträge müssen eingehalten werden.
- Defensiv: Execution observed ist methodengebunden (abhängig von Test-/Integrationsläufen), kein allgemeines Qualitätsurteil.
- Konsequenz: nicht auf Chat/Lint/„ein Testsignal“ reduzieren.

## Slide 11 — Implikationen (Unternehmen & Forschung)

Worum geht’s hier? Du leitest praxisnahe Konsequenzen ab – aber klar: basierend auf Drop-offs zwischen Artefakt und Ausführung, nicht auf Tool-Hype.

- Satz zum Einstieg: „Ich leite das aus den Drop-offs Artefakt → Ausführung ab.“
- Unternehmen: Tool einführen reicht nicht; Prozesshygiene (Review/CI/Verträge) ist entscheidend.
- Training: nicht nur Prompting, sondern Kontextbereitstellung, Abgleich, Debugging im System.
- Governance: Security/Compliance + kontrollierte Nutzung + saubere Artefaktspur.
- Forschung: Brownfield-Designs + mehrstufige Outcome-Logik statt Single-Metric Benchmarks.

## Slide 12 — Limitationen (was die Studie nicht leistet)

Worum geht’s hier? Du machst sauber transparent, welche Aussagen du _nicht_ machen kannst – damit die Ergebnisse defensiv bleiben.

- N=18, Gruppen klein → keine belastbaren Gruppenvergleiche.
- Kompetenzmessung ist heuristisch (Pre-Survey), nicht psychometrisch.
- Heuristiken können falsch liegen (Attempted/Implemented_static).
- Keine IDE-Telemetrie: z.B. wie oft lokal Tests liefen, welche Dateien offen waren.
- Execution observed ist methodengebunden und ≠ vollständige fachliche Korrektheit.

## Slide 13 — Fazit: 3 Takeaways + Unique Contribution

Worum geht’s hier? Du fasst in 3 klaren Sätzen zusammen, was das Publikum mitnehmen soll – plus dein eigener Beitrag (Sandbox + Auswertungslogik).

- Einstieg: „3 Takeaways“ + defensiv: keine Tool-Rangordnung.
- Takeaway 1: Fortschritt in Brownfield nur sinnvoll über Evidenzstufen berichten.
- Takeaway 2: Engpass ist Integration/Abgleich (nicht das Schreiben von Code).
- Takeaway 3: Kompetenz eher Nutzungstyp/Strategie-Kontext, keine lineare Erfolgsskala.
- Unique Contribution: reproduzierbare Brownfield-Sandbox + auditierbare Pipeline-Auswertung.
- Schlusssatz möglich: „So kann man KI-Coding defensiv und nachvollziehbar evaluieren.“

## Slide 14 — Q&A

Worum geht’s hier? Du öffnest die Diskussion und bietest an, bei Bedarf auf konkrete Artefakte im Repo zu zeigen.

- Danke + Einladung zu Fragen.
- Primärthemen: Definitionen der Stufen, Operationalisierung, Grenzen der Signale.
- Wenn du stockst: „Ich kann das an einem konkreten Branch/Artefakt zeigen.“
- Häufige Fragen: Validität/Fehlklassifikation, warum T4/T5=0, Follow-up mit Telemetrie.
- Optional: Mini-Trace erzählen (Chat-Intention → Codeänderung → Ausführungsartefakt).
