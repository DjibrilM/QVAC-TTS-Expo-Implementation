import re

file_path = "node_modules/@simform_solutions/react-native-audio-waveform/ios/AudioPlayer.swift"

with open(file_path, "r") as f:
    content = f.read()

# We want to replace:
#      do {
#        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
#        try AVAudioSession.sharedInstance().setActive(true)
#        player = try AVAudioPlayer(contentsOf: audioUrl!)
# with:
#      do {
#        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
#        try? AVAudioSession.sharedInstance().setActive(true)
#        player = try AVAudioPlayer(contentsOf: audioUrl!)

content = content.replace("try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])", "try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])")
content = content.replace("try AVAudioSession.sharedInstance().setActive(true)", "try? AVAudioSession.sharedInstance().setActive(true)")

with open(file_path, "w") as f:
    f.write(content)
