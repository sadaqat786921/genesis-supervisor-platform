// Sample data for the Genesis Supervisor prototype. All names and figures are examples.

export type Tone = 'ok' | 'warn' | 'err' | 'info' | 'neutral' | 'brand';
export type Plan = 12 | 16 | 20;
export const PLAN = {
  12: { limit: 150, label: '12% plan' },
  16: { limit: 200, label: '16% plan' },
  20: { limit: 300, label: '20% plan' },
} as const;

export interface Staff { id: string; name: string; role: 'Supervisor' | 'Office Admin'; photo?: string; initials: string; color: string }
export const STAFF: Staff[] = [
  { id: 'sk', name: 'Sarah Khan', role: 'Supervisor', photo: 'images/sarah.jpg', initials: 'SK', color: '#153D91' },
  { id: 'et', name: 'Emma Thompson', role: 'Office Admin', photo: 'images/av3.jpg', initials: 'ET', color: '#099FFD' },
  { id: 'jc', name: 'James Carter', role: 'Office Admin', photo: 'images/av1.jpg', initials: 'JC', color: '#5BAF00' },
  { id: 'ps', name: 'Priya Shah', role: 'Office Admin', initials: 'PS', color: '#153D91' },
  { id: 'lm', name: 'Liam Murphy', role: 'Office Admin', photo: 'images/av5.jpg', initials: 'LM', color: '#B54708' },
];
export const ADMINS = STAFF.filter(s => s.role === 'Office Admin');

export interface Landlord { id: string; name: string; email: string; phone: string; billing: string; plan: Plan; start: string; admin: string; status: 'Active' | 'Invite sent'; budget: number; used: number }
export const LANDLORDS: Landlord[] = [
  { id: 'L1', name: 'Margaret Okafor', email: 'm.okafor@mail.co.uk', phone: '07700 900111', billing: '12 Oak Street, Leeds LS6 2AB', plan: 16, start: '01 Apr 2026', admin: 'et', status: 'Active', budget: 1800, used: 1296 },
  { id: 'L2', name: 'David Hughes', email: 'd.hughes@mail.co.uk', phone: '07700 900222', billing: '22 Oak Avenue, Leeds LS8 1QP', plan: 20, start: '15 Jan 2026', admin: 'ps', status: 'Active', budget: 2400, used: 2184 },
  { id: 'L3', name: 'Rachel Evans', email: 'r.evans@mail.co.uk', phone: '07700 900333', billing: '9 Park Street, Leeds LS1 4HR', plan: 12, start: '10 Jun 2026', admin: 'jc', status: 'Active', budget: 900, used: 342 },
  { id: 'L4', name: 'Tom Ahmed', email: 't.ahmed@mail.co.uk', phone: '07700 900444', billing: '31 Ash Grove, Leeds LS8 2LN', plan: 16, start: '02 Mar 2026', admin: 'lm', status: 'Active', budget: 1500, used: 525 },
  { id: 'L5', name: 'Helen Brooks', email: 'h.brooks@mail.co.uk', phone: '07700 900555', billing: '5 Mill Lane, Bradford BD7 1JX', plan: 20, start: '20 Feb 2026', admin: 'et', status: 'Active', budget: 3200, used: 1760 },
  { id: 'L6', name: 'Karen Patel', email: 'k.patel@mail.co.uk', phone: '07700 900666', billing: '14 Elm Road, Leeds LS6 3DT', plan: 16, start: '05 May 2026', admin: 'ps', status: 'Active', budget: 1600, used: 1120 },
  { id: 'L7', name: 'Simon Wright', email: 's.wright@mail.co.uk', phone: '07700 900777', billing: '8 King Street, Leeds LS1 2HL', plan: 12, start: '12 Sep 2026', admin: 'jc', status: 'Active', budget: 800, used: 96 },
  { id: 'L8', name: 'Fiona Clarke', email: 'f.clarke@mail.co.uk', phone: '07700 900888', billing: '41 Birch Close, Wakefield WF1 3QT', plan: 20, start: '—', admin: 'lm', status: 'Invite sent', budget: 0, used: 0 },
];

export interface Agent { id: string; name: string; contact: string; email: string; phone: string; status: 'Approved' }
export const AGENTS: Agent[] = [
  { id: 'A1', name: 'Rosewood Lettings', contact: 'Claire Rose', email: 'claire@rosewood.co.uk', phone: '0113 496 0101', status: 'Approved' },
  { id: 'A2', name: 'Northgate Homes', contact: 'Ben Hall', email: 'ben@northgate.co.uk', phone: '0113 496 0202', status: 'Approved' },
  { id: 'A3', name: 'City Key Agents', contact: 'Aisha Noor', email: 'aisha@citykey.co.uk', phone: '0113 496 0303', status: 'Approved' },
];

