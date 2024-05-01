const FLO_DEBUG = true;

function cogrt() { // eslint-disable-line no-unused-vars

  var url = new URL(window.location.href);
  var c = url.searchParams.get("c");
  console.log(c);

  let tl = {
    timeline: [
      { timeline: timeline_intro() },
      { timeline: timeline_proben(false) },
      { timeline: timeline_frag() },
      generic_block("stopsignal", 20, timeline_stop_signal(), generic_block_feedback("stopsignal"), intro_stop_signal()),
      generic_block("attentionblink", 5, timeline_attention_blink(), generic_block_feedback_dual("attentionblink"), intro_attention_blink()),
      generic_block("taskswitch", 5, timeline_task_switch(), generic_block_feedback("taskswitch"), intro_task_switch()),
      generic_block("dualtask", 5, timeline_dual_task(), generic_block_feedback_dual("dualtask"), intro_dual_task()),
    ],
    on_finish: function () {
      jsPsych.data.displayData();
      let all_data = jsPsych.data.get();
      //console.log(all_data.csv());
      all_data.localSave('csv','mydata.csv');
    }
  };
  console.log(tl.timeline);
  console.log(printTimeline(tl));
  jsPsych.init(tl);
}


// ---------------------------------------------
// ------------ INTRO + FRAGEN -----------------
// ---------------------------------------------


function timeline_intro() {
  return [{
    type: "html-keyboard-response",
    stimulus: "Willkommenstext (Platzhalter - Text). Weiter mit jeder beliebigen Taste."
  }, {
    type: "html-keyboard-response",
    stimulus: "Testungsübersicht (Platzhalter - Text). Weiter mit jeder beliebigen Taste."
  }, {
    type: 'survey-text',
    questions: [
      { prompt: "Abfrage Personen-ID (Platzhalter - Text)", name: 'ID', required: true }
    ],
  }, {
    type: 'survey-multi-choice',
    questions: [
      {
        prompt: "Abfrage Testung (Platzhalter - Text)",
        name: 'TEST',
        options: ["meine 1. Untersuchung", "meine 2. Untersuchung"],
        required: true
      }
    ],
  }];
}

function timeline_proben(alt) {
  let tl_proben = [];

  let welcome_proben = {
    type: "html-keyboard-response",
    stimulus: "Probenentnahme 1 Instruktion (Platzhalter - Text). Weiter mit jeder beliebigen Taste."
  };
  tl_proben.push(welcome_proben);

  let timer_proben = {
    type: "html-timer",
    stimulus: "Speichelprobe 1 - (Countdown für 1 min) - Start",
    trial_duration: 1000 * 60,
    prompt: "(Tastendruck zum überspringen)"
  };
  tl_proben.push(timer_proben);

  let timer_proben_stop = {
    type: "html-keyboard-response",
    stimulus: "Speichelprobe 1 - Stop. Weiter mit jeder beliebigen Taste."
  };
  tl_proben.push(timer_proben_stop);

  const mdbf_adj_a = ["Zufrieden", "Ausgeruht", "Ruhelos", "Schlecht",
    "Schlapp", "Gelassen", "Müde", "Gut", "Unruhig", "Munter", "Unwohl",
    "Entspannt"];
  const mdbf_adj_b = ["Schläfrig", "Wohl", "Ausgeglichen", "Unglücklich",
    "Wach", "Unzufrieden", "Angespannt", "Frisch", "Glücklich", "Nervös",
    "Ermattet", "Ruhig"];

  const mdbf_scale = ["Überhaupt nicht", "", "", "", "Sehr"];

  let mdbf_q_a = mdbf_adj_a.map(x => ({ prompt: x, name: x, labels: mdbf_scale, required: (FLO_DEBUG ? false : true) }));
  let mdbf_q_b = mdbf_adj_b.map(x => ({ prompt: x, name: x, labels: mdbf_scale, required: (FLO_DEBUG ? false : true) }));

  let likert_mdbf = {
    type: 'survey-likert',
    preamble: "im Moment fühle ich mich",
    button_label: "Weiter",
    scale_width: 420,
    questions: alt ? mdbf_q_b : mdbf_q_a,
  };
  tl_proben.push(likert_mdbf);

  const beschwerde_a = ["Kloßgefühl, Engegefühl in Hals", "Kurzatmigkeit",
    "Schwächegefühl", "Schluckbeschwerden", "Stiche, Schmerzen oder Ziehen in der Brust",
    "Mattigkeit", "Übelkeit", "Reizbarkeit", "Grübeln", "Starkes Schwitzen", "Innere Unruhe",
    "Schweregefühl bzw. Müdigkeit in den Beinen", "Unruhe in den Beinen", "Überempfindlichkeit gegen Wärme",
  ]

  const beschwerde_b = [
    "Kopfschmerzen bzw. Druck im Kopf oder Gesichtsschmerzen", "Müdigkeit",
    "Gleichgewichtsstörungen", "Anfallsartige Atemnot", "Erstickungsgefühl",
    "Neigung zum Weinen", "Appetitlosigkeit", "Herzklopfen, Herzjagen oder Herzstolpern",
    "Rasche Ermüdbarkeit", "Angstgefühl", "Verstopfung", "Energielosigkeit",
    "Konzentrationsschwäche", "Mangelndes Interesse an Sex",
  ]

  const beschwerde_scale = ["Stark", "Mäßig", "Kaum", "Gar nicht"];

  let beschwerde_q_a = beschwerde_a.map(x => ({ prompt: x, name: x, labels: beschwerde_scale, required: (FLO_DEBUG ? false : true) }));
  let beschwerde_q_b = beschwerde_b.map(x => ({ prompt: x, name: x, labels: beschwerde_scale, required: (FLO_DEBUG ? false : true) }));

  let likert_beschwerde = {
    type: 'survey-likert',
    preamble: "im Moment leide ich unter folgenden Beschwerden",
    button_label: "Weiter",
    scale_width: 420,
    questions: alt ? beschwerde_q_b : beschwerde_q_a,
  };
  tl_proben.push(likert_beschwerde);

  let blutdruck = {
    type: "html-keyboard-response",
    stimulus: "Blutdruck. Weiter mit jeder beliebigen Taste."
  };
  tl_proben.push(blutdruck);

  return tl_proben;
}

