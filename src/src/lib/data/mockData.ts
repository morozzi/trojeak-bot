// lib/data/mockData.ts

import type { Event, Venue, Brand, City, VenueType, Language } from '../types/api.js';

export const languageData: Language[] = [
  { languagesid: 'en', languagename: 'English', languageflag: '🇺🇸' },
  { languagesid: 'km', languagename: 'ខ្មែរ', languageflag: '🇰🇭' },
  { languagesid: 'zh', languagename: '中文', languageflag: '🇨🇳' }
];

export const brandData: Brand[] = [
  { brandid: 1, brandpic1: '1.a8f8da513bd221bd9658bf1ef9232e4c7a04d05e.png', brandpic2: '1.2.fd6fa287c69440aac65df5a5850388265751e4e2.jpg', brandname: 'Hanuman', brandfeatured: 1 },
  { brandid: 2, brandpic1: '2.0321e24efc89e4433a73de62d7d33789027cee89.jpg', brandpic2: '2.2.b4f2ada2b566eee6aaae098c107f1a0cbc812269.jpg', brandname: 'Cambodia Premium', brandfeatured: 0 },
  { brandid: 3, brandpic1: '3.cd45ab9b28bd17f5fef90a4c89d8f24fc849ce9d.png', brandpic2: '3.2.43115d40bb8eac5b3174de6f5a4d9c43857c173e.jpg', brandname: 'Ganzberg', brandfeatured: 0 },
  { brandid: 5, brandpic1: '5.c57bf863f0dc2e3a6d9bc17de13d5c44b37acc32.jpg', brandpic2: '5.2.83a9f29cfd15b1020a764be330e0c694bbda901a.jpg', brandname: 'Cambodia Lite', brandfeatured: 1 },
  { brandid: 6, brandpic1: '6.2b21e9e3ebb62b2e4d2ac1b921fa156bf9ec7477.jpg', brandpic2: '6.2.57ff52f55f5616b8c85ff07562fe02083a41724f.jpg', brandname: 'ABC', brandfeatured: 1 },
  { brandid: 7, brandpic1: '7.b5ae32413c0cdc383dde21ad374802a40ea75e6b.jpg', brandpic2: '7.2.59e35c92e2b7fc47f2183e2ac5418c614cc8bb04.jpg', brandname: 'Budweiser', brandfeatured: 0 },
  { brandid: 8, brandpic1: '8.a627e7accdb060271e9056f339f2306f3481cd6c.jpg', brandpic2: '8.2.1b86a73b6fc8c1a363b3b5bdd788b84662eef500.png', brandname: 'Tiger', brandfeatured: 0 }
];

export const venueTypeData: VenueType[] = [
  { venuetypeid: 1, venuetypesid: 'bar', venuetypename: 'Bar', venuetypeicon: '🍺' },
  { venuetypeid: 2, venuetypesid: 'club', venuetypename: 'Club', venuetypeicon: '💃' },
  { venuetypeid: 3, venuetypesid: 'ktv', venuetypename: 'KTV', venuetypeicon: '🎤' }
];

export const venueData: Venue[] = [
  { venueid: 1, cityid: 1, venuetype: 'club', venuepic1: '1.947fc62b373c83a637b47119c83c4e9ac63c5948.jpg', venuepic2: '1.2.9ab8a84631496f2d67ff595a271ece9b2555bc7a.jpg', venuelink: 'https://maps.app.goo.gl/jsJgTgskBExEyfQZ9', venuename: 'Epic-Z', venuefeatured: 0 },
  { venueid: 3, cityid: 2, venuetype: 'club', venuepic1: '3.98775890122211d224d5402af755e76b98c672f5.jpg', venuepic2: '3.2.d91be1892f8701f782fa559214c27fc8c379d197.jpg', venuelink: 'https://maps.app.goo.gl/u99nYpG921nJRXYu5', venuename: 'Temple Classic Club', venuefeatured: 0 },
  { venueid: 6, cityid: 1, venuetype: 'bar', venuepic1: '6.c4aee67450d5f843f7b7f77f8dbd7da5d5db7c9b.jpg', venuepic2: '6.2.6dd8dc91f57d9d21835af57f684c49f8574e632c.jpg', venuelink: 'https://maps.app.goo.gl/qdq3PRbXUFH8ZfJe9', venuename: 'Deja Vu - The Garden Pub', venuefeatured: 0 },
  { venueid: 7, cityid: 1, venuetype: 'bar', venuepic1: '7.927d193728b96c052973f4d991661b2cef7cb90a.jpg', venuepic2: '7.2.476b243ea2d588fb3810342b34cdba9f67ca29ad.jpg', venuelink: 'https://maps.app.goo.gl/jmwGcE6Dk5P9q8R1A', venuename: 'Old Place Pub', venuefeatured: 1 },
  { venueid: 8, cityid: 1, venuetype: 'bar', venuepic1: '8.8a82a27c63f1c572d2320ce4a72e81c4fdd85636.jpg', venuepic2: '8.2.9238f9778c0dddf679a7592ac3afdbd19cc58c66.jpg', venuelink: 'https://maps.app.goo.gl/4d3wQ9ykfM6WV5QK6', venuename: 'KunLun Pub', venuefeatured: 1 },
  { venueid: 9, cityid: 1, venuetype: 'bar', venuepic1: '9.07e388c1117c7fe3a80f670e2c0bff36ea252021.jpg', venuepic2: '9.2.5b33bef6236ca4554028106ba56231037c21ba58.jpg', venuelink: 'https://maps.app.goo.gl/bKVfh6SX5AuujbSu7', venuename: 'The WATERS Pub', venuefeatured: 1 },
  { venueid: 10, cityid: 4, venuetype: 'bar', venuepic1: '10.eada931b644d7f8fea7b8045b21fecb8d16cba22.jpg', venuepic2: '10.2.82ce5e28b1052166c424dfc84bfff9f1b9b078b4.jpg', venuelink: 'https://maps.app.goo.gl/DuxggMgVvc9jaVJA9', venuename: 'The Dambang', venuefeatured: 0 }
];