export interface Property { id: string; address: string; area: string; type: 'House' | 'Flat' | 'HMO'; rooms?: number; beds: number; managed: boolean; owner: string; rent: number; status: 'Let' | 'Vacant' | 'Ready to let' | 'Partly let'; admin: string; photo: string }
export const PROPERTIES: Property[] = [
  { id: 'P1', address: '12 Oak Street', area: 'Headingley, Leeds LS6', type: 'House', beds: 3, managed: true, owner: 'L1', rent: 1250, status: 'Let', admin: 'et', photo: 'images/home1.jpg' },
  { id: 'P2', address: '22 Oak Avenue', area: 'Roundhay, Leeds LS8', type: 'House', beds: 4, managed: true, owner: 'L2', rent: 1450, status: 'Let', admin: 'ps', photo: 'images/home2.jpg' },
  { id: 'P3', address: 'Flat 2, 9 Park Street', area: 'City Centre, Leeds LS1', type: 'Flat', beds: 2, managed: true, owner: 'L3', rent: 875, status: 'Let', admin: 'jc', photo: 'images/home3.jpg' },
  { id: 'P4', address: '31 Ash Grove', area: 'Roundhay, Leeds LS8', type: 'House', beds: 3, managed: true, owner: 'L4', rent: 1150, status: 'Ready to let', admin: 'lm', photo: 'images/home1.jpg' },
  { id: 'P5', address: '5 Mill Lane (HMO)', area: 'Bradford BD7', type: 'HMO', rooms: 6, beds: 6, managed: true, owner: 'L5', rent: 2640, status: 'Partly let', admin: 'et', photo: 'images/home2.jpg' },
  { id: 'P6', address: '14 Elm Road', area: 'Headingley, Leeds LS6', type: 'House', beds: 3, managed: true, owner: 'L6', rent: 1150, status: 'Let', admin: 'ps', photo: 'images/home3.jpg' },
  { id: 'P7', address: 'Flat 3, 8 King Street', area: 'City Centre, Leeds LS1', type: 'Flat', beds: 2, managed: true, owner: 'L7', rent: 875, status: 'Let', admin: 'jc', photo: 'images/home1.jpg' },
  { id: 'P8', address: '3 Park Road (HMO)', area: 'Leeds LS2', type: 'HMO', rooms: 5, beds: 5, managed: true, owner: 'L2', rent: 2150, status: 'Let', admin: 'ps', photo: 'images/home2.jpg' },
  { id: 'P9', address: '27 Grange Avenue', area: 'Chapel Allerton, Leeds LS7', type: 'House', beds: 3, managed: false, owner: 'A1', rent: 0, status: 'Let', admin: 'et', photo: 'images/home3.jpg' },
  { id: 'P10', address: 'Flat 6, 2 Wharf Street', area: 'Leeds LS2', type: 'Flat', beds: 1, managed: false, owner: 'A1', rent: 0, status: 'Let', admin: 'et', photo: 'images/home1.jpg' },
  { id: 'P11', address: '88 Victoria Road', area: 'Hyde Park, Leeds LS6', type: 'House', beds: 4, managed: false, owner: 'A2', rent: 0, status: 'Let', admin: 'lm', photo: 'images/home2.jpg' },
  { id: 'P12', address: '19 Station Lane', area: 'Horsforth, Leeds LS18', type: 'House', beds: 2, managed: false, owner: 'A3', rent: 0, status: 'Let', admin: 'jc', photo: 'images/home3.jpg' },
];

