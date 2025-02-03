package com.blitzwallet

import android.annotation.SuppressLint
import android.content.Intent
import androidx.core.content.ContextCompat
import breez_sdk_notification.Constants
import breez_sdk_notification.Message
import breez_sdk_notification.MessagingService
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

@SuppressLint("MissingFirebaseInstanceTokenRefresh")
class ExampleFcmService : MessagingService, FirebaseMessagingService() {
    companion object {
        private const val TAG = "FcmService"
    }

    // Override the `onMessageReceived` to handle the remote message
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Check if the message is high priority and can be handled
        if (remoteMessage.priority == RemoteMessage.PRIORITY_HIGH) {
            remoteMessage.asMessage()?.also { message -> 
                // Call `startServiceIfNeeded` to check if the foreground
                // service is needed depending on the message type and 
                // foreground state of the application
                startServiceIfNeeded(applicationContext, message)
            }
        }
    }

    // A helper function the convert the `RemoteMessage` 
    // to a notification plugin 'Message'
    private fun RemoteMessage.asMessage(): Message? {
        return data[Constants.MESSAGE_DATA_TYPE]?.let {
            Message(
                data[Constants.MESSAGE_DATA_TYPE], data[Constants.MESSAGE_DATA_PAYLOAD]
            )
        }
    }

    // Override the `startForegroundService` function to start the foreground service
    // using the `BreezForegroundService` handler
    override fun startForegroundService(message: Message) {
        val intent = Intent(applicationContext, BreezForegroundService::class.java)
        intent.putExtra(Constants.EXTRA_REMOTE_MESSAGE, message)
        ContextCompat.startForegroundService(applicationContext, intent)
    }
}
