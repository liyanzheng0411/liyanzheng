"use strict";

const CASES = {
  median: {
    name: "Median and an outlier",
    question: "What is the median of 2, 3, 4, 5 and 86?",
    claim: "The median is 20. Add the five values to get 100, then divide by 5.",
    source: "Measures of the Center of the Data",
    section: "2.5",
    rule: "Order the values from smallest to largest. With an odd number of values, the median is the middle value. Adding the values and dividing by their count gives the mean.",
    url: "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
    verdict: "Contradicted",
    explanation: "The middle value in the ordered list is 4. The calculation gives the mean, 20, rather than the median."
  },
  spread: {
    name: "Standard deviation of equal values",
    question: "What is the standard deviation of 7, 7, 7 and 7?",
    claim: "The standard deviation is 0, since every value equals the mean.",
    source: "Measures of the Spread of the Data",
    section: "2.7",
    rule: "Standard deviation measures how far values tend to be from the mean. Its calculation uses the squared differences from the mean. If all differences are zero, the standard deviation is zero.",
    url: "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
    verdict: "Supported",
    explanation: "Every value equals the mean of 7, so each squared difference is zero and the standard deviation is 0."
  }
};
const MODES = {
  warning: { name: "General warning", detail: "A general reminder appears before the answer." },
  uncertainty: { name: "Answer uncertainty", detail: "The simulated AI states uncertainty beside its answer." }
};
const STEPS = ["Setup", "Question", "Assess", "Review"];
const JUDGEMENTS = ["Supported", "Contradicted", "Unsure"];
const REASONS = [
  "I used the reference.",
  "I worked it out myself.",
  "I relied on the AI response.",
  "I wasn't sure how to check.",
  "Other reason."
];
const stage = document.querySelector("#stage");
const progress = document.querySelector("#progress");
const announce = document.querySelector("#announcement");
const state = {
  step: 0, caseId: "median", mode: "warning", referenceVisible: false,
  referenceOpened: false, externalSelected: false, judgement: "", reason: ""
};
const is = (a, b, attribute) => a === b ? " " + attribute : "";
const heading = (rubric, content) =>
  `<p class="eyebrow">${rubric}</p><h2 id="step-heading" tabindex="-1">${content}</h2>`;
const label = (caption, note) => `<strong>${caption}</strong>${note ? `<span class="small">${note}</span>` : ""}`;
const radio = (group, val, current, note = "", shown = val) =>
  `<label class="option"><input type="radio" name="${group}" value="${val}"${is(val,current,"checked")}><span>${label(shown,note)}</span></label>`;
const control = (action, caption, secondary = false) =>
  `<button class="button${secondary ? " secondary" : ""}" type="button" data-action="${action}">${caption}</button>`;
const answer = (item) =>
  `<div class="answer"><p class="eyebrow">SIMULATED AI RESPONSE</p>
    ${state.mode === "uncertainty" ? '<div class="callout uncertain">I’m not sure this answer is correct.</div>' : ""}
    <p class="claim">${item.claim}</p>
  </div>`;

function setup() {
  return `<section class="card primary" aria-labelledby="step-heading">
    ${heading("STEP 1", "Set up a practice round")}
    <form id="setup-form">
      <label class="field" for="case">Practice question</label>
      <select id="case" name="case">${Object.entries(CASES).map(([key,item]) =>
        `<option value="${key}"${is(key,state.caseId,"selected")}>${item.name}</option>`).join("")}</select>
      <fieldset><legend>How should the system signal uncertainty?</legend>
      ${Object.entries(MODES).map(([key,mode]) => radio("mode",key,state.mode,mode.detail,mode.name)).join("")}</fieldset>
      <div class="actions"><button class="button" type="submit">Start round <span aria-hidden="true">→</span></button></div>
    </form>
  </section>
  <aside class="card aside" aria-labelledby="about-heading">
    <p class="eyebrow">ABOUT THIS ACTIVITY</p>
    <h3 id="about-heading">One answer, two approaches</h3>
    <p>Try the same question with each message. The answer and reference stay the same.</p>
    <p class="small">The answers are written in advance to simulate an AI response.</p>
  </aside>`;
}

function question(item) {
  return `<section class="card primary" aria-labelledby="step-heading">
    ${heading("STEP 2  ·  " + item.name.toUpperCase(), item.question)}
    ${state.mode === "warning" ? '<div class="callout warning" id="general-warning"><strong>Before you view the answer</strong><br>AI answers can be incorrect.</div>' : ""}
    <div class="actions">${control("show-answer","Show AI answer →")}${control("setup","Back to setup",true)}</div>
  </section>
  <aside class="card aside"><p class="eyebrow">YOUR TASK</p><h3>Assess the claim</h3>
    <p>You can decide on your own or consult an independent textbook reference.</p></aside>`;
}

function paintEvidence(item) {
  const card = document.querySelector("#evidence-content");
  card.hidden = !state.referenceVisible;
  card.innerHTML = state.referenceVisible ? `
    <div class="evidence"><p class="eyebrow">TEXTBOOK RULE  ·  PARAPHRASE</p><p>${item.rule}</p>
    <a class="external" id="publisher-link" href="${item.url}" target="_blank" rel="noopener noreferrer">Open OpenStax §${item.section} <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a></div>` : "";
  const trigger = document.querySelector('[data-action="reference"]');
  trigger.setAttribute("aria-expanded", String(state.referenceVisible));
  trigger.textContent = state.referenceVisible ? "Hide reference" : "Open reference";
  document.querySelector("#reference-status").textContent = state.referenceOpened
    ? "Reference opened in this round." : "Reference has not been opened.";
}