export interface Enquiry { id: string; name: string; email: string; phone: string; kind: 'Landlord' | 'Home seeker'; about: string; message: string; received: string; status: 'New' | 'Passed on' | 'In Lettings' | 'Closed'; admin?: string }
export const ENQUIRIES: Enquiry[] = [
  { id: 'E1', name: 'Paul Bennett', email: 'paul.bennett@mail.co.uk', phone: '07700 901001', kind: 'Landlord', about: '2 flats in Kirkstall LS5', message: 'I have two flats I want managed from December. Could someone call me about the 16% plan?', received: 'Today, 09:12', status: 'New' },
  { id: 'E2', name: 'Lucy Grant', email: 'lucy.grant@mail.co.uk', phone: '07700 901002', kind: 'Home seeker', about: '31 Ash Grove', message: 'Is the 3 bed on Ash Grove still free? We are a family of four and can move in November.', received: 'Today, 08:40', status: 'New' },
  { id: 'E3', name: 'Omar Siddiqui', email: 'omar.s@mail.co.uk', phone: '07700 901003', kind: 'Landlord', about: 'HMO in Hyde Park LS6', message: 'Looking for full management for a 6 room HMO. Current agent is leaving.', received: 'Yesterday, 16:05', status: 'Passed on', admin: 'ps' },
  { id: 'E4', name: 'Grace Lee', email: 'grace.lee@mail.co.uk', phone: '07700 901004', kind: 'Home seeker', about: 'Room in 5 Mill Lane', message: 'Student looking for a room from January.', received: 'Yesterday, 11:20', status: 'In Lettings', admin: 'et' },
  { id: 'E5', name: 'Mark Dawson', email: 'mark.d@mail.co.uk', phone: '07700 901005', kind: 'Landlord', about: 'House in Horsforth LS18', message: 'What does the 12% plan include for repairs?', received: '13 Oct, 14:32', status: 'Closed', admin: 'jc' },
];

export const LET_STAGES = ['Applied', 'Screening', 'Viewing', 'Confirmed', 'Referencing', 'Approved'] as const;
export interface Applicant { id: string; name: string; email: string; phone: string; property: string; room?: string; stage: number; source: 'Rightmove' | 'Website'; viewing?: string; feedback?: string; reference?: 'Waiting' | 'Passed' | 'Failed'; rejected?: string; admin: string; applied: string; household: string; budget: number; moveIn: string }
export const APPLICANTS: Applicant[] = [
  { id: 'AP1', name: 'Lucy Grant', email: 'lucy.grant@mail.co.uk', phone: '07700 901002', property: 'P4', stage: 1, source: 'Website', admin: 'lm', applied: '15 Oct', household: '2 adults, 2 children', budget: 1200, moveIn: '1 Nov' },
  { id: 'AP2', name: 'Daniel Price', email: 'd.price@mail.co.uk', phone: '07700 902001', property: 'P4', stage: 2, source: 'Rightmove', viewing: '17 Oct, 10:00', admin: 'lm', applied: '12 Oct', household: '1 adult', budget: 1150, moveIn: '15 Nov' },
  { id: 'AP3', name: 'Grace Lee', email: 'grace.lee@mail.co.uk', phone: '07700 901004', property: 'P5', room: 'Room 4', stage: 0, source: 'Website', admin: 'et', applied: '14 Oct', household: '1 student', budget: 440, moveIn: '6 Jan' },
  { id: 'AP4', name: 'Hannah Moss', email: 'h.moss@mail.co.uk', phone: '07700 902002', property: 'P5', room: 'Room 2', stage: 3, source: 'Rightmove', viewing: '10 Oct, 14:00', feedback: 'Loved the room, asked about bills.', admin: 'et', applied: '6 Oct', household: '1 adult', budget: 450, moveIn: '1 Nov' },
  { id: 'AP5', name: 'Kieran Walsh', email: 'k.walsh@mail.co.uk', phone: '07700 902003', property: 'P4', stage: 4, source: 'Rightmove', viewing: '8 Oct, 17:30', feedback: 'Wants to move fast.', reference: 'Waiting', admin: 'lm', applied: '3 Oct', household: '2 adults', budget: 1150, moveIn: '1 Nov' },
  { id: 'AP6', name: 'Sophie Turner', email: 's.turner@mail.co.uk', phone: '07700 902004', property: 'P5', room: 'Room 6', stage: 5, source: 'Rightmove', viewing: '1 Oct, 12:00', feedback: 'Happy with everything.', reference: 'Passed', admin: 'et', applied: '28 Sep', household: '1 adult', budget: 440, moveIn: '20 Oct' },
  { id: 'AP7', name: 'Ryan Cole', email: 'r.cole@mail.co.uk', phone: '07700 902005', property: 'P4', stage: 2, source: 'Rightmove', viewing: '18 Oct, 16:00', admin: 'lm', applied: '13 Oct', household: '2 adults, 1 dog', budget: 1100, moveIn: '1 Dec' },
];

