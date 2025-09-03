import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ===== USER MANAGEMENT =====

// Trigger: When a new user signs up
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log('New user created:', user.uid);
  
  // Create user profile in Firestore
  const userProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    role: 'user',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('users').doc(user.uid).set(userProfile);
  
  // Send welcome email (TODO: integrate with SendGrid/Brevo)
  console.log('Welcome email would be sent to:', user.email);
  
  return null;
});

// ===== MERCHANT SYNCHRONIZATION =====

// Sync merchant data between Supabase and Firestore
export const syncMerchantData = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { merchantId, merchantData } = data;
  
  try {
    // Update or create merchant settings in Firestore
    await db.collection('merchant_settings').doc(merchantId).set({
      ...merchantData,
      lastSync: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    return { success: true, message: 'Merchant data synced successfully' };
  } catch (error) {
    console.error('Error syncing merchant data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to sync merchant data');
  }
});

// ===== EVENT MANAGEMENT =====

// Create a new event
export const createEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const merchantId = context.auth.uid;
  const { title, description, startDate, endDate, category, location } = data;
  
  try {
    // Create event in Firestore
    const eventRef = await db.collection('events_live').add({
      merchantId,
      title,
      description,
      startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(endDate)),
      category,
      location,
      status: 'pending',
      attendees: [],
      attendeesCount: 0,
      viewsCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Initialize event counter
    await db.collection('counters').doc(eventRef.id).set({
      views: 0,
      attendees: 0,
      likes: 0,
    });
    
    return { 
      success: true, 
      eventId: eventRef.id,
      message: 'Event created successfully' 
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create event');
  }
});

// Increment event view counter
export const incrementEventView = functions.https.onCall(async (data, context) => {
  const { eventId } = data;
  
  try {
    // Increment counter
    await db.collection('counters').doc(eventId).update({
      views: admin.firestore.FieldValue.increment(1),
    });
    
    // Log analytics event
    await db.collection('analytics_events').add({
      type: 'event_view',
      eventId,
      userId: context.auth?.uid || 'anonymous',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error incrementing view:', error);
    throw new functions.https.HttpsError('internal', 'Failed to increment view');
  }
});

// ===== NOTIFICATIONS =====

// Send notification to user
export const sendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { userId, title, message, type, data: notificationData } = data;
  
  try {
    // Create notification in Firestore
    await db.collection('notifications').doc(userId).collection('items').add({
      title,
      message,
      type,
      data: notificationData,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // TODO: Send push notification if user has FCM token
    
    return { success: true, message: 'Notification sent' };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// ===== SCHEDULED FUNCTIONS =====

// Clean up old temporary files daily
export const cleanupTempFiles = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: 'temp/' });
  
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const deletePromises = files
    .filter(file => {
      const createdTime = new Date(file.metadata.timeCreated);
      return createdTime < oneDayAgo;
    })
    .map(file => file.delete());
  
  await Promise.all(deletePromises);
  console.log(`Deleted ${deletePromises.length} old temporary files`);
  
  return null;
});

// Update event statistics daily
export const updateEventStats = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const eventsSnapshot = await db.collection('events_live')
    .where('status', '==', 'published')
    .get();
  
  const updatePromises = eventsSnapshot.docs.map(async (doc) => {
    const eventId = doc.id;
    
    // Get counter data
    const counterDoc = await db.collection('counters').doc(eventId).get();
    const counterData = counterDoc.data() || { views: 0, attendees: 0, likes: 0 };
    
    // Update event document with aggregated stats
    return doc.ref.update({
      viewsCount: counterData.views,
      attendeesCount: counterData.attendees,
      likesCount: counterData.likes,
      statsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  
  await Promise.all(updatePromises);
  console.log(`Updated stats for ${updatePromises.length} events`);
  
  return null;
});

// ===== CHAT FUNCTIONS =====

// Create a chat room between merchant and customer
export const createChatRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { merchantId, customerId } = data;
  const participants = [merchantId, customerId].sort();
  const roomId = participants.join('_');
  
  try {
    // Create or get existing chat room
    await db.collection('chat_rooms').doc(roomId).set({
      participants,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
    }, { merge: true });
    
    return { success: true, roomId };
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create chat room');
  }
});

// Send a chat message
export const sendChatMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { roomId, message, type = 'text' } = data;
  const senderId = context.auth.uid;
  
  try {
    // Verify user is participant
    const roomDoc = await db.collection('chat_rooms').doc(roomId).get();
    if (!roomDoc.exists || !roomDoc.data()?.participants.includes(senderId)) {
      throw new functions.https.HttpsError('permission-denied', 'Not a participant of this chat');
    }
    
    // Add message
    const messageRef = await db.collection('chat_rooms').doc(roomId)
      .collection('messages').add({
        senderId,
        message,
        type,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    
    // Update room with last message
    await roomDoc.ref.update({
      lastMessage: message,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Send notification to other participant
    const otherParticipant = roomDoc.data()?.participants.find((p: string) => p !== senderId);
    if (otherParticipant) {
      await db.collection('notifications').doc(otherParticipant).collection('items').add({
        title: 'Nouveau message',
        message: message.substring(0, 100),
        type: 'chat',
        data: { roomId, messageId: messageRef.id },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send message');
  }
});

// ===== MODERATION =====

// Moderate content (to be enhanced with AI)
export const moderateContent = functions.firestore
  .document('events_live/{eventId}')
  .onCreate(async (snap, context) => {
    const event = snap.data();
    const eventId = context.params.eventId;
    
    // Basic moderation checks
    const bannedWords = ['spam', 'scam']; // Add more words
    const contentToCheck = `${event.title} ${event.description}`.toLowerCase();
    
    const containsBannedWords = bannedWords.some(word => contentToCheck.includes(word));
    
    if (containsBannedWords) {
      // Flag for manual review
      await snap.ref.update({
        status: 'flagged',
        moderationNote: 'Content contains banned words',
        moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Notify admins
      console.log('Event flagged for moderation:', eventId);
    } else {
      // Auto-approve
      await snap.ref.update({
        status: 'published',
        moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return null;
  });