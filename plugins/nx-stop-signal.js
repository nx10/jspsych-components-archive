/**
 * nx-stop-signal
 * Florian Rupprecht
 *
 **/


jsPsych.plugins["stop-signal"] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('stop-signal', 'stimulus', 'image');

  plugin.info = {
    name: 'stop-signal',
    description: '',
    parameters: {
      fixation: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Fixation Sign',
        default: '<div style="font-size:60px;">+</div>',
        description: 'The fixation to be displayed'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: null,
        description: 'Duration of the fixation.'
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'First stimulus',
        default: undefined,
        description: 'The first image to be displayed'
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
      isi: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'Inter-Stimulus-Interval (delay of the second stimulus).'
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
    }
  }

  plugin.trial = function (display_element, trial) {

    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' +
      '<div id="nx-stop-signal-stop" style="display:none;">' + generate_svg_triangle('stroke: #fff; stroke-width: 4;', 120, 120, 4, 4, trial.stimulus) + '</div>' +
      '<div id="nx-stop-signal-fixation" style="display:inherit;">' + trial.fixation + '</div>' +
      '<div id="nx-stop-signal-signal" style="display:none;font-size: 48px;">' + trial.stimulus + '</div>' +
      '</div>';

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw the first images
    display_element.innerHTML = new_html;

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
        "rt": (response.rt === null) ? null : response.rt - trial.fixation_duration,
        "stimulus": trial.stimulus,
        "isi": trial.isi,
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
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#nx-stop-signal-stop').style.display = 'none';
      display_element.querySelector('#nx-stop-signal-fixation').style.display = 'none';
      display_element.querySelector('#nx-stop-signal-signal').style.display = 'inherit';

    }, trial.fixation_duration)


    // hide first stimulus if ISI is set
    if (trial.isi !== null) {
      jsPsych.pluginAPI.setTimeout(function () {


        display_element.querySelector('#nx-stop-signal-stop').style.display = 'inherit';
        display_element.querySelector('#nx-stop-signal-fixation').style.display = 'none';
        display_element.querySelector('#nx-stop-signal-signal').style.display = 'none';

      }, trial.isi + trial.fixation_duration);
    }



    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration + trial.fixation_duration);
    }

  };

  return plugin;
})();

function generate_svg(style, w, h, w_exp, h_exp, svg, text) {
  return '<svg style="' + style + '" width="' + (w + w_exp) + '" height="' + (h + h_exp) + '">' + svg +
    '<text x="' + (w / 2) + '" y="' + (h * 0.55) + '" text-anchor="middle" alignment-baseline="central" style="stroke-width:0; fill: #fff; font-size: 48px">' + text + '</text>' +
    '</svg>';
}
function generate_svg_triangle(style, w, h, w_exp, h_exp, text) {
  const w_exp2 = w_exp / 2;
  const h_exp2 = h_exp / 2;
  let svg = '<polygon points="' + w_exp2 + ' ' + (h + h_exp2) + ', ' + (w / 2 + w_exp2) + ' ' + h_exp2 + ', ' + (w + w_exp2) + ' ' + (h + h_exp2) + '" />';
  return generate_svg(style, w, h, w_exp, h_exp, svg, text);
}
