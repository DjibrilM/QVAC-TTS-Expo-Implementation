import Foundation

let path1 = "file:///Users/jibm/test.wav"
let path2 = "/Users/jibm/test.wav"

let url1 = URL(string: path1)
let url2 = URL(string: path2)

print("URL1 (with file://): \(String(describing: url1))")
print("URL1 isFileURL: \(url1?.isFileURL ?? false)")

print("URL2 (without file://): \(String(describing: url2))")
print("URL2 isFileURL: \(url2?.isFileURL ?? false)")
