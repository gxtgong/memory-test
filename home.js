// Microphone set up
function captureMicrophone(callback) {
    if(microphone) {
        callback(microphone);
        return;
    }
    if(typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        alert('This browser does not supports WebRTC getUserMedia API.');
        if(!!navigator.getUserMedia) {
            alert('This browser seems supporting deprecated getUserMedia API.');
        }
    }
    navigator.mediaDevices.getUserMedia({
        audio: isEdge ? true : {
            echoCancellation: false
        }
    }).then(function(mic) {
        callback(mic);
    }).catch(function(error) {
        alert('Unable to capture your microphone. Please check console logs.');
        console.error(error);
    });
}

function replaceAudio(src) {
    var newAudio = document.createElement('audio');
    newAudio.controls = true;
    if(src) {
        newAudio.src = src;
    }
    var parentNode = audio.parentNode;
    parentNode.innerHTML = '';
    parentNode.appendChild(newAudio);
    audio = newAudio;
}

function stopRecordingCallback() {
    replaceAudio(URL.createObjectURL(recorder.getBlob()));
    setTimeout(function() {
        if(!audio.paused) return;
        setTimeout(function() {
            if(!audio.paused) return;
            audio.play();
        }, 1000);
        audio.play();
    }, 300);
    audio.play();
    postFiles();
}

// Global variables

var gifrecorder;
var vidrecorder;

var page_num = 1;
var test_count = 0;

var userData = {};

//change this to your own video srcs
var vs = ["videodataset/Chrish - Indie girl introduces us to her kitchen (Vine)-8SU0gFPMwP8.mp4", "videodataset/Fresh Like You Do-AeS1MNo5rCs.mp4"];

var microphone;
var recorder;
var audio = document.querySelector('audio');
var isRemembered = false;

var vidDOM = document.getElementById("video-test");



$(document).ready(function(){
    
    $("#next-test").click(function(){
        test_count ++;
        $(document).unbind();
        $("#btn-rec").unbind();
        $("#btn-rec").addClass('d-none');
        $("#div-select").addClass('d-none');
        $("audio").addClass('d-none');
        $("#next-test").addClass('d-none');
        if (test_count < vs.length){
            test();
        }else{
            $("#div-test").addClass('d-none');
            nextpage();
        }
    })
});


function nextpage() {
    if (page_num == 1) {
        p1();
    }else if (page_num == 2) {
        p2();
    }else if (page_num == 3) {
        p3();
    }else if (page_num == 4) {
        p4();
    }else{}
}


function p1() {
    $("#div-user").addClass("d-none");
    $("#next-page").addClass("d-none");
    $("#div-test").removeClass("d-none");
    test();
    page_num ++;
    vidDOM.addEventListener('loadedmetadata', function(){
        console.log("LOAD "+test_count);
        setTimeout(function(){
            if (!isRemembered) {
                $("#div-test").addClass('d-none');
                $("#div-select").removeClass('d-none');
                $("#next-test").removeClass('d-none');
                $("#head-message").html("Select an option");
                console.log("isRemembered "+isRemembered);
            }
        }, vidDOM.duration*1000);
    });
}

//end
function p2() {
    $("#head-message").html("Test ends");
}

function p3() {}

function p4() {}

function test(){
    microphone = null;
    recorder = null;
    captureMicrophone(function(mic) {
        microphone = mic;
    });
    console.log("TEST "+test_count);
    $("#div-test").removeClass('d-none');
    isRemembered = false;
    console.log("isRemembered "+isRemembered);
    $("#head-message").html("Hit space when you remember");
    vidDOM.src = vs[test_count];
    vidDOM.play();
    
    $(document).keypress(function(e){
        if(e.keyCode == 32) {
            console.log("KEYPRESS space");
            isRemembered = true;
            console.log("isRemembered "+isRemembered);
            vidDOM.pause();
            $("#head-message").html("Record your description of the video");
            $("#btn-rec").removeClass("d-none");
            $("audio").removeClass("d-none");
            $("#btn-rec").click(function(){
                console.log("CLICK record");
                if ($(this).hasClass("btn-primary")) {
                    console.log("START recording");
                    $(this).removeClass("btn-primary");
                    $(this).addClass("btn-danger");
                    //start recording
                    $("#next-test").addClass('d-none');
                    replaceAudio();
                    audio.muted = true;
                    setSrcObject(microphone, audio);
                    audio.play();
                    var options = {
                        type: 'audio',
                        numberOfAudioChannels: isEdge ? 1 : 2,
                        checkForInactiveTracks: true,
                        bufferSize: 16384
                    };
                    if(navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
                        options.sampleRate = 48000; // or 44100 or remove this line for default
                    }
                    if(recorder) {
                        recorder.destroy();
                        recorder = null;
                    }
                    recorder = RecordRTC(microphone, options);
                    recorder.startRecording();
                }else{
                    console.log("STOP recording");
                    //stop recording
                    $(this).removeClass("btn-danger");
                    $(this).addClass("btn-primary");
                    $("#next-test").removeClass('d-none');
                    recorder.stopRecording(stopRecordingCallback);
                }
            });
        }
    });
}



function endTest(){}



// post video
function postFiles() {
    var blob = recorder.getBlob();
    // getting unique identifier for the file name
    var fileName = 'yes.webm';

    var file = new File([blob], fileName, {
        type: 'audio/webm'
    });
    xhr('/uploadFile', file, function(responseText) { //??
        var fileURL = JSON.parse(responseText).fileURL;
        $('#presult-video').html('Audio successfully saved under '+fileName);
        console.log('Audio successfully saved under '+fileName);
    });
}

// XHR2/FormData
function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.open('POST', url);
    var formData = new FormData();
    formData.append('file', data);
    request.send(formData);
}