export const TEN_STEPS = ['Account created', 'Login email sent', 'ID checks approved', 'Agreement signed by all', 'First rent and deposit received', 'Deposit protected', 'Move-in inspection booked', 'Active tenant'] as const;
export interface Tenant { id: string; name: string; email: string; phone: string; property: string; room?: string; rent: number; step: number; idDocs: 'Waiting' | 'Approved' | 'More needed'; depositRef?: string; start: string; signed: { landlord: boolean; tenant: boolean } }
export const TENANTS: Tenant[] = [
  { id: 'T1', name: 'Michael Okafor', email: 'm.okafor.t@mail.co.uk', phone: '07700 903001', property: 'P1', rent: 1250, step: 7, idDocs: 'Approved', depositRef: 'DPS-448210', start: '1 Apr 2026', signed: { landlord: true, tenant: true } },
  { id: 'T2', name: 'Jay Patel', email: 'jay.patel@mail.co.uk', phone: '07700 903002', property: 'P2', rent: 1450, step: 7, idDocs: 'Approved', depositRef: 'TDS-118204', start: '15 Jan 2026', signed: { landlord: true, tenant: true } },
  { id: 'T3', name: 'Anna Nowak', email: 'a.nowak@mail.co.uk', phone: '07700 903003', property: 'P5', room: 'Room 1', rent: 440, step: 2, idDocs: 'Waiting', start: '1 Nov 2026', signed: { landlord: false, tenant: false } },
  { id: 'T4', name: 'Sophie Turner', email: 's.turner@mail.co.uk', phone: '07700 902004', property: 'P5', room: 'Room 6', rent: 440, step: 3, idDocs: 'Approved', start: '20 Oct 2026', signed: { landlord: true, tenant: false } },
  { id: 'T5', name: 'Rob Hughes', email: 'rob.h@mail.co.uk', phone: '07700 903005', property: 'P7', rent: 875, step: 7, idDocs: 'Approved', depositRef: 'DPS-552910', start: '12 Sep 2026', signed: { landlord: true, tenant: true } },
  { id: 'T6', name: 'Liz Brown', email: 'liz.brown@mail.co.uk', phone: '07700 903006', property: 'P5', room: 'Room 4', rent: 440, step: 7, idDocs: 'Approved', depositRef: 'DPS-229841', start: '1 Mar 2026', signed: { landlord: true, tenant: true } },
  { id: 'T7', name: 'Sam Ahmed', email: 'sam.ahmed@mail.co.uk', phone: '07700 903007', property: 'P6', rent: 1150, step: 7, idDocs: 'Approved', depositRef: 'TDS-331002', start: '5 May 2026', signed: { landlord: true, tenant: true } },
  { id: 'T8', name: 'Kofi Mensah', email: 'k.mensah@mail.co.uk', phone: '07700 903008', property: 'P3', rent: 875, step: 4, idDocs: 'Approved', start: '1 Nov 2026', signed: { landlord: true, tenant: true } },
  { id: 'T9', name: 'Ella Novak', email: 'e.novak@mail.co.uk', phone: '07700 903009', property: 'P8', room: 'Room 3', rent: 430, step: 2, idDocs: 'More needed', start: '1 Nov 2026', signed: { landlord: false, tenant: false } },
];

export interface Doc { name: string; status: 'Uploaded' | 'Missing' | 'Expired'; expires?: string }
export interface SignUp { id: string; name: string; kind: 'Letting agent' | 'Contractor · Trade' | 'Contractor · Site Inspector'; contact: string; email: string; phone: string; areas: string; trades?: string; applied: string; docs: Doc[]; status: 'Waiting' | 'More info asked' | 'Approved' | 'Rejected'; note?: string }
export const SIGNUPS: SignUp[] = [
  { id: 'S1', name: 'BrightSpark Electrical', kind: 'Contractor · Trade', contact: 'Daniel Hughes', email: 'dan@brightspark.co.uk', phone: '07700 900123', areas: 'Leeds LS1–LS8', trades: 'Electrician', applied: 'Today, 10:15', status: 'Waiting', docs: [{ name: 'Photo ID', status: 'Uploaded' }, { name: 'Right to work', status: 'Uploaded' }, { name: 'Public liability insurance', status: 'Uploaded', expires: '30 Jun 2027' }, { name: 'NICEIC certificate', status: 'Uploaded', expires: '14 Mar 2027' }] },
  { id: 'S2', name: 'HomeCheck Inspections', kind: 'Contractor · Site Inspector', contact: 'Nadia Karim', email: 'nadia@homecheck.co.uk', phone: '07700 900456', areas: 'Leeds, Bradford', applied: 'Yesterday', status: 'Waiting', docs: [{ name: 'Photo ID', status: 'Uploaded' }, { name: 'Right to work', status: 'Uploaded' }, { name: 'Insurance', status: 'Missing' }] },
  { id: 'S3', name: 'Parkside Lettings', kind: 'Letting agent', contact: 'Owen Parks', email: 'owen@parkside.co.uk', phone: '0113 496 0404', areas: 'Leeds North', applied: '13 Oct', status: 'Waiting', docs: [{ name: 'Company details', status: 'Uploaded' }, { name: 'Billing details', status: 'Uploaded' }] },
];

