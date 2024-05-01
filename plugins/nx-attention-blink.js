/**
 * nx-attention-blink
 * Florian Rupprecht
 *
 **/


jsPsych.plugins["attention-blink"] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'attention-blink',
        description: '',
        parameters: {
            stimuli: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'Stimuli',
                default: undefined,
                description: 'The HTML string to be displayed'
            },
            /*targets: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Targets',
                default: undefined,
                description: 'The target array: -1 = No target, 0 = target1, 1 = target2'
            },*/
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
            response_prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Response prompt',
                default: null,
                description: 'Any content here will be displayed during response.'
            },
            single_stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to show the stimulus.'
            },
            single_blank_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Blank duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            response_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Response duration',
                default: null,
                description: 'How long to be able to to respond.'
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
            '<div id="nx-attention-blink-stimulus" style="font-size: 48px;"></div>' +
            '</div>';

        // add prompt
        if (trial.prompt !== null) {
            new_html += trial.prompt;
        }

        // draw
        display_element.innerHTML = new_html;
        var stim = display_element.querySelector('#nx-attention-blink-stimulus');
        var stim_outter = display_element.querySelector('#jspsych-html-keyboard-response-stimulus');

        // store response
        var response1 = {
            rt: null,
            key: null
        };
        var response2 = {
            rt: null,
            key: null
        };


        var next_attention = function (step) {
            stim.innerHTML = trial.stimuli.targets[step] === -1 ? trial.stimuli.stimuli[step] : '<font color="red">' + trial.stimuli.stimuli[step] + '</font>';
            jsPsych.pluginAPI.setTimeout(function () { next_blank(step + 1); }, trial.single_stimulus_duration);
        }
        var next_blank = function (step) {
            stim.innerHTML = '';
            if (step >= trial.stimuli.stimuli.length) {
                jsPsych.pluginAPI.setTimeout(do_response, trial.single_blank_duration);
            } else {
                jsPsych.pluginAPI.setTimeout(function () { next_attention(step); }, trial.single_blank_duration);
            }
        }
        var keyboardListener1 = null;
        var keyboardListener2 = null;
        var do_response = function () {
            stim_outter.innerHTML = trial.response_prompt;
            // start the response listener
                keyboardListener1 = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response1,
                    valid_responses: trial.choices1,
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });
            
                keyboardListener2 = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response2,
                    valid_responses: trial.choices2,
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });
            
            jsPsych.pluginAPI.setTimeout(end_trial, trial.response_duration);
        }

        next_blank(1); // start!

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
                "rt1": response1.rt,
                "rt2": response2.rt,
                "stimuli": trial.stimuli.stimuli,
                "targets": trial.stimuli.targets,
                "key_press1": response1.key,
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
            display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

            // only record the first response
            if (response1.key == null) {
                response1 = info;
            }

            if (trial.response_ends_trial && response2.rt !== null) {
                end_trial();
            }
        };// function to handle responses by the subject
        var after_response2 = function (info) {

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



        /*/ hide stimulus if stimulus_duration is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }*/

    };

    return plugin;
})();