function timeline_frag() {
  let tl_frag = [];

  let welcome_frag = {
    type: "html-keyboard-response",
    stimulus: "Fragebogen 1: States Instruktion (Platzhalter - Text). Weiter mit jeder beliebigen Taste."
  };
  tl_frag.push(welcome_frag);

  const scale1 = ["sehr gut", "gut", "mäßig", "sehr schlecht"];
  const scale2 = ["überhaupt keinen", "etwas", "ziemlich viel", "sehr viel"];

  let form_trial = {
    type: 'survey-html-form',
    button_label: "Weiter",
    preamble: generate_likert_style(420) + '',
    html: '<p> Letzte Nacht habe ich ca. <input name="schlafdauer" type="text" /> Stunden geschlafen. </p><br/>' +
      '<p>Letzte Nacht habe ich</p>' + generate_likert('schlafquali', scale1) + '<p>geschlafen.</p><br/>' +
      '<p>Gestern habe ich</p>' + generate_likert('alkohol', scale2) + '<p>Alkohol getrunken.</p>'
  };
  tl_frag.push(form_trial);

  const traits = ["Trait1", "Trait2", "Trait3"];
  const traits_scale = ["Überhaupt nicht", "", "", "", "Sehr"];
  let traits_q = traits.map(x => ({ prompt: x, name: x, labels: traits_scale, required: (FLO_DEBUG ? false : true) }));

  let likert_traits = {
    type: 'survey-likert',
    preamble: "Trait Fragebogen",
    button_label: "Weiter",
    scale_width: 420,
    questions: traits_q,
  };
  tl_frag.push(likert_traits);

  return tl_frag;
}

// ---------------------------------------------
// ---------------- TASKS ----------------------
// ---------------------------------------------

/*function timeline_aufg() {

  let tl = [{
    type: "html-keyboard-response",
    stimulus: "Aufgaben start. Weiter mit jeder beliebigen Taste."
  },
  generic_block("stopsignal", 20, timeline_stop_signal(), generic_block_feedback("stopsignal"), intro_stop_signal()),
  generic_block("attentionblink", 5, timeline_attention_blink(), generic_block_feedback_dual("attentionblink"), intro_attention_blink()),
  generic_block("taskswitch", 5, timeline_task_switch(), generic_block_feedback("taskswitch"), intro_task_switch()),
  generic_block("dualtask", 5, timeline_dual_task(), generic_block_feedback_dual("dualtask"), intro_dual_task()),
  ];

  return tl;
}*/

function timeline_dual_task() {
  const target1 = [2, 3, 7, 8];
  const target2 = [1, 4, 6, 9];
  const tthreshold = 5;
  const target1_keys = ['y', 'x'];
  const target2_keys = [',', '.'];
  const soa_variations = [80, 320, 1280];
  const single_blank_duration = 500;

  return [{
    type: 'dual-task',
    stimulus1: function () {
      return jsPsych.randomization.sampleWithReplacement(target1, 1)[0];
    },
    stimulus2: function () {
      return jsPsych.randomization.sampleWithReplacement(target2, 1)[0];
    },
    choices1: target1_keys,
    choices2: target2_keys,
    stimulus_onset_async: function () {
      return jsPsych.randomization.sampleWithReplacement(soa_variations, 1)[0];
    },
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      data.correct1 = data.key_press1 == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
        target1_keys[data.stimulus1 > tthreshold ? 1 : 0]);
      data.correct2 = data.key_press2 == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
        target2_keys[data.stimulus2 > tthreshold ? 1 : 0]);
      data.correct = data.correct1 && data.correct2;
      data.rt = Math.max(data.rt1, data.rt2);
    },
  }, {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: single_blank_duration,
  }];
}