export interface Contractor { id: string; name: string; type: 'Trade' | 'Site Inspector'; trade: string; contact: string; phone: string; certs: Doc[]; paused: boolean; rating: number; jobs: number }
export const CONTRACTORS: Contractor[] = [
  { id: 'C1', name: 'HeatRight Ltd', type: 'Trade', trade: 'Gas engineer', contact: 'Gary Holt', phone: '07700 904001', certs: [{ name: 'Gas Safe register', status: 'Uploaded', expires: '12 Aug 2027' }, { name: 'Insurance', status: 'Uploaded', expires: '01 Feb 2027' }], paused: false, rating: 4.8, jobs: 42 },
  { id: 'C2', name: 'TopTile Roofing', type: 'Trade', trade: 'Roofer', contact: 'Andy Shaw', phone: '07700 904002', certs: [{ name: 'Insurance', status: 'Uploaded', expires: '20 Dec 2026' }], paused: false, rating: 4.5, jobs: 18 },
  { id: 'C3', name: 'SecureFix', type: 'Trade', trade: 'Locksmith & carpenter', contact: 'Leah Ford', phone: '07700 904003', certs: [{ name: 'Insurance', status: 'Expired', expires: '30 Sep 2026' }], paused: true, rating: 4.2, jobs: 27 },
  { id: 'C4', name: 'QuickPlumb', type: 'Trade', trade: 'Plumber', contact: 'Mo Iqbal', phone: '07700 904004', certs: [{ name: 'Insurance', status: 'Uploaded', expires: '15 Apr 2027' }], paused: false, rating: 4.7, jobs: 55 },
  { id: 'C5', name: 'Volt Electrical', type: 'Trade', trade: 'Electrician', contact: 'Sean Day', phone: '07700 904005', certs: [{ name: 'NAPIT certificate', status: 'Uploaded', expires: '09 Jan 2027' }, { name: 'Insurance', status: 'Uploaded', expires: '09 Jan 2027' }], paused: false, rating: 4.9, jobs: 31 },
  { id: 'C6', name: 'Clear View Inspections', type: 'Site Inspector', trade: 'Site Inspector', contact: 'Ruth Ellis', phone: '07700 904006', certs: [{ name: 'Photo ID', status: 'Uploaded' }, { name: 'Insurance', status: 'Uploaded', expires: '28 Feb 2027' }], paused: false, rating: 4.6, jobs: 64 },
];

export const JOB_STATUS = ['New', 'Quote sent', 'Waiting approval', 'Assigned', 'In progress', 'Proof uploaded', 'Sent back', 'Approved'] as const;
export type JobStatus = typeof JOB_STATUS[number];
export interface Job { id: string; title: string; property: string; managed: boolean; contractor?: string; cost: number; price: number; status: JobStatus; urgent?: boolean; reported: string; by: string; admin: string; note?: string; proof?: string[] }
export const JOBS: Job[] = [
  { id: 'J1', title: 'Boiler repair', property: 'P6', managed: true, contractor: 'C1', cost: 340, price: 420, status: 'Waiting approval', reported: '14 Oct', by: 'Tenant · Sam Ahmed', admin: 'ps', note: 'No hot water. Part needs replacing.' },
  { id: 'J2', title: 'Roof leak', property: 'P2', managed: true, contractor: 'C2', cost: 560, price: 680, status: 'Waiting approval', reported: '13 Oct', by: 'Tenant · Jay Patel', admin: 'ps', note: 'Water coming through bedroom ceiling after rain.' },
  { id: 'J3', title: 'Window lock', property: 'P3', managed: true, contractor: 'C3', cost: 150, price: 190, status: 'Waiting approval', reported: '12 Oct', by: 'Landlord · Rachel Evans', admin: 'jc', note: 'Front window lock broken.' },
  { id: 'J4', title: 'Damp survey', property: 'P5', managed: true, contractor: 'C1', cost: 190, price: 240, status: 'Proof uploaded', reported: '9 Oct', by: 'Inspection', admin: 'et', proof: ['Before · wall', 'After · wall', 'Meter reading', 'Report page'] },
  { id: 'J5', title: 'Tap replacement', property: 'P4', managed: true, contractor: 'C4', cost: 70, price: 95, status: 'Approved', reported: '5 Oct', by: 'Office Admin', admin: 'lm', proof: ['Before', 'After'] },
  { id: 'J6', title: 'Electric socket fault', property: 'P1', managed: true, contractor: 'C5', cost: 110, price: 140, status: 'In progress', reported: '15 Oct', by: 'Tenant · Michael Okafor', admin: 'et' },
  { id: 'J7', title: 'No heating (emergency)', property: 'P8', managed: true, cost: 0, price: 0, status: 'New', urgent: true, reported: 'Today, 07:50', by: 'Tenant · Ella Novak', admin: 'ps', note: 'Whole house has no heating. Elderly neighbour in Room 1.' },
  { id: 'J8', title: 'Leaking shower', property: 'P9', managed: false, contractor: 'C4', cost: 120, price: 180, status: 'Quote sent', reported: '14 Oct', by: 'Agent · Rosewood Lettings', admin: 'et' },
  { id: 'J9', title: 'Replace extractor fan', property: 'P11', managed: false, contractor: 'C5', cost: 95, price: 150, status: 'Approved', reported: '2 Oct', by: 'Agent · Northgate Homes', admin: 'lm', proof: ['Before', 'After'] },
  { id: 'J10', title: 'Door rehang', property: 'P10', managed: false, cost: 0, price: 0, status: 'New', reported: '15 Oct', by: 'Agent · Rosewood Lettings', admin: 'et' },
];

