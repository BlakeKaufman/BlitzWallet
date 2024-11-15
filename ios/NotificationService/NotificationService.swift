//
//  NotificationService.swift
//  NotificationService
//
//  Created by Blake Kaufman on 11/9/24.
//

import UserNotifications
import KeychainAccess
import BreezSDK
import os.log


fileprivate let appGroup = "group.com.blitzwallet.application"
fileprivate let keychainGroup = "com.blitzwallet.SharedKeychain"
fileprivate let accountMnemonic: String = "mnemonic"
fileprivate let accountApiKey: String = "BREEZ_SDK_API_KEY"

class NotificationService: SDKNotificationService {
  // Override the `getConnectRequest` function
  override func getConnectRequest() -> ConnectRequest? {
    os_log("RUNNING IN GET CONNECT REQUEST")
    // Get the Breez API key from the target bundle's Info.plist
    guard let apiKey = Bundle.main.object(forInfoDictionaryKey: accountApiKey) as? String else {
      os_log(.error, "API key not found")
      return nil
    }
    var config = defaultConfig(envType: EnvironmentType.production,
                               apiKey: apiKey,
                               nodeConfig: NodeConfig.greenlight(
                                config: GreenlightNodeConfig(partnerCredentials: nil,
                                                             inviteCode: nil)))
    // Set the workingDir as the app group's shared directory,
    // this should be the same directory as the main application uses
    config.workingDir = FileManager
      .default.containerURL(forSecurityApplicationGroupIdentifier: appGroup)!
      .appendingPathComponent("breezSdk", isDirectory: true)
      .absoluteString

    // Get the mnemonic from the shared keychain using the same
    // service name as the main application
    let service = Bundle.main.bundleIdentifier!.replacingOccurrences(of: ".NotificationService", with: "")
    let keychain = Keychain(service: service, accessGroup: keychainGroup)
    guard let mnemonic = try? keychain.getString(accountMnemonic) else {
      os_log(.error, "Mnemonic not found")
      return nil
    }
    // Convert the mnenonic to a seed
    guard let seed = try? mnemonicToSeed(phrase: mnemonic) else {
      os_log(.error, "Invalid seed")
      return nil
    }
    os_log("SENDING CONNECT REQUEST")
    return ConnectRequest(config: config, seed: seed)
  }
}


//class NotificationService: UNNotificationServiceExtension {
//
//    var contentHandler: ((UNNotificationContent) -> Void)?
//    var bestAttemptContent: UNMutableNotificationContent?
//
//    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
//        self.contentHandler = contentHandler
//        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
//        
//        if let bestAttemptContent = bestAttemptContent {
//            // Modify the notification content here...
//            bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"
//            
//            contentHandler(bestAttemptContent)
//        }
//    }
//    
//    override func serviceExtensionTimeWillExpire() {
//        // Called just before the extension will be terminated by the system.
//        // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
//        if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
//            contentHandler(bestAttemptContent)
//        }
//    }
//
//}
