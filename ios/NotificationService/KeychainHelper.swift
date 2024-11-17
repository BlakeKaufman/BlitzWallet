//
//  KeychainHelper.swift
//  BlitzWallet
//
//  Created by Blake Kaufman on 11/15/24.
//
import Foundation
import KeychainAccess
import os.log

public class KeychainHelper {
    public static let shared = KeychainHelper()
    
    private init() {}
    
    public func getString(service: String, accessGroup: String, key: String) -> String? {
        os_log("Fetching from keychain for key: %{public}@", key)
        
        // Try with different service name patterns that Expo might use
        let servicesToTry = [
            "app",                    // Default Expo service
            "app:no-auth",           // Non-authenticated Expo service
            "app:auth",              // Authenticated Expo service
            accessGroup,                  // Custom service name
            "\(accessGroup):no-auth",    // Custom service with no-auth
            "\(accessGroup):auth"        // Custom service with auth
        ]
        
        for serviceToTry in servicesToTry {
            let keychain = Keychain(service: serviceToTry, accessGroup: accessGroup)
                .synchronizable(true)
            
            do {
                os_log("Trying service: %{public}@", serviceToTry)
                if let value = try keychain.getString(key) {
                    os_log("Successfully fetched value from keychain with service: %{public}@ with value: %{public}@", serviceToTry ,value)
                    return value
                }
            } catch let error {
                os_log(.error, "Failed to fetch with service %{public}@: %{public}@",
                      serviceToTry, error.localizedDescription)
            }
        }
        
        // If we haven't found the value, try raw keychain query to match Expo's exact format
        return getStringUsingExpoFormat(key: key, service: "app")
    }
    
    private func getStringUsingExpoFormat(key: String, service: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrGeneric as String: Data(key.utf8),
            kSecAttrAccount as String: Data(key.utf8),
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnData as String: true
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess,
              let itemData = item as? Data,
              let string = String(data: itemData, encoding: .utf8) else {
            return nil
        }
        
        return string
    }
    
    // Debug helper
  public func dumpKeychainContents(service: String, accessGroup: String, key: String) {
        let servicesToTry = [
            "app",
            "app:no-auth",
            "app:auth",
            service,
            "\(service):no-auth",
            "\(service):auth"
        ]
        
        for serviceToTry in servicesToTry {
            let keychain = Keychain(service: serviceToTry, accessGroup: accessGroup)
                .synchronizable(true)
            
            do {
              let allKeys = try keychain.getString(key)
                os_log("Service: %{public}@ - Keys found: %{public}@",
                      serviceToTry, allKeys ?? "NO KEY FOUND")
               
            } catch {
                os_log(.error, "Failed to dump keychain contents for service %{public}@: %{public}@",
                      serviceToTry, error.localizedDescription)
            }
        }
    }
}
