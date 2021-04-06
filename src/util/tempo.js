export let handyKey = ""
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



export function setBPM(bpm) {
    fetch("https://www.handyfeeling.com/api/v1/" + handyKey + "/setMode?mode=1")
    fetch("https://www.handyfeeling.com/api/v1/"+handyKey+"/setSpeed?speed="+bpm+"&type=%25")
    console.log("bpm :", bpm)
}