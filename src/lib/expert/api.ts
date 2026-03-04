import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import type { ExpertChatRequest, ExpertChatResponse } from './types';

// V3 Agent uses Firestore real-time listeners, removing expert_chat_v3 HTTP callable.
// V2 Agent used expert_chat_v2
