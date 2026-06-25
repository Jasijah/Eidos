import type { AvatarAssetDescriptor } from '../AvatarAssetProvider';
import type { AvatarIdentityModel } from '../AvatarIdentityModel';
import type { PhotorealisticAvatarProvider, PhotorealisticAvatarRequest } from '../PhotorealisticAvatarGenerator';

export class LocalPlaceholderRealisticProvider implements PhotorealisticAvatarProvider {
  readonly id = 'local-realistic' as const; readonly displayName = 'Local Three.js Provider'; readonly available = true; readonly requiresThirdPartyProcessing = false;
  async createAvatar(request: PhotorealisticAvatarRequest): Promise<AvatarIdentityModel> { const now=new Date().toISOString(); const hash=request.images[0].dataUrl.slice(0,3000).split('').reduce((v,c)=>(v*33+c.charCodeAt(0))>>>0,5381); return { avatarId:`avatar-${Date.now()}`, displayName:request.displayName, sourceImages:request.consent.localStorage?request.images.map(i=>({...i,storedLocally:true})):request.images.map(i=>({...i,dataUrl:'',storedLocally:false})), generatedAssetUrl:`local://procedural-three/${hash.toString(16)}`, provider:this.id, realismLevel:request.realismLevel, faceShapeApproximation:'unknown', skinToneApproximation:['#b98268','#a96f57','#c08b70','#8f5f4c'][hash%4], hairApproximation:{style:'unknown',color:['#211b19','#382a24','#171d1d'][(hash>>>4)%3]}, consentStatus:{imageProcessing:true,localStorage:request.consent.localStorage,thirdPartyProcessing:false,modelImprovement:false}, createdAt:now, updatedAt:now }; }
  async updateAvatar(model: AvatarIdentityModel): Promise<AvatarIdentityModel> { return {...model,updatedAt:new Date().toISOString()}; }
  async deleteAvatar(_model: AvatarIdentityModel): Promise<void> { return; }
  async getAvatarAsset(model: AvatarIdentityModel): Promise<AvatarAssetDescriptor> { return {id:model.avatarId,provider:'procedural-three',displayName:model.displayName,skinTone:model.skinToneApproximation,hairTone:model.hairApproximation.color,jacketTone:'#24302f',shirtTone:'#e8eeeb',background:'professional-office',supportsBlendshapes:true,supportsRiggedBody:true}; }
  status(){return{available:true,message:'Active local Three.js head-and-shoulders provider.'};}
}