export interface Inspection { id: string; kind: 'Move-in' | 'Routine' | 'Move-out'; property: string; room?: string; date: string; inspector?: string; status: 'Not assigned' | 'Booked' | 'Report uploaded' | 'Sent back' | 'Locked'; rooms: { name: string; photos: number; note: string; diff?: boolean }[]; meters: { gas?: string; electric?: string; water?: string }; keys: number }
export const INSPECTIONS: Inspection[] = [
  { id: 'I1', kind: 'Move-in', property: 'P4', date: '16 Oct', inspector: 'C6', status: 'Booked', rooms: [], meters: {}, keys: 0 },
  { id: 'I2', kind: 'Move-out', property: 'P5', room: 'Room 3', date: '14 Oct', inspector: 'C6', status: 'Report uploaded', rooms: [{ name: 'Bedroom', photos: 6, note: 'Carpet stain by window', diff: true }, { name: 'Shared kitchen', photos: 4, note: 'Clean' }, { name: 'Shared bathroom', photos: 4, note: 'Clean' }], meters: { gas: '04412', electric: '18820' }, keys: 2 },
  { id: 'I3', kind: 'Move-out', property: 'P7', date: '22 Oct', status: 'Not assigned', rooms: [], meters: {}, keys: 0 },
  { id: 'I4', kind: 'Routine', property: 'P2', date: '9 Oct', inspector: 'C6', status: 'Locked', rooms: [{ name: 'Living room', photos: 5, note: 'Good' }, { name: 'Kitchen', photos: 5, note: 'Good' }, { name: 'Bedroom 1', photos: 3, note: 'Good' }, { name: 'Bathroom', photos: 3, note: 'Mould on ceiling', diff: true }], meters: { gas: '11208', electric: '30551', water: '00921' }, keys: 3 },
  { id: 'I5', kind: 'Move-in', property: 'P3', date: '31 Oct', status: 'Not assigned', rooms: [], meters: {}, keys: 0 },
];

export interface SafetyCert { id: string; property: string; kind: 'Gas safety' | 'Electrical (EICR)' | 'Energy (EPC)' | 'Fire alarm' | 'HMO licence'; expires: string; days: number; status: 'Valid' | 'Due soon' | 'Overdue' | 'Booked' | 'Proof to check'; contractor?: string }
export const SAFETY: SafetyCert[] = [
  { id: 'SC1', property: 'P7', kind: 'Gas safety', expires: '21 Oct 2026', days: 6, status: 'Booked', contractor: 'C1' },
  { id: 'SC2', property: 'P3', kind: 'Electrical (EICR)', expires: '18 Oct 2026', days: 3, status: 'Due soon' },
  { id: 'SC3', property: 'P5', kind: 'Fire alarm', expires: '27 Oct 2026', days: 12, status: 'Due soon' },
  { id: 'SC4', property: 'P5', kind: 'HMO licence', expires: '12 Nov 2026', days: 28, status: 'Due soon' },
  { id: 'SC5', property: 'P4', kind: 'Gas safety', expires: '14 Nov 2026', days: 30, status: 'Proof to check', contractor: 'C1' },
  { id: 'SC6', property: 'P8', kind: 'Gas safety', expires: '02 Oct 2026', days: -13, status: 'Overdue' },
  { id: 'SC7', property: 'P1', kind: 'Gas safety', expires: '03 Apr 2027', days: 170, status: 'Valid' },
  { id: 'SC8', property: 'P2', kind: 'Electrical (EICR)', expires: '15 Jan 2030', days: 1188, status: 'Valid' },
  { id: 'SC9', property: 'P6', kind: 'Energy (EPC)', expires: '05 May 2031', days: 1663, status: 'Valid' },
];

