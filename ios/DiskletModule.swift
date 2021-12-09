@objc (DiskletModule)
class DiskletModule: NSObject {
  let disklet = Disklet()

  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func delete(
    _ path: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      try disklet.delete(path: path)
      resolve(nil)
    } catch {
      reject("EIO", "Could not delete '\(path)'", error)
    }
  }

  @objc func getData(
    _ path: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      resolve(try disklet.getData(path: path).base64EncodedString())
    } catch {
      reject("EIO", "Could not read '\(path)'", error)
    }
  }

  @objc func getText(
    _ path: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      resolve(try disklet.getText(path: path))
    } catch {
      reject("EIO", "Could not read '\(path)'", error)
    }
  }

  @objc func list(
    _ path: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(disklet.list(path: path))
  }

  @objc func setData(
    _ path: String,
    data base64: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      if let data = Data.init(base64Encoded: base64) {
        resolve(try disklet.setData(path: path, data: data))
      } else {
        reject("EIO", "Invalid base64 data", nil)
      }
    } catch {
      reject("EIO", "Could not write '\(path)'", error)
    }
  }

  @objc func setText(
    _ path: String,
    text: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      resolve(try disklet.setText(path: path, text: text))
    } catch {
      reject("EIO", "Could not write '\(path)'", error)
    }
  }
}
