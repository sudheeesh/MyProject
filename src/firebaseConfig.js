import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

// No initializeApp needed. RN Firebase auto-loads google-services.json

export { auth, messaging };