export interface RentRow { id: string; tenant: string; due: string; amount: number; paid: number; history: { date: string; amount: number; note: string }[]; reminders: number }
export const RENT: RentRow[] = [
  { id: 'R1', tenant: 'T1', due: '1 Oct', amount: 1250, paid: 1250, history: [{ date: '1 Oct', amount: 1250, note: 'Bank transfer' }], reminders: 0 },
  { id: 'R2', tenant: 'T2', due: '15 Oct', amount: 1450, paid: 0, history: [], reminders: 1 },
  { id: 'R3', tenant: 'T5', due: '12 Oct', amount: 875, paid: 875, history: [{ date: '12 Oct', amount: 875, note: 'Bank transfer' }], reminders: 0 },
  { id: 'R4', tenant: 'T6', due: '1 Oct', amount: 440, paid: 0, history: [], reminders: 2 },
  { id: 'R5', tenant: 'T7', due: '5 Oct', amount: 1150, paid: 1150, history: [{ date: '5 Oct', amount: 1150, note: 'Bank transfer' }], reminders: 0 },
  { id: 'R6', tenant: 'T3', due: '1 Nov', amount: 440, paid: 0, history: [], reminders: 0 },
  { id: 'R7', tenant: 'T8', due: '1 Nov', amount: 875, paid: 0, history: [], reminders: 0 },
  { id: 'R8', tenant: 'T4', due: '10 Oct', amount: 440, paid: 300, history: [{ date: '13 Oct', amount: 300, note: 'Part payment' }], reminders: 1 },
];
export const RENT_LATE_DAY = 15; // "today" for the demo is 15 Oct

export interface Invoice { id: string; to: string; toKind: 'Landlord' | 'Agent'; job?: string; amount: number; paid: number; terms: 'Straight away' | '30 days' | 'Custom'; issued: string; due: string; overdue: boolean }
export const INVOICES: Invoice[] = [
  { id: 'INV-1042', to: 'L4', toKind: 'Landlord', job: 'J5', amount: 95, paid: 95, terms: 'Straight away', issued: '7 Oct', due: '7 Oct', overdue: false },
  { id: 'INV-1043', to: 'A2', toKind: 'Agent', job: 'J9', amount: 150, paid: 0, terms: '30 days', issued: '4 Oct', due: '3 Nov', overdue: false },
  { id: 'INV-1037', to: 'A1', toKind: 'Agent', amount: 320, paid: 120, terms: '30 days', issued: '2 Sep', due: '2 Oct', overdue: true },
  { id: 'INV-1039', to: 'L2', toKind: 'Landlord', amount: 210, paid: 0, terms: 'Custom', issued: '20 Sep', due: '10 Oct', overdue: true },
  { id: 'INV-1044', to: 'L6', toKind: 'Landlord', amount: 480, paid: 480, terms: 'Straight away', issued: '11 Oct', due: '11 Oct', overdue: false },
];

export interface Task { id: string; title: string; admin: string; due: string; late: boolean; done: boolean; link?: string }
export const TASKS: Task[] = [
  { id: 'K1', title: 'Call Paul Bennett about 2 flats', admin: 'et', due: 'Today', late: false, done: false },
  { id: 'K2', title: 'Chase signature: Sophie Turner agreement', admin: 'et', due: '14 Oct', late: true, done: false },
  { id: 'K3', title: 'Book EICR for Flat 2, 9 Park Street', admin: 'jc', due: '15 Oct', late: false, done: false },
  { id: 'K4', title: 'Record Jay Patel rent', admin: 'ps', due: '15 Oct', late: false, done: false },
  { id: 'K5', title: 'Fix heating at 3 Park Road (emergency)', admin: 'ps', due: 'Today', late: false, done: false },
  { id: 'K6', title: 'Review move-out report Room 3', admin: 'et', due: '13 Oct', late: true, done: false },
  { id: 'K7', title: 'Viewing with Ryan Cole, 31 Ash Grove', admin: 'lm', due: '18 Oct', late: false, done: false },
  { id: 'K8', title: 'Upload referencing result: Kieran Walsh', admin: 'lm', due: '16 Oct', late: false, done: false },
  { id: 'K9', title: 'Send quote to Rosewood: door rehang', admin: 'et', due: '16 Oct', late: false, done: false },
  { id: 'K10', title: 'Chase overdue invoice INV-1039', admin: 'ps', due: '12 Oct', late: true, done: false },
  { id: 'K11', title: 'Gas check booking, 3 Park Road', admin: 'ps', due: '10 Oct', late: true, done: false },
  { id: 'K12', title: 'Assign inspector for 8 King Street move-out', admin: 'jc', due: '17 Oct', late: false, done: false },
];

