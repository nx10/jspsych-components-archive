/**
 * nx-switch-task
 * Florian Rupprecht
 *
 **/

jsPsych.plugins["switch-task"] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'switch-task',
    description: '',
    parameters: {
      fixation: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus fixation',
        default: '<div style="font-size:60px;">+</div>',
        description: 'The HTML string of the fixation'
      },
      target: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus target',
        default: undefined,
        description: 'The target number'
      },
      cue: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus cue',
        default: undefined,
        description: 'The cue ID'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      cti: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Cue target intervall',
        default: true,
        description: 'Time between cue and target.'
      },

    }
  }

  plugin.trial = function (display_element, trial) {

    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' +
      '<div id="nx-switch-task-cue" style="display:none;">' + gen_shape(trial.cue, 'stroke: #fff; stroke-width: 4;', 120, 120, 4, 4, '') + '</div>' +
      '<div id="nx-switch-task-fixation" style="display:inherit;">' + trial.fixation + '</div>' +
      '<div id="nx-switch-task-target" style="display:none;">' + gen_shape(trial.cue, 'stroke: #fff; stroke-width: 4;', 120, 120, 4, 4, trial.target) + '</div>' +
      '</div>';

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    var keyboardListener;

    const ftime = Math.max(0, 1000 - trial.cti);
    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#nx-switch-task-cue').style.display = 'inherit';
      display_element.querySelector('#nx-switch-task-fixation').style.display = 'none';
      display_element.querySelector('#nx-switch-task-target').style.display = 'none';
    }, ftime);
    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#nx-switch-task-cue').style.display = 'none';
      display_element.querySelector('#nx-switch-task-fixation').style.display = 'none';
      display_element.querySelector('#nx-switch-task-target').style.display = 'inherit';

      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

    }, ftime + trial.cti);
    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#nx-switch-task-cue').style.display = 'none';
      display_element.querySelector('#nx-switch-task-fixation').style.display = 'none';
      display_element.querySelector('#nx-switch-task-target').style.display = 'none';
      end_trial();
    }, ftime + trial.cti + 1500);

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function () {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "cti": trial.cti,
        "cue": trial.cue,
        "target": trial.target,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function (info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    //if (trial.choices != jsPsych.NO_KEYS) {

    //}

    // hide stimulus if stimulus_duration is set
    /*if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }
 
    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }*/

  };

  return plugin;
})();

function gen_shapes(style, w, h, w_exp, h_exp, text) {
  return generate_svg_circle(style, w, h, w_exp, h_exp, text) +
    generate_svg_rectangle(style, w, h, w_exp, h_exp, text) +
    generate_svg_triangle(style, w, h, w_exp, h_exp, text) +
    generate_svg_rhombus(style, w, h, w_exp, h_exp, text);
}
function gen_shape(shape, style, w, h, w_exp, h_exp, text) {
  switch (shape) {
    case 0:
      return generate_svg_circle(style, w, h, w_exp, h_exp, text);
    case 1:
      return generate_svg_rectangle(style, w, h, w_exp, h_exp, text);
    case 2:
      return generate_svg_triangle(style, w, h, w_exp, h_exp, text);
    case 3:
      return generate_svg_rhombus(style, w, h, w_exp, h_exp, text);
    default:
      return 'WRONG SHAPE ID';
  }
}

function generate_svg(style, w, h, w_exp, h_exp, svg, text) {

  return '<svg style="' + style + '" width="' + (w + w_exp) + '" height="' + (h + h_exp) + '">' + svg +
    '<text x="' + (w * 0.5) + '" y="' + (h * 0.5) + '" text-anchor="middle" alignment-baseline="central" style="stroke-width:0; fill: #fff; font-size: 48px">' + text + '</text>' +
    '</svg>';
}
function generate_svg_circle(style, w, h, w_exp, h_exp, text) {
  let svg = '<ellipse cx="' + (w / 2 + w_exp / 2) + '" cy="' + (h / 2 + h_exp / 2) + '" rx="' + (w / 2) + '" ry="' + (h / 2) + '"></ellipse>';
  return generate_svg(style, w, h, w_exp, h_exp, svg, text);
}
function generate_svg_rectangle(style, w, h, w_exp, h_exp, text) {
  let svg = '<rect x="' + (w_exp / 2) + '" y="' + (h_exp / 2) + '" width="' + w + '" height="' + h + '"></rect>';
  return generate_svg(style, w, h, w_exp, h_exp, svg, text);
}
function generate_svg_triangle(style, w, h, w_exp, h_exp, text) {
  const w_exp2 = w_exp / 2;
  const h_exp2 = h_exp / 2;
  let svg = '<polygon points="' + w_exp2 + ' ' + (h + h_exp2) + ', ' + (w / 2 + w_exp2) + ' ' + h_exp2 + ', ' + (w + w_exp2) + ' ' + (h + h_exp2) + '" />';
  return generate_svg(style, w, h, w_exp, h_exp, svg, text);
}
function generate_svg_rhombus(style, w, h, w_exp, h_exp, text) {
  const w_exp2 = w_exp / 2;
  const h_exp2 = h_exp / 2;
  let svg = '<polygon points="' + w_exp2 + ' ' + (h / 2 + h_exp2) + ', ' + (w / 2 + w_exp2) + ' ' + h_exp2 + ', ' + (w + w_exp2) + ' ' + (h / 2 + h_exp2) + ', ' + (w / 2 + w_exp2) + ' ' + (h + h_exp2) + '" />';
  return generate_svg(style, w, h, w_exp, h_exp, svg, text);
}
