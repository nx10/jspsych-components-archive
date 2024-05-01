/**
 * nx-html-double-keyboard-response
 * Florian Rupprecht
 *
 **/


jsPsych.plugins["html-double-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-double-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices1: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices1',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      choices2: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices2',
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

    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+trial.stimulus+'</div>';

    // add prompt
    if(trial.prompt !== null){
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
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt1": response1.rt,
        "rt2": response2.rt,
        "stimulus": trial.stimulus,
        "key_press1": response1.key,
        "key_press2": response2.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response1 = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response1.key == null) {
        response1 = info;
      }

      if (trial.response_ends_trial && response2.rt !== null) {
        end_trial();
      }
    };// function to handle responses by the subject
    var after_response2 = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response2.key == null) {
        response2 = info;
      }

      if (trial.response_ends_trial && response1.rt !== null) {
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
    if (trial.choices2 != jsPsych.NO_KEYS) {
      var keyboardListener2 = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response2,
        valid_responses: trial.choices2,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