export interface Activity { id: string; when: string; who: string; what: string; area: string }
export const ACTIVITY: Activity[] = [
  { id: 'H1', when: 'Today 10:15', who: 'System', what: 'New sign-up: BrightSpark Electrical', area: 'Sign-Ups' },
  { id: 'H2', when: 'Today 09:12', who: 'Website form', what: 'New enquiry from Paul Bennett', area: 'Enquiries' },
  { id: 'H3', when: 'Today 08:31', who: 'Emma Thompson', what: 'Recorded £600 part payment from Sophie Turner', area: 'Rent & Invoices' },
  { id: 'H4', when: 'Today 07:50', who: 'Ella Novak (tenant)', what: 'Reported emergency: no heating at 3 Park Road', area: 'Contractors & Jobs' },
  { id: 'H5', when: 'Yesterday 17:02', who: 'Clear View Inspections', what: 'Uploaded move-out report for 5 Mill Lane, Room 3', area: 'Inspections' },
  { id: 'H6', when: 'Yesterday 15:40', who: 'Sarah Khan', what: 'Approved Sophie Turner as tenant', area: 'Lettings' },
  { id: 'H7', when: 'Yesterday 11:20', who: 'Sarah Khan', what: 'Passed enquiry from Omar Siddiqui to Priya Shah', area: 'Enquiries' },
  { id: 'H8', when: '13 Oct 16:44', who: 'Priya Shah', what: 'Sent roof leak quote (£680) for approval', area: 'Approvals & Budgets' },
  { id: 'H9', when: '9 Oct 12:10', who: 'Sarah Khan', what: 'Locked routine inspection report for 22 Oak Avenue', area: 'Records & History' },
];

export interface LockedRecord { id: string; kind: 'Inspection report' | 'Finished job'; title: string; locked: string; by: string; versions: { when: string; who: string; reason: string }[] }
export const LOCKED: LockedRecord[] = [
  { id: 'LR1', kind: 'Inspection report', title: 'Routine inspection · 22 Oak Avenue', locked: '9 Oct 2026', by: 'Sarah Khan', versions: [] },
  { id: 'LR2', kind: 'Finished job', title: 'Tap replacement · 31 Ash Grove', locked: '7 Oct 2026', by: 'Liam Murphy', versions: [] },
  { id: 'LR3', kind: 'Finished job', title: 'Extractor fan · 88 Victoria Road', locked: '4 Oct 2026', by: 'Liam Murphy', versions: [] },
  { id: 'LR4', kind: 'Inspection report', title: 'Move-in · 8 King Street', locked: '12 Sep 2026', by: 'James Carter', versions: [{ when: '14 Sep 2026', who: 'Sarah Khan', reason: 'Meter reading typed wrong (18820 not 18802)' }] },
];

export interface SupportReq { id: string; from: string; reason: string; asked: string; status: 'Waiting' | 'Allowed' | 'Refused' | 'Ended'; until?: number; looks: string[] }
export const SUPPORT: SupportReq[] = [
  { id: 'SR1', from: 'Genesis tech team · Ali R.', reason: 'Rent page shows the wrong total for 5 Mill Lane. Need to look at the rent records to fix it.', asked: 'Today, 09:40', status: 'Waiting', looks: [] },
  { id: 'SR2', from: 'Genesis tech team · Mia K.', reason: 'Email reminders not sending for two tenants.', asked: '10 Oct', status: 'Ended', looks: ['Opened Rent & Invoices', 'Opened tenant Liz Brown', 'Access ended by itself'] },
];

export const RENT_CHART = [{ m: 'May', v: 41.2 }, { m: 'Jun', v: 43.8 }, { m: 'Jul', v: 44.1 }, { m: 'Aug', v: 46.0 }, { m: 'Sep', v: 47.3 }, { m: 'Oct', v: 48.2 }];
