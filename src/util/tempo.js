export let handyKey = "" // <-- put your key here 
let strokeLength = 90
let currentSpeed = -1;
let lastRequest = Date.now()
let handyOn = false
export let enabled = true
export default function tempo(data) {
    let context = new window.AudioContext()
    context.decodeAudioData(data).then(value => {

        console.log("audio buffer : ", value)
        setBPM(analyse(value))
    }
    )
}

function analyse(audiobuffer) {
    let data = audiobuffer.getChannelData(0)
    console.log("audio buffer data : ", data)
    let peaks = getPeaksAtThreshold(data, 0.0001)
    console.log("audio buffer peaks :", peaks)
    let bpm = ((peaks.length - 1) / audiobuffer.duration) / 2   // it works ? that’s strange
    bpm = Math.floor(bpm / 10) * 10 // round by 10
    return bpm
}

function getPeaksAtThreshold(data, threshold) {
    var peaksArray = [];
    var length = data.length;
    let reached = false;
    for (var i = 0; i < length; ++i) {
        if (reached && data[i] < threshold) reached = false;
        else if (data[i] > threshold && !reached) {
            reached = true;
            peaksArray.push(i);
        }

    }
    return peaksArray;
}

export function setUpHandy() {
    fetch("https://www.handyfeeling.com/api/v1/" + handyKey + "/getSettings").then(value => value.json()).then(json => {
        if (json.stroke) {
            strokeLength = json.stroke
        }
        setHandySpeed(0);
    })
    

}
setUpHandy()


export function setBPM(bpm) {

    console.log("bpm :", bpm)
    setHandySpeed((bpm * strokeLength) / 60)
}
function setHandySpeed(speed) {
    if (speed > 350) speed = 350
    if (speed < 5) {
        currentSpeed = 0;
        if(handyOn){
            handyOn = false;
            return fetch("https://www.handyfeeling.com/api/v1/" + handyKey + "/setMode?mode=0")
        }
        return
    }
    
    if ((speed != currentSpeed && lastRequest + 2 * 1000 < Date.now())) {
        if(!handyOn){
            fetch("https://www.handyfeeling.com/api/v1/" + handyKey + "/setMode?mode=1")
            handyOn = true
        }
        fetch("https://www.handyfeeling.com/api/v1/" + handyKey + "/setSpeed?speed=" + speed).then(value => value.json()).then(value => console.log("handy response :", value))
        currentSpeed = speed;
        lastRequest = Date.now();
    }
}