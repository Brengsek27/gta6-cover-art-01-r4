const TAU=Math.PI*2;
const captions={boulevard:['OCEAN DRIVE','6:42 PM','GOLDEN HOUR'],pier:['PIER 9','5:17 PM','ONE LAST CAST'],marina:['MARINA DEL SOL','7:40 PM','NO WITNESSES'],street:['VICE STRIP','8:03 PM','FULL THROTTLE'],user:['YOUR SCENE','RIGHT NOW','MAIN CHARACTER']};
function fit(ctx,img,x,y,w,h,zoom=1,cropY=.5){
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight)*zoom;
  const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
  ctx.drawImage(img,x+(w-width)/2,y+(h-height)*(height>h?cropY:.5),width,height);
}

function tint(ctx,x,y,w,h,kind,ink,cool=false){
  ctx.save();
  ctx.globalCompositeOperation='saturation';
  ctx.fillStyle=kind==='golden'?'#f08b42':'#ff6653';
  ctx.globalAlpha=kind==='neon'?.22:.13;
  ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='soft-light';
  ctx.fillStyle='#ff526c';
  ctx.globalAlpha=.26;
  ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='screen';
  ctx.fillStyle='#f7a142';
  ctx.globalAlpha=cool?.12:.07;
  ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='multiply';
  if(cool){
    ctx.fillStyle='#ffd17d';
    ctx.globalAlpha=.34;
    ctx.fillRect(x,y,w,h);
  }
  if(ink){
    ctx.fillStyle='#291029';
    ctx.globalAlpha=.12;
    ctx.fillRect(x,y,w,h);
  }
  ctx.restore();
}

function panel(ctx,p,img,opts,name){
  const rim=opts.w*.007;
  const cropY=p.cropY??({boulevard:.06,pier:0}[name]??.5);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.6)';
  ctx.shadowBlur=Math.max(12,opts.w*.025);
  ctx.shadowOffsetX=-opts.w*.012;
  ctx.shadowOffsetY=opts.h*.018;
  ctx.fillStyle='#fff7df';
  ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.shadowColor='transparent';
  ctx.beginPath();
  ctx.rect(p.x+rim,p.y+rim,p.w-rim*2,p.h-rim*2);
  ctx.clip();
  ctx.filter=opts.grade==='golden'?'saturate(1.3) contrast(1.055)':'saturate(1.4) contrast(1.06)';
  fit(ctx,img,p.x+rim,p.y+rim,p.w-rim*2,p.h-rim*2,opts.zoom,cropY);
  ctx.filter='none';
  tint(ctx,p.x,p.y,p.w,p.h,opts.grade,opts.ink,name==='pier');
  ctx.restore();
}

function chip(ctx,p,w,h,name){
  const unit=Math.min(w,h*1.45);
  const pad=unit*.019,chipHeight=unit*.026;
  const label=(captions[name]||captions.user).join(' · ');
  ctx.save();
  const font=unit*.011;
  ctx.font=`700 ${font}px system-ui`;
  const maxWidth=Math.min(p.w-pad*2,p.chipMaxWidth??Infinity);
  const textWidth=Math.min(ctx.measureText(label).width,maxWidth-pad*2.5);
  const chipWidth=textWidth+pad*2.5;
  const x=p.chipRight?p.x+p.w-pad-chipWidth:p.x+pad;
  const y=p.y+p.h-chipHeight-pad;
  ctx.fillStyle='rgba(18,10,20,.9)';
  ctx.fillRect(x,y,chipWidth,chipHeight);
  ctx.fillStyle='#ffd26a';
  ctx.beginPath();
  ctx.arc(x+pad*.65,y+chipHeight/2,unit*.002,0,TAU);
  ctx.fill();
  ctx.fillStyle='#fff5db';
  ctx.textBaseline='middle';
  ctx.fillText(label,x+pad*1.35,y+chipHeight/2,textWidth);
  ctx.restore();
}

