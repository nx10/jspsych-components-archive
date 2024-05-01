/**
 * nx-dual-task
 * Florian Rupprecht
 *
 **/


jsPsych.plugins["dual-task"] = (function () {

  function fixation_dual(a, b) {
    return '<p style="font-size: 48px;">' +
      '<span id="dual-task-t1" style="display: inline-block; width: 100px; visibility: hidden;">' + a + '</span>' +
      '<span id="dual-task-fixation" style="display:inline-block; width: 100px;">+</span>' +
      '<span id="dual-task-t2" style="display: inline-block; width: 100px; visibility: hidden;">' + b +
      '</span></p>';
  }

  var plugin = {};

  plugin.info = {
    name: 'dual-task',
    description: '',
    parameters: {
      stimulus1: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus1',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      stimulus2: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus2',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices1: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices2',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus 1.'
      },
      choices2: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices2',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus 2.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus1_onset: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus 1 onset',
        default: 250,
        description: 'How long to hide the stimulus.'
      },
      stimulus_onset_async: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'SOA',
        default: null,
        description: 'How long between stimuli.'
      },
      stimulus1_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus 1 duration',
        default: 1000,
        description: 'How long to show stimulus 1.'
      },
      stimulus2_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus 2 duration',
        default: 1000,
        description: 'How long to show stimulus 2.'
      },
      blank_end_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Blank end duration',
        default: 500,
        description: 'How long to show blank at the end of the trial.'
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

    let new_html = '<div id="jspsych-html-keyboard-response-stimulus">' +
      fixation_dual(trial.stimulus1, trial.stimulus2) + '</div>';

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // store response
    var response1 = {
      rt: null,
      key: null
    };
    var response2 = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function () {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener1 !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener1);
      }
      if (typeof keyboardListener2 !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener2);
      }

      // gather the data to store for the trial
      var trial_data = {
        "soa": trial.stimulus_onset_async,
        "rt1": response1.key == null ? null : Number(response1.rt) - Number(trial.stimulus1_onset),
        "stimulus1": trial.stimulus1,
        "key_press1": response1.key,
        "rt2": response2.key == null ? null : Number(response2.rt) - (Number(trial.stimulus1_onset) + Number(trial.stimulus_onset_async)),
        "stimulus2": trial.stimulus2,
        "key_press2": response2.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response1 = function (info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      display_element.querySelector('#dual-task-t1').style.visibility = 'hidden';

      // only record the first response
      if (response1.key == null) {
        response1 = info;
      }

      //if (trial.response_ends_trial) {
      //  end_trial();
      //}
    };
    // function to handle responses by the subject
    var after_response2 = function (info) {

      display_element.querySelector('#dual-task-t2').style.visibility = 'hidden';

      if (response1.key == null) {
        return;
      }

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response2.key == null) {
        response2 = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices1 != jsPsych.NO_KEYS) {
      var keyboardListener1 = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response1,
        valid_responses: trial.choices1,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }
    // start the response listener
    if (trial.choices2 != jsPsych.NO_KEYS) {
      var keyboardListener2 = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response2,
        valid_responses: trial.choices2,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // show stimuli
    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#dual-task-t1').style.visibility = 'visible';
    }, trial.stimulus1_onset);

    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#dual-task-t2').style.visibility = 'visible';
    }, (Number(trial.stimulus1_onset) + Number(trial.stimulus_onset_async)));


    // end trial if trial_duration is set

    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#dual-task-t1').style.visibility = 'hidden';
    }, (Number(trial.stimulus1_onset) + Number(trial.stimulus1_duration)));

    jsPsych.pluginAPI.setTimeout(function () {
      display_element.querySelector('#dual-task-t2').style.visibility = 'hidden';
    }, (Number(trial.stimulus1_onset) +
      Number(trial.stimulus_onset_async) +
      Number(trial.stimulus2_duration)));

    jsPsych.pluginAPI.setTimeout(function () {
      end_trial();
    }, (Number(trial.stimulus1_onset) +
      Number(trial.stimulus_onset_async) +
      Number(trial.stimulus2_duration) +
      Number(trial.blank_end_duration)));
  };

  return plugin;
})();
