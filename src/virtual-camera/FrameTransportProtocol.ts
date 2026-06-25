export const EIDOS_FRAME_PROTOCOL_VERSION=1;
export interface FrameTransportHandshake { version:1;width:number;height:number;frameRate:number;pixelFormat:'BGRA'|'RGBA';disclosureActive:boolean; }
export interface FrameTransportHealth { connected:boolean;framesSent:number;framesDropped:number;lastFrameAt?:number; }
export function validateHandshake(value:FrameTransportHandshake):boolean{return value.version===EIDOS_FRAME_PROTOCOL_VERSION&&value.width>=640&&value.width<=3840&&value.height>=480&&value.height<=2160&&[24,30,60].includes(value.frameRate)&&value.disclosureActive;}