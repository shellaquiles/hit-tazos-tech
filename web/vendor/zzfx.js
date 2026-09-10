// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
(function (root) {
  'use strict';
  let zzfxV = 0.3;
  let zzfxX = null;

  function zzfx(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0) {
    if (Array.isArray(p)) return zzfx(...p);
    if (!zzfxX) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) zzfxX = new AudioCtx();
      } catch (_) {
        return null;
      }
    }
    if (!zzfxX) return null;
    if (zzfxX.state === 'suspended') {
      zzfxX.resume().catch(() => {});
    }
    let M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,c2=0,a=0,n=1,I=0,S=0,f=0,h;
    e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;
    for(h=e+m+r+t+c|0;a<h;k[a++]=f)
      ++I%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),
      f=(l?1<l?2<l?3<l?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g))*(a<e?a/e:a<e+m?1:a<e+m+r?1-(a-e-m)/r*(1-D):a<e+m+r+t?D:a<e+m+r+t+c?(1-(a-e-m-r-t)/c)*D:0),
      f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),
      g+=C+=G+=y,
      c2+=v,
      C*=1-c2,
      B&&(++S%(B*R|0)||(C=b,G=u,c2=0));
    try {
      p=zzfxX.createBuffer(1,h,R);
      p.getChannelData(0).set(k);
      b=zzfxX.createBufferSource();
      b.buffer=p;
      b.connect(zzfxX.destination);
      b.start();
      return b;
    } catch (_) {
      return null;
    }
  }

  root.zzfx = zzfx;
  root.zzfxV = zzfxV;
  root.ZZFX = { zzfx, zzfxV };
})(typeof window !== 'undefined' ? window : this);
