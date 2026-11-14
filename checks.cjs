"use strict";

// Exercise the app's registered handlers without a browser or extra dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function checkFlows() {
  const listeners = new Map();
  const nodes = new Map();
  const element = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: "", textContent: "", hidden: false, attrs: {},
      setAttribute(key,value) { this.attrs[key] = value; },
      focus() { this.focused = true; },
      querySelector: el,
      addEventListener(name, fn) { listeners.set(name,fn); }
    });
    return nodes.get(selector);
  };
  function el(selector) { return element(selector); }
  const context = vm.createContext({
    document: { querySelector: el },
    FormData: class { constructor(source) { this.source = source; } get(name) { return this.source[name] ?? null; } }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,"app.js"),"utf8"),context);
  const stage = () => el("#stage").innerHTML;
  const submit = (id,values) => listeners.get("submit")({target:{id,...values},preventDefault(){}});
  const click = action => listeners.get("click")({target:{closest:()=>({dataset:{action}})}});
  const caseFacts = vm.runInContext("CASES",context);
  const ui = vm.runInContext("MODES",context);
  const frames = { caseFacts, ui };
  const answerClaim = () => stage().match(/<p class="claim">([^<]+)<\/p>/)?.[1];
  assert.match(stage(),/Set up a practice round/);
  submit("setup-form",{case:"median",mode:"warning"});
  assert.match(stage(),/AI answers can be incorrect/);
  assert.doesNotMatch(stage(),/SIMULATED AI RESPONSE/);
  frames.aWarning = stage();
  click("show-answer");
  assert.doesNotMatch(stage(),/class="callout (warning|uncertain)"/);
  const baseClaim = answerClaim();
  assert.equal(baseClaim,caseFacts.median.claim);
  assert.ok(stage().indexOf("reference-card") < stage().indexOf("review-form"),"Evidence precedes verdict controls in DOM");
  assert.equal(el("#evidence-content").hidden,true);
  submit("review-form",{judgement:"",reason:""});
  assert.match(el("#choice-error").textContent,/Choose Supported/);
  assert.match(stage(),/See feedback/);
  frames.aAssess = stage();
  submit("review-form",{judgement:"Supported",reason:"2"});
  assert.match(stage(),/Your judgement<\/dt><dd>Supported/);
  assert.match(stage(),/Reference access<\/dt><dd>Not opened/);
  assert.match(stage(),/REFERENCE VERDICT[\s\S]+<h3>Contradicted<\/h3>/);
  frames.aReview = stage();
  click("revise");
  assert.match(stage(),/value="Supported" checked/);
  click("reference");
  const referenceA=el("#evidence-content").innerHTML;
  assert.match(referenceA,/2-5-measures-of-the-center-of-the-data/);
  assert.equal(el("#evidence-content").hidden,false);
  assert.equal(el('[data-action="reference"]').attrs["aria-expanded"],"true");
  click("reference");
  assert.equal(el("#evidence-content").hidden,true);
  submit("review-form",{judgement:"Contradicted",reason:"0"});
  assert.match(stage(),/Reference access<\/dt><dd>Opened/);
  click("setup");
  submit("setup-form",{case:"median",mode:"uncertainty"});
  assert.doesNotMatch(stage(),/class="callout (warning|uncertain)"/);
  click("show-answer");
  assert.match(stage(),/I’m not sure this answer is correct/);
  assert.equal(answerClaim(),baseClaim);
  assert.doesNotMatch(stage(),/name="judgement"[^>]*checked/);
  assert.match(el("#reference-status").textContent,/has not been opened/);
  assert.equal(el("#evidence-content").hidden,true);
  frames.bUncertainty = stage();
  click("reference");
  assert.equal(el("#evidence-content").innerHTML,referenceA);
  frames.bEvidence=el("#evidence-content").innerHTML;
  submit("review-form",{judgement:"Contradicted",reason:"0"});
  assert.match(stage(),/Your judgement<\/dt><dd>Contradicted/);
  assert.match(stage(),/Reference access<\/dt><dd>Opened/);
  assert.match(stage(),/Reported reason: I used the reference/);
  frames.bReview=stage();
  click("setup");
  submit("setup-form",{case:"spread",mode:"uncertainty"});
  click("show-answer");
  assert.match(stage(),/standard deviation is 0/);
  click("reference");
  assert.match(el("#evidence-content").innerHTML,/2-7-measures-of-the-spread-of-the-data/);
  submit("review-form",{judgement:"Unsure",reason:""});
  assert.match(stage(),/REFERENCE VERDICT[\s\S]+<h3>Supported<\/h3>/);
  assert.match(stage(),/Reported reason: None given/);
  return frames;
}

const states = checkFlows();
if (process.argv[2]) fs.writeFileSync(process.argv[2],JSON.stringify(states,null,2)+"\n");
console.log("Pass: both cue paths, identical claim and reference, optional checking, blank choice, uncertainty, revision, reset and both textbook verdicts.");
