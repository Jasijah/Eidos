export interface PresenceSessionRecord { id:string; startedAt:string; endedAt?:string; durationMs:number; voiceOnly:boolean; cameraEnabled:boolean; averageConfidence:number; averageNaturalness:number; averagePresenceQuality:number; frames:number; mode:string; }
const KEY='eidos.analytics.sessions.v1';
export class SessionTracker {
  private active?:PresenceSessionRecord; constructor(private storage:Storage=window.localStorage){}
  list():PresenceSessionRecord[]{try{return JSON.parse(this.storage.getItem(KEY)??'[]')}catch{return[]}}
  start(input:{voiceOnly:boolean;cameraEnabled:boolean;mode:string}):PresenceSessionRecord{this.active={id:crypto.randomUUID(),startedAt:new Date().toISOString(),durationMs:0,averageConfidence:0,averageNaturalness:0,averagePresenceQuality:0,frames:0,...input};return this.active}
  sample(input:{confidence:number;naturalness:number;presenceQuality:number}):void{if(!this.active)return;const n=this.active.frames;this.active.averageConfidence=(this.active.averageConfidence*n+input.confidence)/(n+1);this.active.averageNaturalness=(this.active.averageNaturalness*n+input.naturalness)/(n+1);this.active.averagePresenceQuality=(this.active.averagePresenceQuality*n+input.presenceQuality)/(n+1);this.active.frames++}
  end(now=Date.now()):PresenceSessionRecord|undefined{if(!this.active)return;const result={...this.active,endedAt:new Date(now).toISOString(),durationMs:Math.max(0,now-new Date(this.active.startedAt).getTime())};this.storage.setItem(KEY,JSON.stringify([...this.list(),result].slice(-1000)));this.active=undefined;return result}
  current(){return this.active}
  clear():void{this.storage.removeItem(KEY);this.active=undefined}
}