function intro_dual_task(alt) {
  return {
    type: "html-keyboard-response",
    stimulus: "<p>Doppelaufgabe.</p><p>Linke Zahl: y = >5 , x = <5</p><p>Rechte Zahl: , = >5 , . = <5</p>"
  }
}

function timeline_task_switch(alt) {

  const target1 = [2, 3, 7, 8];
  const target2 = [1, 4, 6, 9];
  const cue1 = [2, 1]; // triangle, rect: >< 5
  const cue2 = [0, 3]; // circle, rhombus: even odd
  const target1_keys = ['y', 'x'];
  const target2_keys = [',', '.'];
  const cti_variations = [250, 750];

  const target = alt ? target2 : target1;
  const cue = alt ? cue2 : cue1;
  const target_keys = alt ? target2_keys : target1_keys;

  return [{
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 250,
  }, {
    type: 'switch-task',
    fixation: '<div style="font-size:60px;">+</div>',
    target: function () { return jsPsych.randomization.sampleWithReplacement(target, 1)[0]; },
    cue: function () { return jsPsych.randomization.sampleWithReplacement(cue, 1)[0]; },
    choices: target_keys,
    cti: function () { return jsPsych.randomization.sampleWithReplacement(cti_variations, 1)[0]; },
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      let tsk = cue1.indexOf(data.cue) === -1; // which task
      data.correct = data.key_press === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
        target_keys[tsk ? (data.target % 2 === 0 ? 0 : 1) : (data.target > 5 ? 0 : 1)]);
    },
  }];
}
function intro_task_switch(alt) {
  return {
    type: "html-keyboard-response",
    stimulus: "<p>Wechselaufgabe.</p><p>Bei Dreieck und Rechteck: y = >5 , x = <5</p><p>Bei Kreis und Raute: , = gerade , . = ungerade</p>"
  }
}


function timeline_attention_blink() {
  const num_stimuli = 15;

  const distractors = [2, 3, 7, 8];
  const target1 = [4, 9];
  const target2 = [1, 6];
  const target1_pos = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const target2_pos = [9, 10, 11, 12, 13, 14];
  const choices1 = ['y', 'x'];
  const choices2 = [',', '.'];

  const duration_stimulus = 50;
  const duration_blank = 20;
  const duration_response = 2500;

  return [{
    type: 'attention-blink',
    stimuli: function() { 
      let stimuli = jsPsych.randomization.sampleWithReplacement(distractors, num_stimuli);
      let targets = new Array(num_stimuli);
      for (let i = 0; i < targets.length; i++) { targets[i] = -1; }
      const t1p = jsPsych.randomization.sampleWithReplacement(target1_pos, 1)[0];
      const t2p = jsPsych.randomization.sampleWithReplacement(target2_pos, 1)[0];
      stimuli[t1p] = jsPsych.randomization.sampleWithReplacement(target1, 1)[0];
      stimuli[t2p] = jsPsych.randomization.sampleWithReplacement(target2, 1)[0];
      targets[t1p] = 0;
      targets[t2p] = 1;
      return {stimuli: stimuli, targets: targets}
     },
    choices1: choices1,
    choices2: choices2,
    single_stimulus_duration: duration_stimulus,
    single_blank_duration: duration_blank,
    response_duration: duration_response,
    response_prompt: '<p>Welche Zielreize (in roter Schrift) haben sie gesehen? Bitte drücken sie die entsprechenden Tasten für</p>' +
      '<p>Zielreiz 1 [Eingabe 1 Ziffer, y = 4, x = 9]</p>' +
      '<p>Zielreiz 2 [Eingabe 1 Ziffer, , = 1, . = 6]</p>',
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      for (let i = 0; i < data.targets.length; i++) {
        if (data.targets[i] == 0) {
          data.correct1 = data.key_press1 == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
            choices1[target1[0] == data.stimuli[i] ? 0 : 1]);
        } else if (data.targets[i] == 1) {
          data.correct2 = data.key_press2 == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
            choices2[target2[0] == data.stimuli[i] ? 0 : 1]);
        }
      }
      data.correct = data.correct1 && data.correct2;
      data.rt = Math.max(data.rt1, data.rt2);
    },
  }];
}
function intro_attention_blink(alt) {
  return {
    type: "html-keyboard-response",
    stimulus: '<p>Schnelle serielle...</p><p>Welche Zielreize (in roter Schrift) haben sie gesehen? Bitte drücken sie die entsprechenden Tasten für</p>' +
      '<p>Zielreiz 1 [Eingabe 1 Ziffer, y = 4, x = 9]</p>' +
      '<p>Zielreiz 2 [Eingabe 1 Ziffer, , = 1, . = 6]</p>'
  }
}

