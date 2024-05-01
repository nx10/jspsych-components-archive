/**
 * nx-html-timer
 * Florian Rupprecht
 *
 **/

jsPsych.plugins["html-timer"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-timer',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
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
        description: 'How long to show the trial.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
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

    // display stimulus
    var html = '<div id="jspsych-html-timer-stimulus">'+trial.stimulus+'</div>';

    // display timer
    html += '<div id="countdown">' +
            '  <div id="countdown-number"></div>' +
            '  <svg id="countdown-svg">' +
            '    <circle id="countdown-svg-circle" r="18" cx="20" cy="20"></circle>' +
            '  </svg>' +
            '</div>';


    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    display_element.innerHTML = html;

    let countdownNumberEl = document.getElementById('countdown-number');
    const countdown_max = (trial.trial_duration / 1000);
    let countdown = countdown_max;

    countdownNumberEl.textContent = countdown;

    setInterval(function() {
      countdown = --countdown <= 0 ? countdown_max : countdown;
      countdownNumberEl.textContent = countdown;
    }, 1000);
    
    let elt = document.getElementById("countdown-svg-circle");
    elt.style.animation = "countdown " + countdown_max + "s linear infinite forwards";

    // start time
    var start_time = performance.now();

    // store response
    var response = {
      rt: null,
      key: null,
    };


    var after_response = function(info) {

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial && response.rt !== null) {
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

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    }

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-button-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
