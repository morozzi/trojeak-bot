// lib/types/api.ts - Database-aligned type definitions

export interface Event {
  eventid: number;
  brandid: string;
  venueid: number;
  eventpic: string;
  eventschema: string;
  eventschemaprice: number;
  eventdate: string;
  eventfeatured: 0 | 1;
  eventtitle: string;
  eventartist: string;
  eventdesc: string;
}

export interface Venue {
  venueid: number;
  cityid: number;
  venuetype: 'bar' | 'club' | 'ktv';
  venuepic1: string;
  venuepic2: string;
  venuelink: string;
  venuename: string;
  venuefeatured: 0 | 1;
}

export interface Brand {
  brandid: number;
  brandpic1: string;
  brandpic2: string;
  brandname: string;
  brandfeatured: 0 | 1;
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