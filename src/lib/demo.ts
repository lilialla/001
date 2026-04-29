import type { User } from 'firebase/auth';
import { fromZonedTime } from 'date-fns-tz';
import type { Event, Space, UserProfile } from './api';

export const SHOWCASE_MODE = import.meta.env.VITE_SHOWCASE_MODE !== 'false';

export const DEMO_USER_ID = 'demo-me';
export const DEMO_PARTNER_ID = 'demo-partner';

export const demoUser = {
  uid: DEMO_USER_ID,
  displayName: '我',
  email: 'demo@example.com',
  photoURL: './assets/the-thinker.png',
} as User;

export const demoProfile: UserProfile = {
  displayName: '我',
  email: 'demo@example.com',
  photoURL: './assets/the-thinker.png',
  timezone: 'Asia/Shanghai',
};

export const demoPartnerProfile: UserProfile = {
  displayName: 'Her',
  email: 'partner@example.com',
  photoURL: './assets/la-fille-des-fleurs.png',
  timezone: 'Europe/London',
};

export const demoSpace: Space = {
  id: 'ETERNAL-SEASONS',
  members: [DEMO_USER_ID, DEMO_PARTNER_ID],
  createdAt: Date.now(),
};

const today = new Date();
const datePart = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

function at(hour: number, minute = 0, timezone = 'Asia/Shanghai') {
  const timePart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  return fromZonedTime(`${datePart}T${timePart}`, timezone).getTime();
}

export const demoEvents: Event[] = [
  {
    id: 'demo-tea',
    title: '下午茶',
    startTime: at(14),
    endTime: at(15),
    userId: DEMO_USER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-wakeup',
    title: 'Wake Up',
    startTime: at(7, 0, 'Europe/London'),
    endTime: at(8, 0, 'Europe/London'),
    userId: DEMO_PARTNER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-focus',
    title: '专注工作',
    startTime: at(15),
    endTime: at(17),
    userId: DEMO_USER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-morning',
    title: 'Morning Routine',
    startTime: at(8, 0, 'Europe/London'),
    endTime: at(9, 0, 'Europe/London'),
    userId: DEMO_PARTNER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-walk',
    title: '晚间散步',
    startTime: at(18),
    endTime: at(19),
    userId: DEMO_USER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-deep-work',
    title: 'Deep Work',
    startTime: at(11, 0, 'Europe/London'),
    endTime: at(13, 0, 'Europe/London'),
    userId: DEMO_PARTNER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-call-me',
    title: 'Daily Video Call',
    startTime: at(20),
    endTime: at(21),
    userId: DEMO_USER_ID,
    color: '#d9eba1',
  },
  {
    id: 'demo-call-partner',
    title: 'Daily Video Call',
    startTime: at(13, 0, 'Europe/London'),
    endTime: at(14, 0, 'Europe/London'),
    userId: DEMO_PARTNER_ID,
    color: '#d9eba1',
  },
  {
    id: 'demo-sleep',
    title: '晚安',
    startTime: at(23),
    endTime: at(23, 45),
    userId: DEMO_USER_ID,
    color: '#f5f2dc',
  },
  {
    id: 'demo-gym',
    title: 'Gym Session',
    startTime: at(16, 0, 'Europe/London'),
    endTime: at(17, 0, 'Europe/London'),
    userId: DEMO_PARTNER_ID,
    color: '#f5f2dc',
  },
];