var JSPSYCH_NX_SSD_INITIAL = 200;
var JSPSYCH_NX_SSD = JSPSYCH_NX_SSD_INITIAL;
var JSPSYCH_NX_SSD_STEP = 50;
function timeline_stop_signal() {

  const choices = [',', '.'];
  const stimuli = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  JSPSYCH_NX_SSD = JSPSYCH_NX_SSD_INITIAL;

  return [{
    type: 'stop-signal',
    stimulus: function () { return jsPsych.randomization.sampleWithReplacement(stimuli, 1)[0]; },
    isi: function () { return Math.random() < 0.75 ? null : JSPSYCH_NX_SSD; },
    choices: choices,
    fixation_duration: 250,
    trial_duration: 1250,
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      data.stop = (data.isi !== null);
      data.correct = data.stop ? data.rt === null : data.key_press === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(
        choices[data.stimulus % 2 === 0 ? 0 : 1]);
      let oldssd = JSPSYCH_NX_SSD;
      if (data.stop) {
        if (data.correct) {
          if (JSPSYCH_NX_SSD + JSPSYCH_NX_SSD_STEP < 1250)
            JSPSYCH_NX_SSD = JSPSYCH_NX_SSD + JSPSYCH_NX_SSD_STEP;
        } else {
          if (JSPSYCH_NX_SSD - JSPSYCH_NX_SSD_STEP > JSPSYCH_NX_SSD_STEP)
            JSPSYCH_NX_SSD = JSPSYCH_NX_SSD - JSPSYCH_NX_SSD_STEP;
        }
      }
      console.log("JSPSYCH_NX_SSD: " + oldssd + " → " + JSPSYCH_NX_SSD);
    }
  }];
}
function intro_stop_signal(alt) {
  return {
    type: "html-keyboard-response",
    stimulus: "<p>Stopaufgabe.</p><p> , = gerade , . = ungerade</p><p>Bei Dreieck nicht antworten</p>"
  }
}

// GENERIC HELPER FUNCTIONS

function generic_block(blockId, trialCount, trialTimeline, blockFeedback, blockIntro) {

  let trial_vars = Array(trialCount);
  for (let i = 0; i < trialCount; i++) {
    trial_vars[i] = {
      data: { block_id: blockId, block_trial_id: i },
    }
  }

  let block_procedure = {
    timeline: [{
      timeline: trialTimeline,
      timeline_variables: trial_vars,
    }],
  };

  if (blockFeedback !== null) {
    block_procedure.timeline.push(blockFeedback);
  }
  if (blockIntro !== null) {
    block_procedure.timeline.unshift(blockIntro);
  }

  return block_procedure;
}

function generic_block_feedback(blockId) {
  return {
    type: "html-keyboard-response",
    stimulus: function () {
      let trials = jsPsych.data.get().filter({ "block_id": blockId });
      let correct_trials = trials.filter({ "correct": true });
      let accuracy = correct_trials.count() === 0 ? 0 : Math.round(correct_trials.count() / trials.count() * 100);
      let rt = correct_trials.count() === 0 ? 0 : Math.round(correct_trials.select('rt').mean());
      return "<p>" + accuracy + "% wurden richtig bewertet. (Antwortzeit: " + (rt / 1000) + "s)</p>";
    }
  }
}
function generic_block_feedback_dual(blockId) {
  return {
    type: "html-keyboard-response",
    stimulus: function () {
      let trials = jsPsych.data.get().filter({ "block_id": blockId });
      let correct_trials1 = trials.filter({ correct1: true });
      let correct_trials2 = trials.filter({ correct2: true });
      let accuracy1 = correct_trials1.count() === 0 ? 0 : Math.round(correct_trials1.count() / trials.count() * 100);
      let accuracy2 = correct_trials2.count() === 0 ? 0 : Math.round(correct_trials2.count() / trials.count() * 100);
      let rt1 = correct_trials1.count() === 0 ? 0 : Math.round(correct_trials1.select('rt1').mean());
      let rt2 = correct_trials2.count() === 0 ? 0 : Math.round(correct_trials2.select('rt2').mean());
      return "<p>" + accuracy1 + "% der ersten Reize wurden richtig bewertet. (Antwortzeit: " + (rt1 / 1000) + "s)</p>" +
        "<p>" + accuracy2 + "% der zweiten Reize wurden richtig bewertet. (Antwortzeit: " + (rt2 / 1000) + "s)</p>";
    }
  }
}