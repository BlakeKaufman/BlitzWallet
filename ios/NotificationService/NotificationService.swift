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

fileprivate let logger = OSLog(subsystem: "com.blitzwallet.application", category: "BlitzNotifications")

fileprivate let appGroup = "group.com.blitzwallet.application"
fileprivate let keychainAccessGroup = "38WX44YTA6.com.blitzwallet.SharedKeychain"
fileprivate let accountMnemonic: String = "mnemonic"
fileprivate let accountApiKey: String = "BREEZ_SDK_API_KEY"


class NotificationService: SDKNotificationService {
    // Override the `getConnectRequest` function
    override func getConnectRequest() -> ConnectRequest? {
        os_log("Starting getConnectRequest process", log: logger, type: .info)
        
        // Get the Breez API key from the target bundle's Info.plist
        guard let apiKey = Bundle.main.object(forInfoDictionaryKey: accountApiKey) as? String else {
            os_log("Failed to retrieve API key from Info.plist", log: logger, type: .error)
            return nil
        }
        os_log("Successfully retrieved API key", log: logger, type: .debug)
      
     
        // Configure the SDK
        var config = defaultConfig(envType: EnvironmentType.production,
                                 apiKey: apiKey,
                                 nodeConfig: NodeConfig.greenlight(
                                    config: GreenlightNodeConfig(partnerCredentials: nil,
                                                               inviteCode: nil)))
      
     
        // Set working directory
        let workingDir = FileManager
            .default.containerURL(forSecurityApplicationGroupIdentifier: appGroup)?
            .appendingPathComponent("breezSdk", isDirectory: true)
            .absoluteString
      
      
        if let workingDir = workingDir {
            os_log("Setting working directory: %{public}@", log: logger, type: .debug, workingDir)
            config.workingDir = workingDir
        } else {
            os_log("Failed to create working directory path", log: logger, type: .error)
            return nil
        }
        
        // Get service name
        let service = Bundle.main.bundleIdentifier!.replacingOccurrences(of: ".NotificationService", with: "")
        os_log("Service identifier: %{public}@", log: logger, type: .debug, service)
        
        // Retrieve mnemonic
        guard let mnemonic = KeychainHelper.shared.getString(service: service,
                                                           accessGroup: keychainAccessGroup,
                                                           key: accountMnemonic) else {
            os_log("Failed to retrieve mnemonic from keychain", log: logger, type: .error)
            return nil
        }
        os_log("Successfully retrieved mnemonic from keychain", log: logger, type: .debug)
        
        // Convert mnemonic to seed
        do {
            let seed = try mnemonicToSeed(phrase: mnemonic)
            os_log("Successfully converted mnemonic to seed", log: logger, type: .debug)
            
            os_log("Creating ConnectRequest with configured parameters", log: logger, type: .info)
            return ConnectRequest(config: config, seed: seed)
        } catch {
            os_log("Failed to convert mnemonic to seed: %{public}@", log: logger, type: .error, error.localizedDescription)
            return nil
        }
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