export const cityData: City[] = [
  { cityid: 1, citysid: 'pp', cityname: 'Phnom Penh' },
  { cityid: 2, citysid: 'sr', cityname: 'Siem Reap' },
  { cityid: 3, citysid: 'shv', cityname: 'Sihanoukville' },
  { cityid: 4, citysid: 'btb', cityname: 'Battambang' },
  { cityid: 5, citysid: 'kpc', cityname: 'Kampong Cham' },
  { cityid: 6, citysid: 'kpt', cityname: 'Kampong Thom' }
];

export const events: Event[] = [
  { eventid: 1, brandid: '^2^,^5^', venueid: 7, eventpic: '1.80d3a2115ff893d3b6c8ec596391b1f3b9e22037.jpg', eventschema: '12+2', eventschemaprice: 10.20, eventdate: '2025-08-20', eventfeatured: 1, eventtitle: 'Cambodia Lite Session', eventartist: 'Sok Pisey', eventdesc: '' },
  { eventid: 2, brandid: '^2^,^5^', venueid: 6, eventpic: '2.b5cbb741f12352c6500b5c5586bb33e61ee63f92.jpg', eventschema: '', eventschemaprice: 0.00, eventdate: '2025-08-23', eventfeatured: 0, eventtitle: 'Cambodia Lite Session', eventartist: 'Ann Kun Kola', eventdesc: '' },
  { eventid: 3, brandid: '^2^,^5^', venueid: 3, eventpic: '3.995339ad45592674b87abf91d19a92a5e01515aa.jpg', eventschema: '', eventschemaprice: 0.00, eventdate: '2025-08-23', eventfeatured: 0, eventtitle: 'Cambodia Lite Session', eventartist: 'Thol Sophiti', eventdesc: '' },
  { eventid: 4, brandid: '^6^', venueid: 8, eventpic: '4.423553791a9eb34856ef02a53e401f85f45e6fe9.jpg', eventschema: '8+2', eventschemaprice: 8.80, eventdate: '2025-08-22', eventfeatured: 0, eventtitle: 'ABC Smooth', eventartist: 'Tep Piseth', eventdesc: '' },
  { eventid: 5, brandid: '^6^', venueid: 9, eventpic: '5.ac6857bf04f7b36abaa999b4169deae5882a9e8c.jpg', eventschema: '8+2', eventschemaprice: 9.00, eventdate: '2025-08-25', eventfeatured: 1, eventtitle: 'ABC Smooth', eventartist: 'Tep Piseth', eventdesc: '' },
  { eventid: 6, brandid: '^6^', venueid: 10, eventpic: '6.7e40e4aca7df5675cf14a7b36759d9fc1e626290.jpg', eventschema: '8+2', eventschemaprice: 9.50, eventdate: '2025-08-24', eventfeatured: 0, eventtitle: 'ABC Smooth', eventartist: 'Tep Piseth', eventdesc: '' },
  { eventid: 7, brandid: '^7^', venueid: 9, eventpic: '7.730cd7673bd61fb842620d9de25083cc16819f53.jpg', eventschema: '24+4', eventschemaprice: 15.40, eventdate: '2025-08-29', eventfeatured: 0, eventtitle: 'Yours To Take', eventartist: 'Yuk Thitratha', eventdesc: '' },
  { eventid: 8, brandid: '^8^', venueid: 9, eventpic: '8.1b7c43ab87deb53a517ff2b864a9b2bad27d00b3.jpg', eventschema: '12+2', eventschemaprice: 11.60, eventdate: '2025-08-30', eventfeatured: 1, eventtitle: 'It\'s Tiger Time', eventartist: 'Chhay Virakyuth', eventdesc: '' }
];