function title(ctx,text,sub,w,h,layout){
  const titleScale=layout==='stack'?.09:layout==='tilt'?.075:.105;
  const heightScale=layout==='stack'?.102:layout==='tilt'?.108:.145;
  const size=Math.min(w*titleScale,h*heightScale);
  const baseline=h*({collage:.71,stack:.82,tilt:.855}[layout]??.79);
  ctx.save();
  ctx.textAlign='center';
  ctx.lineJoin='round';
  ctx.font=`${size}px Anton`;
  const titleWidth=w*.82;
  ctx.fillStyle='#2a0a24';
  ctx.fillText(text,w/2-8,baseline+12,titleWidth);
  ctx.lineWidth=size/9;
  ctx.strokeStyle='#160a18';
  ctx.strokeText(text,w/2,baseline,titleWidth);
  const gradient=ctx.createLinearGradient(0,baseline-size,0,baseline);
  gradient.addColorStop(0,'#fff6dd');
  gradient.addColorStop(.52,'#ffb347');
  gradient.addColorStop(1,'#ff7a3c');
  ctx.fillStyle=gradient;
  ctx.fillText(text,w/2,baseline,titleWidth);
  ctx.lineWidth=1;
  ctx.strokeStyle='rgba(255,255,255,.42)';
  ctx.strokeText(text,w/2,baseline-2,titleWidth);

  const scriptSize=Math.max(24,size*.35);
  ctx.font=`${scriptSize}px Pacifico`;
  const scriptWidth=w*.59;
  const metrics=ctx.measureText(sub);
  const angle=-Math.PI/60;
  const rise=Math.min(metrics.width,scriptWidth)/2*Math.sin(-angle);
  const offset=Math.max(scriptSize*.85,metrics.actualBoundingBoxAscent+rise+4);
  ctx.translate(w*(layout==='collage'?.62:.64),baseline+offset);
  ctx.rotate(angle);
  ctx.strokeStyle='#2b0a29';
  ctx.lineWidth=scriptSize*.13;
  ctx.shadowColor='#14081f';
  ctx.shadowBlur=scriptSize*.24;
  ctx.shadowOffsetY=scriptSize*.1;
  ctx.strokeText(sub,0,0,scriptWidth);
  ctx.shadowColor='#ff3a9d';
  ctx.shadowBlur=scriptSize*.36;
  ctx.shadowOffsetY=0;
  ctx.fillStyle='#ff65b0';
  ctx.fillText(sub,0,0,scriptWidth);
  ctx.restore();
}
function seal(ctx,x,y,r){ctx.save();ctx.translate(x,y);ctx.rotate(.14);ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=14;ctx.fillStyle='#e5a92f';ctx.beginPath();for(let i=0;i<32;i++){const a=i*Math.PI/16,rr=i%2?r:r*.78;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff0ab';ctx.setLineDash([4,3]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.72,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.textAlign='center';ctx.fillStyle='#321325';ctx.font=`700 ${r*.12}px system-ui`;ctx.fillText('LIMITED EDITION',0,-r*.48);ctx.font=`${r*.31}px Anton`;ctx.fillText('VICE',0,-r*.05);ctx.fillText('HEAT',0,r*.25);ctx.font=`700 ${r*.11}px system-ui`;ctx.fillText('NO. 001 / NC',0,r*.53);ctx.restore()}
function footer(ctx,w,h,top){
  const unit=Math.min(w,h*1.45);
  const logoX=w*.035,logoY=top+h*.009,logoWidth=unit*.056,logoHeight=h*.043;
  const editionX=logoX+logoWidth+unit*.013;
  ctx.save();
  ctx.fillStyle='#14081f';
  ctx.fillRect(0,top,w,h-top);
  ctx.strokeStyle='#fff0d1';
  ctx.lineWidth=Math.max(1,unit*.0012);
  ctx.strokeRect(logoX,logoY,logoWidth,logoHeight);
  ctx.fillStyle='#fff0d1';
  ctx.textBaseline='middle';
  ctx.textAlign='center';
  ctx.font=`${unit*.023}px Anton`;
  ctx.fillText('NC',logoX+logoWidth/2,logoY+logoHeight/2);
  ctx.textBaseline='alphabetic';
  ctx.textAlign='left';
  ctx.font=`700 ${unit*.01}px system-ui`;
  ctx.fillText('NEON COAST EDITION',editionX,top+h*.027);
  ctx.font=`${unit*.0075}px system-ui`;
  ctx.fillText('MAKE YOUR OWN LEGEND · VOL. 06',editionX,top+h*.044);
  ctx.fillStyle='#ffd166';
  const barcodeX=w*.965-unit*.076;
  for(let index=0;index<18;index++){
    ctx.fillRect(barcodeX+index*unit*.0043,top+h*.01,(index%3?1:2)*unit*.0015,h*.026);
  }
  ctx.fillStyle='#fff0d1';
  ctx.font=`${unit*.007}px system-ui`;
  ctx.fillText('0 02026 NC001',barcodeX,top+h*.05);
  ctx.fillText('NEON COAST STUDIO · AN INDEPENDENT PICTURE · YOUR CITY. YOUR STORY. YOUR RULES.',logoX,h*.992);
  ctx.textAlign='right';
  ctx.fillText('EST. MMXXVI',w*.965,h*.992);
  ctx.restore();
}

export function drawCover(canvas,photos,opts){
  const ctx=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height,footerTop=h*.93;
  const names=opts.names||['boulevard','pier','marina','street'];
  const get=index=>photos[index%photos.length];
  const panels=[];
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,w,footerTop);
  ctx.clip();
  ctx.fillStyle='#24132e';
  ctx.fillRect(0,0,w,footerTop);
  if(opts.layout==='collage'){
    panels.push(
      {x:w*.035,y:h*.035,w:w*.52,h:h*.76},
      {x:w*.57,y:h*.035,w:w*.395,h:h*.45},
      {x:w*.57,y:h*.51,w:w*.395,h:h*.285,chipRight:true},
      {x:w*.035,y:h*.81,w:w*.93,h:h*.115}
    );
  }else if(opts.layout==='stack'){
    const middleHeight=w/h>1.4?.22:.25;
    panels.push(
      {x:w*.05,y:h*.04,w:w*.9,h:h*.43,cropY:.04},
      {x:w*.05,y:h*.49,w:w*.43,h:h*middleHeight},
      {x:w*.52,y:h*.49,w:w*.43,h:h*middleHeight},
      {x:w*.05,y:h*.76,w:w*.9,h:h*.165}
    );
  }else if(opts.layout==='duo'){
    panels.push({x:w*.035,y:h*.035,w:w*.455,h:h*.78},{x:w*.51,y:h*.035,w:w*.455,h:h*.78});
  }else if(opts.layout==='hero'){
    panels.push({x:w*.035,y:h*.035,w:w*.93,h:h*.84});
  }else{
    fit(ctx,get(3),0,0,w,h);
    tint(ctx,0,0,w,h,opts.grade,opts.ink);
    ctx.fillStyle='rgba(20,8,30,.3)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#ffbd57';
    ctx.beginPath();
    ctx.arc(w*.78,h*.24,w*.12,0,TAU);
    ctx.fill();
    panels.push(
      {x:w*.06,y:h*.1,w:w*.37,h:h*.52,rot:-.1,chipMaxWidth:w*.185},
      {x:w*.31,y:h*.16,w:w*.42,h:h*.58},
      {x:w*.66,y:h*.12,w:w*.29,h:h*.46,rot:.09}
    );
  }
  panels.forEach((p,index)=>{
    const name=names[index%photos.length];
    ctx.save();
    let bounds=p;
    if(p.rot){
      ctx.translate(p.x+p.w/2,p.y+p.h/2);
      ctx.rotate(p.rot);
      bounds={...p,x:-p.w/2,y:-p.h/2};
    }
    panel(ctx,bounds,get(index),{...opts,w,h},name);
    chip(ctx,bounds,w,h,name);
    ctx.restore();
  });
  if(opts.layout==='collage'){
    ctx.fillStyle='#fff0d1';
    ctx.font=`700 ${w*.012}px system-ui`;
    ctx.fillText('★★★★★  "PURE GOLDEN-HOUR MAYHEM" — THE LEONIDA POST',w*.06,h*.548);
  }
  if(opts.stars){
    const x=w*.78,y=h*.055,pw=w*.19,ph=h*.095;
    ctx.save();
    ctx.fillStyle='rgba(20,10,23,.88)';
    ctx.beginPath();
    ctx.roundRect(x,y,pw,ph,ph*.28);
    ctx.fill();
    ctx.textAlign='center';
    ctx.fillStyle='#ffd166';
    ctx.font=`${w*.026}px system-ui`;
    ctx.fillText('★★★★★',x+pw/2,y+ph*.53);
    ctx.fillStyle='#fff1ce';
    ctx.font=`700 ${w*.009}px system-ui`;
    ctx.fillText(opts.sticker||'MAXIMUM HEAT',x+pw/2,y+ph*.82);
    ctx.restore();
  }
  title(ctx,(opts.caption||'NEON COAST').toUpperCase(),opts.sub||'vice heat rising',w,h,opts.layout);
  if(opts.layout==='tilt')seal(ctx,w*.9,h*.675,w*.04);
  else seal(ctx,w*.78,h*.58,w*.055);
  ctx.save();
  ctx.strokeStyle='#fff0d1';
  ctx.globalAlpha=.75;
  ctx.lineWidth=Math.max(1,w*.0015);
  ctx.strokeRect(w*.018,h*.018,w*.964,footerTop-h*.018);
  ctx.restore();
  if(opts.grain){
    ctx.save();
    ctx.globalAlpha=.08;
    for(let index=0;index<w*h/220;index++){
      ctx.fillStyle=Math.random()>.5?'#fff':'#000';
      ctx.fillRect(Math.random()*w,Math.random()*footerTop,1,1);
    }
    ctx.restore();
  }
  const vignette=ctx.createRadialGradient(w/2,h/2,w*.25,w/2,h/2,w*.72);
  vignette.addColorStop(0,'transparent');
  vignette.addColorStop(1,'rgba(13,4,20,.42)');
  ctx.fillStyle=vignette;
  ctx.fillRect(0,0,w,h);
  ctx.restore();
  footer(ctx,w,h,footerTop);
}
