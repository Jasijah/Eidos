import type { AvatarAssetDescriptor } from '../AvatarAssetProvider';
import type { AvatarIdentityModel } from '../AvatarIdentityModel';
import type { PhotorealisticAvatarProvider, PhotorealisticAvatarRequest } from '../PhotorealisticAvatarGenerator';

export class VRMProvider implements PhotorealisticAvatarProvider {
  readonly id='vrm' as const; readonly displayName='VRM Provider'; readonly available=true; readonly requiresThirdPartyProcessing=false;
  async createAvatar(request: PhotorealisticAvatarRequest): Promise<AvatarIdentityModel> { const now=new Date().toISOString(); return {avatarId:`vrm-${Date.now()}`,displayName:request.displayName,sourceImages:request.consent.localStorage?request.images:request.images.map(i=>({...i,dataUrl:'',storedLocally:false})),generatedAssetUrl:'local://vrm-realistic-placeholder',provider:this.id,realismLevel:request.realismLevel,faceShapeApproximation:'unknown',skinToneApproximation:'#b98268',hairApproximation:{style:'unknown',color:'#211b19'},consentStatus:{imageProcessing:true,localStorage:request.consent.localStorage,thirdPartyProcessing:false,modelImprovement:false},createdAt:now,updatedAt:now}; }
  async updateAvatar(model: AvatarIdentityModel): Promise<AvatarIdentityModel>{return{...model,updatedAt:new Date().toISOString()};}
  async deleteAvatar(_model: AvatarIdentityModel): Promise<void>{return;}
  async getAvatarAsset(model: AvatarIdentityModel): Promise<AvatarAssetDescriptor>{return{id:model.avatarId,provider:'vrm',displayName:model.displayName,skinTone:model.skinToneApproximation,hairTone:model.hairApproximation.color,jacketTone:'#24302f',shirtTone:'#e8eeeb',background:'professional-office',modelUrl:model.generatedAssetUrl.startsWith('blob:')||/\.vrm($|\?)/i.test(model.generatedAssetUrl)?model.generatedAssetUrl:undefined,supportsBlendshapes:true,supportsRiggedBody:true};}
  status(){return{available:true,message:'Active VRM standard with local realistic fallback until a .vrm asset is imported.'};}
}
