export type AnalyticsEventName =
  | 'App Installed' | 'First Launch' | 'Account Created' | 'Avatar Created' | 'Avatar Upload Complete'
  | 'Training Started' | 'Training Completed' | 'First Presence Session' | 'First Voice-Only Session'
  | 'Virtual Camera Activated' | 'OBS Mode Used' | 'Call Started' | 'Call Ended' | 'Settings Changed'
  | 'Data Export' | 'Data Delete' | 'Crash' | 'Feature Usage';
export interface AnalyticsEvent { id:string; name:AnalyticsEventName; timestamp:string; sessionId?:string; properties:Record<string,string|number|boolean>; }
export interface AnalyticsPreferences { enabled:boolean; developerMode:boolean; updatedAt:string; }
const EVENTS_KEY='eidos.analytics.events.v1',PREFS_KEY='eidos.analytics.preferences.v1';
export class AnalyticsService {
  constructor(private storage:Storage=window.localStorage){}
  preferences():AnalyticsPreferences{try{return{enabled:false,developerMode:false,updatedAt:new Date(0).toISOString(),...JSON.parse(this.storage.getItem(PREFS_KEY)??'{}')}}catch{return{enabled:false,developerMode:false,updatedAt:new Date(0).toISOString()}}}
  setPreferences(patch:Partial<Pick<AnalyticsPreferences,'enabled'|'developerMode'>>):AnalyticsPreferences{const next={...this.preferences(),...patch,updatedAt:new Date().toISOString()};this.storage.setItem(PREFS_KEY,JSON.stringify(next));return next;}
  events():AnalyticsEvent[]{try{return JSON.parse(this.storage.getItem(EVENTS_KEY)??'[]')}catch{return[]}}
  track(name:AnalyticsEventName,properties:AnalyticsEvent['properties']={},sessionId?:string):AnalyticsEvent|undefined{if(!this.preferences().enabled)return undefined;const event={id:crypto.randomUUID(),name,timestamp:new Date().toISOString(),sessionId,properties};this.storage.setItem(EVENTS_KEY,JSON.stringify([...this.events(),event].slice(-5000)));return event;}
  export():string{return JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),anonymous:true,events:this.events()},null,2)}
  clear():void{this.storage.removeItem(EVENTS_KEY)}
}