function assess(item) {
  return `<section class="card primary assess-card" aria-labelledby="step-heading">
    <div class="mobile-top">${heading("STEP 3  ·  " + item.name.toUpperCase(),item.question)}${answer(item)}</div>
    <form id="review-form" novalidate>
      <div class="mobile-bottom">
        <fieldset aria-describedby="choice-error"><legend>Does the evidence support this answer?</legend>
        ${JUDGEMENTS.map(choice => radio("judgement",choice,state.judgement)).join("")}
        </fieldset>
        <p id="choice-error" class="error" role="alert" hidden></p>
        <label class="field" for="reason">What informed your choice? <span class="small">(optional)</span></label>
        <select id="reason" name="reason"><option value="">Choose a reason</option>
        ${REASONS.map((reason,index)=>`<option value="${index}"${is(String(index),state.reason,"selected")}>${reason}</option>`).join("")}</select>
        <div class="actions"><button type="submit" class="button">See feedback <span aria-hidden="true">→</span></button>
        ${control("setup","Back to setup",true)}</div>
      </div>
    </form>
  </section>
  <aside class="card aside" id="reference-card" aria-labelledby="reference-heading">
    <p class="eyebrow">INDEPENDENT SOURCE</p>
    <h3 id="reference-heading">${item.source}</h3>
    <p class="small">OpenStax · Introductory Statistics 2e · §${item.section}</p>
    <div class="actions"><button type="button" class="button secondary" data-action="reference" aria-expanded="false" aria-controls="evidence-content">Open reference</button></div>
    <p class="small" id="reference-status"></p>
    <div id="evidence-content" hidden></div>
  </aside>`;
}

function review(item) {
  return `<section class="card primary" aria-labelledby="step-heading">
    ${heading("STEP 4  ·  " + item.name.toUpperCase(), "Review your judgement")}
    <p>${item.question}</p>
    <dl class="status-pairs">
      <div><dt>Your judgement</dt><dd>${state.judgement}</dd></div>
      <div><dt>Reference access</dt><dd>${state.referenceOpened ? "Opened" : "Not opened"}</dd></div>
    </dl>
    <div class="verdict" id="verdict"><p class="small">REFERENCE VERDICT</p>
      <h3>${item.verdict}</h3><p>${item.explanation}</p>
      <a class="external" id="publisher-link" href="${item.url}" target="_blank" rel="noopener noreferrer">Open the textbook <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a></div>
    <div class="actions">${control("revise","Revise judgement")}${control("setup","Start another round",true)}</div>
  </section>
  <aside class="card aside"><p class="eyebrow">THIS ROUND</p><h3>${MODES[state.mode].name}</h3>
    <p class="small">Reported reason: ${state.reason === "" ? "None given" : REASONS[Number(state.reason)]}</p>
    <p class="small">Opening a source records access. It does not tell us what was read or understood.</p>
  </aside>`;
}

function render(focus = true) {
  const item = CASES[state.caseId];
  stage.innerHTML = [setup,question,assess,review][state.step](item);
  progress.innerHTML = STEPS.map((name,index) =>
    `<li${index === state.step ? ' aria-current="step"' : ""}${index < state.step ? ' class="done"' : ""}><span aria-hidden="true">${index < state.step ? "✓" : index + 1}</span>${name}</li>`).join("");
  if (state.step === 2) paintEvidence(item);
  if (focus) document.querySelector("#step-heading").focus({preventScroll: false});
}

stage.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  if (event.target.id === "setup-form") {
    const caseId = form.get("case"), mode = form.get("mode");
    if (!Object.hasOwn(CASES,caseId) || !Object.hasOwn(MODES,mode)) return;
    Object.assign(state,{caseId,mode,step:1,referenceVisible:false,referenceOpened:false,
      externalSelected:false,judgement:"",reason:""});
    render();
  } else if (event.target.id === "review-form") {
    const judgement = form.get("judgement");
    if (!JUDGEMENTS.includes(judgement)) {
      const error = document.querySelector("#choice-error");
      error.textContent = "Choose Supported, Contradicted or Unsure to continue.";
      error.hidden = false;
      stage.querySelector('[name="judgement"]').focus();
      return;
    }
    const reason = form.get("reason");
    state.judgement = judgement;
    state.reason = REASONS[Number(reason)] && reason !== "" ? reason : "";
    state.step = 3;
    render();
  }
});

stage.addEventListener("change", event => {
  if (event.target.name === "judgement") document.querySelector("#choice-error").hidden = true;
});
stage.addEventListener("click", event => {
  if (event.target.closest("#publisher-link")) state.externalSelected = true;
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "reference" && state.step === 2) {
    state.referenceVisible = !state.referenceVisible;
    state.referenceOpened ||= state.referenceVisible;
    paintEvidence(CASES[state.caseId]);
    announce.textContent = state.referenceVisible ? "Reference expanded." : "Reference hidden.";
    return;
  }
  if (action === "show-answer") state.step = 2;
  else if (action === "revise") state.step = 2;
  else if (action === "setup") state.step = 0;
  else return;
  render();
});

render(false);
