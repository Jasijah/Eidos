import { useCallback, useEffect, useState } from 'react';
import { App } from '../App';
import { AdminRoute } from '../auth/AdminRoute';
import { AdminAuthService } from '../auth/AdminAuthService';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { PublicLandingPage } from '../pages/PublicLandingPage';
import { SignupPage } from './SignupPage';
import { normalizeRoute, PROTECTED_ROUTES } from './routes';
export function SiteRouter(){const[path,setPath]=useState(()=>normalizeRoute(window.location.pathname));useEffect(()=>{const handler=()=>setPath(normalizeRoute(window.location.pathname));window.addEventListener('popstate',handler);return()=>window.removeEventListener('popstate',handler)},[]);const navigate=useCallback((next:string)=>{history.pushState({},'',next);setPath(normalizeRoute(next));window.scrollTo({top:0,behavior:'smooth'})},[]);const logout=useCallback(async()=>{await new AdminAuthService().logout();navigate('/')},[navigate]);if(window.eidosDesktop)return <App/>;if(path==='/join-beta'||path==='/signup')return <SignupPage navigate={navigate}/>;if(path==='/admin-login')return <AdminLoginPage navigate={navigate}/>;const initialPage=PROTECTED_ROUTES[path];if(initialPage)return <AdminRoute onDenied={()=>navigate('/')}>{session=><App initialPage={initialPage} adminEmail={session.email} onAdminLogout={logout}/>}</AdminRoute>;return <PublicLandingPage navigate={navigate}/>}
