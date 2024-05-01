// Miscellaneous helper functions

// timeline tree view

const _cross = " ├─";
const _corner = " └─";
const _vertical = " │ ";
const _space = "   ";
function _printTimelineNode(node, indent) {
    let r = "";
    let nodeName = " ? ";
    let numberOfChildren = 0;
    if (Object.prototype.hasOwnProperty.call(node, 'type')) {
        nodeName = node.type;
    }
    let rp = "";
    if (Object.prototype.hasOwnProperty.call(node, 'timeline_variables')) {
        rp += "*" + node.timeline_variables.length;
    }
    if (Object.prototype.hasOwnProperty.call(node, 'repetitions')) {
        rp += "*" + node.repetitions;
    }
    if (Object.prototype.hasOwnProperty.call(node, 'timeline')) {
        numberOfChildren = node.timeline.length;
    }
    r += nodeName + (rp.length > 0 ? "(" + rp + ")" : "") + "\n";
    for (let i = 0; i < numberOfChildren; i++) {
        let child = node.timeline[i];
        let isLast = (i == (numberOfChildren - 1));
        r += _printTimelineChildNode(child, indent, isLast);
    }
    return r;
}
function _printTimelineChildNode(node, indent, isLast) {
    let r = indent;
    if (isLast) {
        r += _corner;
        indent += _space;
    } else {
        r += _cross;
        indent += _vertical;
    }
    return r + _printTimelineNode(node, indent);
}
function printTimeline(tl) {
    return _printTimelineNode(Object.prototype.toString.call(tl) === '[object Array]' ? { timeline: tl } : tl, "");
}


// likert style forms for 'survey-html-form' plugin

function generate_likert(name, scale) {
    let html = '<ul class="jspsych-survey-likert-opts" data-name="' + name + '" data-radio-group="' + name + '">';
    for (let i = 0; i < scale.length; i++) {
        html += '<li style="width:' + Math.round(1 / scale.length * 100) + '%"><input type="radio" name="' + name + '" value="' + scale[i] + '"><label class="jspsych-survey-likert-opt-label">' + scale[i] + '</label></li>'
    }
    return html + '</ul>';
}
function generate_likert_style(w) {
    let html = '<style id="jspsych-survey-likert-css">';
    html += ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }" +
        ".jspsych-survey-likert-opts { list-style:none; width:" + w + "; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }" +
        ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }" +
        ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }" +
        ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }" +
        ".jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }" +
        ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
    return html + '</style>';
}