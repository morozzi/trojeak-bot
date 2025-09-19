// lib/types/api.ts - Database-aligned type definitions

export interface Event {
  eventid: number;
  brandid: string;
  venueid: number;
  eventpic: string;
  eventschema: string;
  eventschemaprice: number;
  eventdate: string;
  eventfeatured: boolean;
  eventtitle: string;
  eventartist: string;
  eventdesc: string;
  venuename: string;
  venuelink: string;
  cityname: string;
  venuetype: 'bar' | 'club' | 'ktv';
}

interface Venue {
  venueid: number;
  venuename: string;
  venuepic1: string;
  venuepic2: string;
  venuelink: string;
  venuefeatured: boolean;
  cityname: string;
  citypic: string;
  venuetypeicon: string;
  venuetypename: string;
  cityid: number;
  venuetype: 'bar' | 'club' | 'ktv';
}

export interface Brand {
  brandid: number;
  brandpic1: string;
  brandpic2: string;
  brandname: string;
  brandfeatured: boolean;
}

export interface City {
  cityid: number;
  citysid: string;
  citypic: string;
  cityname: string;
}

export interface VenueType {
  venuetypesid: string;
  venuetypename: string;
  venuetypeicon: string;
}

export interface Language {
  languagesid: string;
  languagename: string;
  languageflag: string;
}

export interface User {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  language: string;
  cityid: number;
  venue_types: string[];
  channel_member: boolean;
  venue_staff?: number;
  alerts: boolean;
  onboarding: number;
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}