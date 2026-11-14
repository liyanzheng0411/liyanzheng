# SourceCheck

**Prose word count: 280** (headings included; commands, file names and links excluded).

## Project status

SourceCheck is a browser prototype for university students checking an introductory statistics answer. Choose a question and a cue: a general warning before the answer or an uncertainty statement within it. Both modes supply the same claim and optional textbook reference. Submit or revise a judgement and review the explanation. AI behaviour is simulated with authored responses. A live model and student evaluation are planned. Round state stays in memory and clears on reload.

## Technology and running

HTML and CSS provide the interface. Vanilla JavaScript selects the scripted claim, switches the cue and manages the round. There is no server, package install or API key. Open `index.html` in a recent browser. The optional OpenStax links need internet access. To check the app handlers with Node.js 20 or newer:

```sh
node checks.cjs
```

## Development record

- [7773f99](../../commit/7773f99): Built a repeatable round with two cue strategies, checking and feedback. The examples were chosen so their verdicts can be verified using textbook rules.
- [d7394ef](../../commit/d7394ef): Moved the source before the judgement form in reading order so the option to check is reachable before submitting.
- [9a7fd91](../../commit/9a7fd91): Added handler checks for identical claims and sources, skipping a check, feedback, revision and reset. Full browser and student testing remain to be done.

## AI assistance

I chose to focus on university students. ChatGPT (Codex) built the prototype, wrote the automated checks, drafted the report and made the storyboards. Codex checked both cue paths and verified the feedback against OpenStax.

## Additional files

`docs/storyboard-a.png` and `docs/storyboard-b.png` illustrate the two replayable paths. `docs/system.png` and `docs/system.dot` show the component flows. `Assignment2_Project_Report.docx` accompanies this source package. The local release tag is `v0.1.0`.

Evidence cards paraphrase Illowsky and Dean, [*Introductory Statistics 2e*](https://openstax.org/books/introductory-statistics-2e/pages/1-introduction) (OpenStax, 2023), §§2.5 and 2.7, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The numerical examples and interface artwork were made for this project.
