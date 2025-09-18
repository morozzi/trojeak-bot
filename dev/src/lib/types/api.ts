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

export interface Venue {
  venueid: number;
  cityid: number;
  venuetype: 'bar' | 'club' | 'ktv';
  venuepic1: string;
  venuepic2: string;
  venuelink: string;
  venuename: string;
  venuefeatured: boolean;
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
  cityname: string;
}

export interface VenueType {
  venuetypeid: number;
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
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  language: string;
  cityid: number;
  venue_types: string;
  channel_member: 0 | 1;
  venue_staff?: number;
  alerts: 0 | 1;
  onboarding: number;
  status: 'active' | 'blocked';
  is_bot: 0 | 1;
  created_at: string;
  updated_at: string;
}