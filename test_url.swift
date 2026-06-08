import Foundation
import AVFoundation

let path = "/Users/jibm/Desktop/projects/qvac-course-projects/offline-mobile-tts/test.wav"
let url = URL(string: path)
print("URL from string: \(String(describing: url))")

if let u = url {
    do {
        let player = try AVAudioPlayer(contentsOf: u)
        print("Success")
    } catch {
        print("Error: \(error.localizedDescription)")
    }
}
