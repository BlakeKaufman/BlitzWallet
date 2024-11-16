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
    
    private init() {/* must use shared instance */}
    
    public func getString(service: String, accessGroup: String, key: String) -> String? {
        os_log("Fetching from keychain for key: %{public}@", key)
        
        // Use the KeychainAccess library with App Group access
        let keychain = Keychain(service: service, accessGroup: accessGroup)
        
        do {
            os_log("Attempting to fetch keychain value for key: %{public}@", key)
            if let value = try keychain.getString(key) {
                os_log("Successfully fetched value from keychain.")
                return value
            } else {
                os_log("Key not found in keychain for key: %{public}@", key)
            }
        } catch let error {
            os_log(.error, "Failed to fetch %{public}@ from keychain with access group %{public}@: %{public}@", key, accessGroup, error.localizedDescription)
        }
        
        os_log("Returning nil as key not found or error occurred.")
        return nil
    }
}
