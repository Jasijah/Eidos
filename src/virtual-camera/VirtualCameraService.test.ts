import { describe, expect, it } from 'vitest';
import { VirtualCameraService } from './VirtualCameraService';
describe('VirtualCameraService',()=>{
  it('always exposes the OBS fallback',async()=>{const routes=await new VirtualCameraService().routes();expect(routes.find(route=>route.route==='obs')?.available).toBe(true);expect(routes.find(route=>route.route==='native')?.available).toBe(false);});
  it('does not claim a native camera without a driver',async()=>{await expect(new VirtualCameraService().startNative({width:1280,height:720,frameRate:30})).resolves.toMatchObject({started:false});});
});