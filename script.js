
(() => {
'use strict';
const $=id=>document.getElementById(id);
const fmt=n=>Number.isFinite(n)?(Math.abs(n)<1e-12?0:Number(n.toFixed(10))).toString():String(n);
const esc=s=>String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const HIST='mathbox-history-v5'; let angleDeg=true, seqType='arith';
const THEME_KEY='mathbox-theme-v2'; const theme=localStorage.getItem(THEME_KEY); if(theme==='light') document.body.classList.add('light');
if($('themeToggle')){$('themeToggle').textContent=document.body.classList.contains('light')?'🌙':'☀️';$('themeToggle').onclick=()=>{document.body.classList.toggle('light');const isLight=document.body.classList.contains('light');localStorage.setItem(THEME_KEY,isLight?'light':'dark');$('themeToggle').textContent=isLight?'🌙':'☀️';if(typeof drawGraph==='function')drawGraph()}}
function addHistory(type,input,result){let h=JSON.parse(localStorage.getItem(HIST)||'[]');h.unshift({type,input,result,time:new Date().toLocaleString('zh-TW')});localStorage.setItem(HIST,JSON.stringify(h.slice(0,100)));if($('historyList'))renderHistory()}
function renderHistory(){const h=JSON.parse(localStorage.getItem(HIST)||'[]');$('historyList').innerHTML=h.length?h.map((x,i)=>`<div class="history-item"><div><div class="history-value">${esc(x.type)}：${esc(x.input)}</div><div>${esc(x.result)}</div><div class="history-meta">${esc(x.time)}</div></div><button class="secondary" data-del-history="${i}">刪除</button></div>`).join(''):'<div class="empty">目前沒有計算紀錄</div>';document.querySelectorAll('[data-del-history]').forEach(b=>b.onclick=()=>{let a=JSON.parse(localStorage.getItem(HIST)||'[]');a.splice(+b.dataset.delHistory,1);localStorage.setItem(HIST,JSON.stringify(a));renderHistory()})}
if($('historyList')){renderHistory();$('clearHistory').onclick=()=>{if(confirm('確定要清除全部紀錄嗎？')){localStorage.removeItem(HIST);renderHistory()}}}
function factorial(n){n=Number(n);if(!Number.isInteger(n)||n<0||n>170)throw Error('階乘只支援 0～170 的整數');let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function prepareExpr(expr){let s=String(expr).trim().replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replaceAll('π','PI').replace(/\^/g,'**');if(!/^[0-9A-Za-z_+\-*/().,%\s]+$/.test(s))throw Error('含有不支援的符號');s=s.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');s=s.replace(/(\d|\)|PI|E|x)\s*(?=(PI|E|x|sin|cos|tan|sqrt|abs|ln|log)\s*\()/g,'$1*');s=s.replace(/(\d|\)|PI|E|x)\s*(?=(PI|E|x))/g,'$1*');return s}
function evaluateExpression(expr,x=0){let s=prepareExpr(expr);if((s.match(/\(/g)||[]).length!==(s.match(/\)/g)||[]).length)throw Error('括號數量不一致');s=s.replace(/(\d+(?:\.\d+)?|\([^()]+\))!/g,'factorial($1)');const args=['sin','cos','tan','sqrt','abs','ln','log','exp','floor','ceil','round','factorial','PI','E','x'];const vals=[a=>angleDeg?Math.sin(a*Math.PI/180):Math.sin(a),a=>angleDeg?Math.cos(a*Math.PI/180):Math.cos(a),a=>angleDeg?Math.tan(a*Math.PI/180):Math.tan(a),Math.sqrt,Math.abs,Math.log,Math.log10,Math.exp,Math.floor,Math.ceil,Math.round,factorial,Math.PI,Math.E,x];const v=new Function(...args,'return ('+s+');')(...vals);if(!Number.isFinite(v))throw Error('結果不是有限數值');return v}
if($('angleMode'))$('angleMode').onclick=()=>{angleDeg=!angleDeg;$('angleMode').textContent=angleDeg?'度 DEG':'弧度 RAD';$('angleMode').classList.toggle('active',angleDeg)};
if($('calcDisplay')){const calc=()=>{const input=$('calcDisplay').value;if(!input.trim())return;try{const v=evaluateExpression(input);$('calcDisplay').value=fmt(v);addHistory('計算機',input,fmt(v))}catch(e){$('calcDisplay').value='錯誤：'+e.message}};document.querySelectorAll('[data-calc]').forEach(b=>b.onclick=()=>{const v=b.dataset.calc,d=$('calcDisplay');if(v==='=')return calc();if(v==='C')d.value='';else if(v==='⌫')d.value=d.value.slice(0,-1);else d.value+=v;d.focus()});$('calcDisplay').onkeydown=e=>{if(e.key==='Enter')calc()}}
if($('solveQuadratic'))$('solveQuadratic').onclick=()=>{const a=+$('qa').value,b=+$('qb').value,c=+$('qc').value,r=$('quadraticResult');if(!Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(c)||a===0){r.innerHTML='<span class="error">a 不可為 0，且係數必須是數字。</span>';return}const D=b*b-4*a*c;let h=`<div class="result-title">判別式 Δ = ${fmt(D)}</div><div class="step">Δ = b² − 4ac = ${fmt(D)}</div>`;if(D>0){const x1=(-b+Math.sqrt(D))/(2*a),x2=(-b-Math.sqrt(D))/(2*a);h+=`<div class="step">x = (−b ± √Δ)/(2a)</div><div class="success">x₁ = ${fmt(x1)}，x₂ = ${fmt(x2)}</div>`}else if(D===0){h+=`<div class="success">重根 x = ${fmt(-b/(2*a))}</div>`}else{h+=`<div>沒有實數根。</div><div class="success">複數根：${fmt(-b/(2*a))} ± ${fmt(Math.sqrt(-D)/(2*a))}i</div>`}r.innerHTML=h;addHistory('二次方程式',`a=${a}, b=${b}, c=${c}`,h.replace(/<[^>]+>/g,' '))};
let canvas,ctx,view={xmin:-10,xmax:10,ymin:-10,ymax:10};
function niceStep(v){const p=10**Math.floor(Math.log10(v||1)),q=v/p;return(q<=1?1:q<=2?2:q<=5?5:10)*p}
function syncView(){view.xmin=+$('xMin').value;view.xmax=+$('xMax').value;view.ymin=+$('yMin').value;view.ymax=+$('yMax').value}
function drawGraph(){if(!$('graphCanvas'))return;canvas=$('graphCanvas');ctx=canvas.getContext('2d');try{syncView();if(!(view.xmax>view.xmin&&view.ymax>view.ymin))throw Error('座標範圍無效');const w=canvas.width,h=canvas.height,dark=!document.body.classList.contains('light'),grid=dark?'#334056':'#dfe6ef',axis=dark?'#e8edf7':'#334155',text=dark?'#aeb9cc':'#64748b',X=x=>(x-view.xmin)/(view.xmax-view.xmin)*w,Y=y=>h-(y-view.ymin)/(view.ymax-view.ymin)*h;ctx.clearRect(0,0,w,h);ctx.strokeStyle=grid;ctx.lineWidth=1;const sx=niceStep((view.xmax-view.xmin)/10),sy=niceStep((view.ymax-view.ymin)/10);for(let x=Math.ceil(view.xmin/sx)*sx;x<=view.xmax;x+=sx){ctx.beginPath();ctx.moveTo(X(x),0);ctx.lineTo(X(x),h);ctx.stroke()}for(let y=Math.ceil(view.ymin/sy)*sy;y<=view.ymax;y+=sy){ctx.beginPath();ctx.moveTo(0,Y(y));ctx.lineTo(w,Y(y));ctx.stroke()}ctx.strokeStyle=axis;ctx.lineWidth=1.5;if(view.xmin<=0&&view.xmax>=0){ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke()}if(view.ymin<=0&&view.ymax>=0){ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke()}ctx.fillStyle=text;ctx.font='12px sans-serif';const expr=$('functionInput').value;ctx.strokeStyle='#4169e1';ctx.lineWidth=2.5;ctx.beginPath();let started=false,prev=null;for(let px=0;px<w;px++){const x=view.xmin+(view.xmax-view.xmin)*px/(w-1);let y;try{y=evaluateExpression(expr,x)}catch{continue}if(Math.abs(y)>1e7){started=false;prev=null;continue}const py=Y(y);if(!started||prev===null||Math.abs(py-prev)>h*1.5){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py);prev=py}ctx.stroke();$('graphMessage').textContent=''}catch(e){$('graphMessage').textContent=e.message}}
if($('graphCanvas')){canvas=$('graphCanvas');ctx=canvas.getContext('2d');$('drawGraph').onclick=drawGraph;$('resetGraph').onclick=()=>{$('functionInput').value='x^2-4';$('xMin').value=-10;$('xMax').value=10;$('yMin').value=-10;$('yMax').value=10;drawGraph()};document.querySelectorAll('[data-insert]').forEach(b=>b.onclick=()=>{$('functionInput').value+=b.dataset.insert;drawGraph()});let drag=false,last={x:0,y:0};canvas.onpointerdown=e=>{drag=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!drag)return;const dx=e.clientX-last.x,dy=e.clientY-last.y,sx=(view.xmax-view.xmin)/canvas.clientWidth,sy=(view.ymax-view.ymin)/canvas.clientHeight;view.xmin-=dx*sx;view.xmax-=dx*sx;view.ymin+=dy*sy;view.ymax+=dy*sy;$('xMin').value=view.xmin;$('xMax').value=view.xmax;$('yMin').value=view.ymin;$('yMax').value=view.ymax;last={x:e.clientX,y:e.clientY};drawGraph()};canvas.onpointerup=()=>drag=false;canvas.ondblclick=()=>$('resetGraph').click();canvas.onwheel=e=>{e.preventDefault();syncView();const f=e.deltaY<0?.82:1.22,r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width,my=(e.clientY-r.top)/r.height,cx=view.xmin+mx*(view.xmax-view.xmin),cy=view.ymax-my*(view.ymax-view.ymin);view.xmin=cx+(view.xmin-cx)*f;view.xmax=cx+(view.xmax-cx)*f;view.ymin=cy+(view.ymin-cy)*f;view.ymax=cy+(view.ymax-cy)*f;$('xMin').value=view.xmin;$('xMax').value=view.xmax;$('yMin').value=view.ymin;$('yMax').value=view.ymax;drawGraph()};drawGraph()}
if($('analyzeFunction'))$('analyzeFunction').onclick=()=>{const expr=$('analysisInput').value,a=+$('analysisMin').value,b=+$('analysisMax').value,r=$('analysisResult');if(!(b>a)){r.innerHTML='<span class="error">分析範圍無效。</span>';return}try{let min={x:a,y:Infinity},max={x:a,y:-Infinity},roots=[];const N=2000,dx=(b-a)/N;let prevX=a,prevY=evaluateExpression(expr,a);for(let i=0;i<=N;i++){const x=a+i*dx;let y;try{y=evaluateExpression(expr,x)}catch{continue}if(Number.isFinite(y)){if(y<min.y)min={x,y};if(y>max.y)max={x,y};if(i>0&&prevY*y<0){let lo=prevX,hi=x;for(let k=0;k<35;k++){const mid=(lo+hi)/2,ym=evaluateExpression(expr,mid);if(prevY*ym<=0)hi=mid;else{lo=mid;prevY=ym}}roots.push((lo+hi)/2)}prevX=x;prevY=y}}let h=`<div>近似最小值：(${fmt(min.x)}, ${fmt(min.y)})</div><div>近似最大值：(${fmt(max.x)}, ${fmt(max.y)})</div><div>x 截距：${roots.length?roots.map(fmt).join('、'):'未找到'}</div><div>y 截距：${fmt(evaluateExpression(expr,0))}</div>`;const m=expr.match(/^\s*([+-]?\d*\.?\d+)\*?x\^2\s*([+-]\s*\d*\.?\d+)?\*?x?\s*([+-]\s*\d*\.?\d+)?\s*$/);if(m){const A=parseFloat(m[1]),B=m[2]?parseFloat(m[2].replace(/\s/g,'')):0,C=m[3]?parseFloat(m[3].replace(/\s/g,'')):0;const xv=-B/(2*A),yv=A*xv*xv+B*xv+C;h+=`<div>二次函數頂點：(${fmt(xv)}, ${fmt(yv)})</div><div>對稱軸：x = ${fmt(xv)}</div>`}r.innerHTML=h;addHistory('函數分析',expr,h.replace(/<[^>]+>/g,' '))}catch(e){r.innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
if($('calcStats'))$('calcStats').onclick=()=>{const a=$('statsInput').value.split(/[\s,，]+/).map(Number).filter(Number.isFinite);const r=$('statsResult');if(!a.length){r.innerHTML='<span class="error">請輸入數字。</span>';return}a.sort((x,y)=>x-y);const n=a.length,mean=a.reduce((s,x)=>s+x,0)/n,median=n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,modeMap={};a.forEach(x=>modeMap[x]=(modeMap[x]||0)+1);const maxF=Math.max(...Object.values(modeMap)),modes=maxF>1?Object.keys(modeMap).filter(x=>modeMap[x]===maxF):[];const popVar=a.reduce((s,x)=>s+(x-mean)**2,0)/n,sample=n>1?popVar*n/(n-1):NaN;r.innerHTML=`<div>筆數：${n}</div><div>平均數：${fmt(mean)}</div><div>中位數：${fmt(median)}</div><div>眾數：${modes.length?modes.join('、'):'無重複眾數'}</div><div>最小：${fmt(a[0])}　最大：${fmt(a[n-1])}</div><div>母體變異數：${fmt(popVar)}</div><div>樣本變異數：${fmt(sample)}</div><div>母體標準差：${fmt(Math.sqrt(popVar))}</div>`;addHistory('統計',$('statsInput').value,r.textContent)};
function parseMatrix(s){const rows=s.trim().split(/;|\n/).filter(Boolean).map(r=>r.trim().split(/[\s,，]+/).map(Number));if(!rows.length||rows.some(r=>r.length!==rows[0].length||r.some(x=>!Number.isFinite(x))))throw Error('矩陣格式錯誤');return rows}
function matText(A){return A.map(r=>r.map(fmt).join('　')).join('<br>')}
if($('matrixAdd')){const get=()=>[parseMatrix($('matrixA').value),parseMatrix($('matrixB').value)],out=h=>{$('matrixResult').innerHTML=h};$('matrixAdd').onclick=()=>{try{const[A,B]=get();if(A.length!==B.length||A[0].length!==B[0].length)throw Error('矩陣尺寸必須相同');out(matText(A.map((r,i)=>r.map((x,j)=>x+B[i][j]))))}catch(e){out('<span class="error">'+esc(e.message)+'</span>')}};$('matrixMul').onclick=()=>{try{const[A,B]=get();if(A[0].length!==B.length)throw Error('A 的欄數必須等於 B 的列數');const C=A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));out(matText(C))}catch(e){out('<span class="error">'+esc(e.message)+'</span>')}};$('matrixDet').onclick=()=>{try{const A=parseMatrix($('matrixA').value);out('det(A) = '+fmt(det(A)))}catch(e){out('<span class="error">'+esc(e.message)+'</span>')}};$('matrixInv').onclick=()=>{try{out(matText(inv(parseMatrix($('matrixA').value))))}catch(e){out('<span class="error">'+esc(e.message)+'</span>')}}}
function det(A){if(A.length!==A[0].length)throw Error('行列式只支援方陣');let M=A.map(r=>r.slice()),d=1;for(let i=0;i<M.length;i++){let p=i;for(let j=i+1;j<M.length;j++)if(Math.abs(M[j][i])>Math.abs(M[p][i]))p=j;if(Math.abs(M[p][i])<1e-12)return 0;if(p!==i){[M[p],M[i]]=[M[i],M[p]];d=-d}const q=M[i][i];d*=q;for(let j=i+1;j<M.length;j++){const f=M[j][i]/q;for(let k=i+1;k<M.length;k++)M[j][k]-=f*M[i][k]}}return d}
function inv(A){if(A.length!==A[0].length)throw Error('反矩陣只支援方陣');const n=A.length,M=A.map((r,i)=>r.map(x=>x).concat(Array.from({length:n},(_,j)=>i===j?1:0)));for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-12)throw Error('矩陣不可逆');[M[p],M[c]]=[M[c],M[p]];const q=M[c][c];M[c]=M[c].map(x=>x/q);for(let r=0;r<n;r++)if(r!==c){const f=M[r][c];M[r]=M[r].map((x,j)=>x-f*M[c][j])}}return M.map(r=>r.slice(n))}
if($('calcComb'))$('calcComb').onclick=()=>{const n=+$('combN').value,r=+$('combR').value,o=$('combResult');try{if(!Number.isInteger(n)||!Number.isInteger(r)||n<0||r<0||r>n)throw Error('請輸入 0≤r≤n 的整數');const p=factorial(n)/factorial(n-r),c=p/factorial(r);o.innerHTML=`n! = ${fmt(factorial(n))}<br>P(n,r) = ${fmt(p)}<br>C(n,r) = ${fmt(c)}`;addHistory('排列組合',`n=${n}, r=${r}`,o.textContent)}catch(e){o.innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
if($('calcProb'))$('calcProb').onclick=()=>{const A=+$('probA').value,B=+$('probB').value,n=+$('binN').value,k=+$('binK').value,p=+$('binP').value,o=$('probResult');try{if([A,B,p].some(x=>x<0||x>1)||n<0||k<0||!Number.isInteger(n)||!Number.isInteger(k)||k>n)throw Error('機率需在 0～1，n、k 必須為整數且 k≤n');const choose=factorial(n)/(factorial(k)*factorial(n-k));const bin=choose*p**k*(1-p)**(n-k);o.innerHTML=`P(A補集) = ${fmt(1-A)}<br>若 A、B 獨立：P(A∩B) = ${fmt(A*B)}<br>二項分布 P(X=k) = ${fmt(bin)}`;addHistory('機率',`P(A)=${A}, P(B)=${B}, n=${n}, k=${k}, p=${p}`,o.textContent)}catch(e){o.innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
function bind(id,fn){if($(id))$(id).onclick=fn}
const geom=[['calcCircle',()=>{const r=+$('circleR').value;$('circleResult').textContent=`面積 = ${fmt(Math.PI*r*r)}；周長 = ${fmt(2*Math.PI*r)}`;},'circle'],['calcRect',()=>{$('rectResult').textContent=`面積 = ${fmt(+$('rectW').value*+$('rectH').value)}；周長 = ${fmt(2*(+$('rectW').value+ +$('rectH').value))}`},'rect'],['calcTri',()=>{$('triResult').textContent=`面積 = ${fmt(+$('triB').value*+$('triH').value/2)}`},'tri'],['calcTrap',()=>{$('trapResult').textContent=`面積 = ${fmt((+$('trapA').value+ +$('trapB').value)*+$('trapH').value/2)}`},'trap'],['calcSphere',()=>{const r=+$('sphereR').value;$('sphereResult').textContent=`表面積 = ${fmt(4*Math.PI*r*r)}；體積 = ${fmt(4*Math.PI*r*r*r/3)}`},'sphere'],['calcCylinder',()=>{const r=+$('cylR').value,h=+$('cylH').value;$('cylResult').textContent=`底面積 = ${fmt(Math.PI*r*r)}；體積 = ${fmt(Math.PI*r*r*h)}`},'cyl'],['calcCone',()=>{const r=+$('coneR').value,h=+$('coneH').value;$('coneResult').textContent=`底面積 = ${fmt(Math.PI*r*r)}；體積 = ${fmt(Math.PI*r*r*h/3)}`},'cone'],['calcDistance',()=>{const dx=+$('dx2').value-+$('dx1').value,dy=+$('dy2').value-+$('dy1').value;$('distanceResult').textContent=`距離 = ${fmt(Math.hypot(dx,dy))}`},'distance']];geom.forEach(([id,fn])=>bind(id,fn));
if($('arithBtn')){$('arithBtn').onclick=()=>{seqType='arith';$('arithBtn').classList.add('active');$('geoBtn').classList.remove('active');$('diffLabel').firstChild.textContent='公差 d';};$('geoBtn').onclick=()=>{seqType='geo';$('geoBtn').classList.add('active');$('arithBtn').classList.remove('active');$('diffLabel').firstChild.textContent='公比 r';};$('solveSequence').onclick=()=>{const a=+$('seqA1').value,an=$('seqAn').value===''?null:+$('seqAn').value,n=$('seqN').value===''?null:+$('seqN').value,d=$('seqD').value===''?null:+$('seqD').value,o=$('sequenceResult');try{let common=d;if(an!==null&&n!==null&&n!==1){common=seqType==='arith'?(an-a)/(n-1):Math.pow(an/a,1/(n-1))}if(common===null)throw Error('至少提供公差/公比，或同時提供 aₙ 與 n');let N=n;if(N===null&&an!==null&&seqType==='arith')N=Math.round((an-a)/common+1);if(N===null)throw Error('請提供 n 或可反推的 aₙ');let nth=N?seqType==='arith'?a+(N-1)*common:a*common**(N-1):a;let sum=seqType==='arith'?N*(a+nth)/2:(Math.abs(common-1)<1e-12?a*N:a*(common**N-1)/(common-1));o.innerHTML=`${seqType==='arith'?'公差':'公比'} = ${fmt(common)}<br>第 ${N} 項 = ${fmt(nth)}<br>前 ${N} 項和 = ${fmt(sum)}`;addHistory('數列',o.textContent,o.textContent)}catch(e){o.innerHTML='<span class="error">'+esc(e.message)+'</span>'}}}
const units={length:{m:1,cm:.01,mm:.001,km:1000,ft:.3048,in:.0254},area:{'m²':1,'cm²':1e-4,'km²':1e6,'ft²':.09290304},volume:{L:.001,mL:1e-6,'m³':1,'cm³':1e-6,'ft³':.0283168466},mass:{kg:1,g:.001,mg:1e-6,lb:.45359237},time:{s:1,min:60,h:3600,day:86400}};
function fillUnits(){const cat=$('unitCategory').value,opts=Object.keys(units[cat]||{});$('unitFrom').innerHTML=opts.map(x=>`<option>${x}</option>`).join('');$('unitTo').innerHTML=opts.map(x=>`<option>${x}</option>`).join('');if(cat==='length')$('unitTo').value='cm'}
if($('unitCategory')){$('unitCategory').onchange=fillUnits;fillUnits();$('convertUnit').onclick=()=>{const cat=$('unitCategory').value,v=+$('unitValue').value,f=$('unitFrom').value,t=$('unitTo').value,o=$('unitOutput');if(cat==='temperature'){let c=f==='C'?v:f==='F'?(v-32)*5/9:v-273.15;let z=t==='C'?c:t==='F'?c*9/5+32:c+273.15;o.textContent=`${fmt(z)} ${t}`}else{o.textContent=`${fmt(v*units[cat][f]/units[cat][t])} ${t}`}addHistory('單位換算',`${v} ${f} → ${t}`,o.textContent)}}

// Chemistry: exact rational linear algebra + interactive periodic table
const elements=[
['H','氫',1,1,1],['He','氦',2,18,1],['Li','鋰',3,1,2],['Be','鈹',4,2,2],['B','硼',5,13,2],['C','碳',6,14,2],['N','氮',7,15,2],['O','氧',8,16,2],['F','氟',9,17,2],['Ne','氖',10,18,2],['Na','鈉',11,1,3],['Mg','鎂',12,2,3],['Al','鋁',13,13,3],['Si','矽',14,14,3],['P','磷',15,15,3],['S','硫',16,16,3],['Cl','氯',17,17,3],['Ar','氬',18,18,3],['K','鉀',19,1,4],['Ca','鈣',20,2,4],['Sc','鈧',21,3,4],['Ti','鈦',22,4,4],['V','釩',23,5,4],['Cr','鉻',24,6,4],['Mn','錳',25,7,4],['Fe','鐵',26,8,4],['Co','鈷',27,9,4],['Ni','鎳',28,10,4],['Cu','銅',29,11,4],['Zn','鋅',30,12,4],['Ga','鎵',31,13,4],['Ge','鍺',32,14,4],['As','砷',33,15,4],['Se','硒',34,16,4],['Br','溴',35,17,4],['Kr','氪',36,18,4],['Rb','銣',37,1,5],['Sr','鍶',38,2,5],['Y','釔',39,3,5],['Zr','鋯',40,4,5],['Nb','鈮',41,5,5],['Mo','鉬',42,6,5],['Tc','鎝',43,7,5],['Ru','釕',44,8,5],['Rh','銠',45,9,5],['Pd','鈀',46,10,5],['Ag','銀',47,11,5],['Cd','鎘',48,12,5],['In','銦',49,13,5],['Sn','錫',50,14,5],['Sb','銻',51,15,5],['Te','碲',52,16,5],['I','碘',53,17,5],['Xe','氙',54,18,5],['Cs','銫',55,1,6],['Ba','鋇',56,2,6],['La','鑭',57,3,6],['Ce','鈰',58,4,8],['Pr','鐠',59,5,8],['Nd','釹',60,6,8],['Pm','鉕',61,7,8],['Sm','釤',62,8,8],['Eu','銪',63,9,8],['Gd','釓',64,10,8],['Tb','鋱',65,11,8],['Dy','鏑',66,12,8],['Ho','鈥',67,13,8],['Er','鉺',68,14,8],['Tm','銩',69,15,8],['Yb','鐿',70,16,8],['Lu','鎦',71,17,8],['Hf','鉿',72,4,6],['Ta','鉭',73,5,6],['W','鎢',74,6,6],['Re','錸',75,7,6],['Os','鋨',76,8,6],['Ir','銥',77,9,6],['Pt','鉑',78,10,6],['Au','金',79,11,6],['Hg','汞',80,12,6],['Tl','鉈',81,13,6],['Pb','鉛',82,14,6],['Bi','鉍',83,15,6],['Po','釙',84,16,6],['At','砈',85,17,6],['Rn','氡',86,18,6],['Fr','鍅',87,1,7],['Ra','鐳',88,2,7],['Ac','錒',89,3,9],['Th','釷',90,4,9],['Pa','鏷',91,5,9],['U','鈾',92,6,9],['Np','錼',93,7,9],['Pu','鈽',94,8,9],['Am','鋂',95,9,9],['Cm','鋦',96,10,9],['Bk','鉳',97,11,9],['Cf','鉲',98,12,9],['Es','鑀',99,13,9],['Fm','鐨',100,14,9],['Md','鍆',101,15,9],['No','鍩',102,16,9],['Lr','鐒',103,17,9],['Rf','鑪',104,4,7],['Db','𨧀',105,5,7],['Sg','𨭎',106,6,7],['Bh','𨨏',107,7,7],['Hs','𨭆',108,8,7],['Mt','䥑',109,9,7],['Ds','鐽',110,10,7],['Rg','錀',111,11,7],['Cn','鎶',112,12,7],['Nh','鉨',113,13,7],['Fl','鈇',114,14,7],['Mc','鏌',115,15,7],['Lv','鉝',116,16,7],['Ts','鿬',117,17,7],['Og','鿫',118,18,7]
];
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1}function lcm(a,b){return Math.abs(a/gcd(a,b)*b)}
function parseFormula(f){let i=0;function num(){let s='';while(i<f.length&&/[0-9]/.test(f[i]))s+=f[i++];return s?parseInt(s):1}function group(){const c={};while(i<f.length){if(f[i]===')'){i++;break}if(f[i]==='('){i++;const s=group(),n=num();for(const e in s)c[e]=(c[e]||0)+s[e]*n;continue}if(!/[A-Z]/.test(f[i]))throw Error('化學式格式錯誤：'+f);let e=f[i++];while(i<f.length&&/[a-z]/.test(f[i]))e+=f[i++];c[e]=(c[e]||0)+num()}return c}const r=group();if(i!==f.length)throw Error('括號不完整：'+f);return r}
function f(n,d=1){if(d<0){n=-n;d=-d}if(n===0)return [0,1];const g=gcd(Math.abs(n),Math.abs(d));return [n/g,d/g]}
function fAdd(a,b){return f(a[0]*b[1]+b[0]*a[1],a[1]*b[1])}
function fSub(a,b){return f(a[0]*b[1]-b[0]*a[1],a[1]*b[1])}
function fMul(a,b){return f(a[0]*b[0],a[1]*b[1])}
function fDiv(a,b){if(b[0]===0)throw Error('分數除以零');return f(a[0]*b[1],a[1]*b[0])}
function rrefFraction(A){let m=A.length,n=A[0].length,row=0,piv=[];for(let col=0;col<n&&row<m;col++){let p=row;while(p<m&&A[p][col][0]===0)p++;if(p===m)continue;[A[p],A[row]]=[A[row],A[p]];const pv=A[row][col];A[row]=A[row].map(x=>fDiv(x,pv));for(let r=0;r<m;r++){if(r===row)continue;const factor=A[r][col];if(factor[0]===0)continue;A[r]=A[r].map((x,j)=>fSub(x,fMul(factor,A[row][j])))}piv.push(col);row++}return piv}
function balanceEquation(eq){const clean=eq.replace(/\s+/g,'').replace(/→|=>|=/,'->'),sides=clean.split('->');if(sides.length!==2)throw Error('請用 -> 分隔左右兩邊');const L=sides[0].split('+').filter(Boolean),Rside=sides[1].split('+').filter(Boolean);if(!L.length||!Rside.length)throw Error('左右兩邊都要有物質');const fs=[...L,...Rside],ps=fs.map(parseFormula),els=[...new Set(ps.flatMap(x=>Object.keys(x)))];const M=els.map(e=>fs.map((_,j)=>f((j<L.length?1:-1)*(ps[j][e]||0))));const reduced=M.map(r=>r.map(x=>x.slice()));const piv=rrefFraction(reduced);const free=[...Array(fs.length).keys()].filter(i=>!piv.includes(i));if(!free.length)throw Error('這個反應式沒有非零自由解');const v=Array(fs.length).fill(null).map(()=>f(0));v[free[0]]=f(1);for(let i=piv.length-1;i>=0;i--){const col=piv[i];let sum=f(0);for(let j=col+1;j<fs.length;j++)sum=fAdd(sum,fMul(reduced[i][j],v[j]));v[col]=f(-sum[0],sum[1])}let den=1;v.forEach(x=>den=lcm(den,x[1]));let co=v.map(x=>x[0]*(den/x[1]));let g=co.reduce((a,b)=>gcd(a,b),0);co=co.map(x=>x/g);if(co.some(x=>x<0))co=co.map(x=>-x);if(co.some(x=>x<=0))throw Error('無法取得正整數係數，請確認化學式與反應式是否合理');return {L,R:Rside,co,els}}
function prettyFormula(s){return s.replace(/([A-Za-z)])(\d+)/g,'$1<sub>$2</sub>')}
function showBalanced(r,target){const g=r.co.reduce((a,b)=>gcd(a,b),0);if(g!==1)throw Error('係數沒有化成最簡整數比');const lhs=r.L.map((f,i)=>`${r.co[i]===1?'':r.co[i]}${f}`).join(' + '),rhs=r.R.map((f,i)=>`${r.co[r.L.length+i]===1?'':r.co[r.L.length+i]}${f}`).join(' + ');target.innerHTML=`<div class="result-title success">配平完成</div><div class="formula">${prettyFormula(lhs)} → ${prettyFormula(rhs)}</div><div class="step">最簡整數比：${r.co.join(' : ')}</div><div class="step">最大公因數：${g}</div><div class="step">檢查元素：${r.els.join('、')}</div><div class="hint">提示：係數 1 會省略不顯示，但仍會列在上面的整數比中。</div>`;addHistory('化學方程式',r.L.join(' + ')+' -> '+r.R.join(' + '),lhs+' -> '+rhs)}
if($('balanceChemical')){$('balanceChemical').onclick=()=>{try{showBalanced(balanceEquation($('chemicalInput').value),$('chemicalResult'))}catch(e){$('chemicalResult').innerHTML='<span class="error">'+esc(e.message)+'</span>'}};document.querySelectorAll('[data-chem]').forEach(b=>b.onclick=()=>{$('chemicalInput').value=b.dataset.chem})}
let currentFormula=[],selectedSide='left';
function renderMolecule(){if(!$('moleculePreview'))return;const text=currentFormula.map(x=>x.symbol+(x.count===1?'':`<sub>${x.count}</sub>`)).join('');$('moleculePreview').innerHTML='目前分子：'+(text||'—')}
function buildFormula(){return currentFormula.map(x=>x.symbol+(x.count===1?'':x.count)).join('')}
function renderMolecules(){for(const side of ['left','right']){$(side+'Molecules').innerHTML=(window[side+'Molecules']||[]).map((f,i)=>`<span class="molecule-chip">${prettyFormula(f)} <button data-remove="${side}:${i}" class="mini-x">×</button></span>`).join('')||'<span class="muted">尚無分子</span>'}document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const [s,i]=b.dataset.remove.split(':');window[s+'Molecules'].splice(+i,1);renderMolecules()})}
let leftMolecules=[],rightMolecules=[];window.leftMolecules=leftMolecules;window.rightMolecules=rightMolecules;
function elementCategory(symbol){
  const categories={
    alkali:['Li','Na','K','Rb','Cs','Fr'],
    alkaline:['Be','Mg','Ca','Sr','Ba','Ra'],
    transition:['Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn'],
    post:['Al','Ga','In','Sn','Tl','Pb','Bi','Po','Nh','Fl','Mc','Lv'],
    metalloid:['B','Si','Ge','As','Sb','Te'],
    nonmetal:['H','C','N','O','P','S','Se'],
    halogen:['F','Cl','Br','I','At','Ts'],
    noble:['He','Ne','Ar','Kr','Xe','Rn','Og'],
    lanthanide:['La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu'],
    actinide:['Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr']
  };
  for(const [name,list] of Object.entries(categories)) if(list.includes(symbol)) return name;
  return 'unknown';
}
function initPeriodic(){const p=$('periodicTable');if(!p)return;const map=new Map(elements.map(e=>[e[0],e]));for(let z=1;z<=118;z++){const e=elements[z-1];const div=document.createElement('button');div.type='button';div.style.gridColumn=e[3];div.style.gridRow=e[4];if(z===57||z===89){div.className='element element-series-placeholder';div.disabled=true;div.innerHTML=z===57?'<span class="z">57~71</span><span class="sym">鑭系</span><span class="ename">La–Lu</span>':'<span class="z">89~103</span><span class="sym">錒系</span><span class="ename">Ac–Lr</span>';}else{div.className='element element-'+elementCategory(e[0]);div.dataset.symbol=e[0];div.innerHTML=`<span class="z">${e[2]}</span><span class="sym">${e[0]}</span><span class="ename">${e[1]}</span>`;div.onclick=()=>{$('selectedElement').textContent=`已選：${e[0]} ${e[1]}（${e[2]}）`; $('elementCount').focus(); $('elementCount').select();$('addElement').dataset.symbol=e[0]};}p.appendChild(div)} }
if($('periodicTable')){
  initPeriodic();
  const setSide=side=>{
    selectedSide=side;
    document.querySelectorAll('[data-chem-side]').forEach(b=>b.classList.toggle('active',b.dataset.chemSide===side));
    const label=side==='left'?'反應物':'生成物';
    if($('builderSideLabel'))$('builderSideLabel').textContent='目前加入：'+label;
  };
  document.querySelectorAll('[data-chem-side]').forEach(b=>b.onclick=()=>setSide(b.dataset.chemSide));
  setSide('left');
  const addCurrentToSide=(side)=>{
    const f=buildFormula();
    if(!f)throw Error('目前分子是空的，請先點元素建立分子。');
    (side==='left'?leftMolecules:rightMolecules).push(f);
    currentFormula=[];
    renderMolecule();
    renderMolecules();
    $('builtResult').innerHTML='<div class="success">已加入 '+prettyFormula(f)+'。</div>';
  };
  $('addElement').onclick=()=>{
    const s=$('addElement').dataset.symbol;
    if(!s){$('selectedElement').textContent='請先點選週期表中的元素';return}
    const n=Math.max(1,Math.min(99,parseInt($('elementCount').value)||1));
    currentFormula.push({symbol:s,count:n});
    renderMolecule();
  };
  $('clearMolecule').onclick=()=>{currentFormula=[];renderMolecule();$('builtResult').innerHTML=''};
  document.querySelectorAll('[data-quick-formula]').forEach(b=>b.onclick=()=>{
    try{const f=b.dataset.quickFormula;(selectedSide==='left'?leftMolecules:rightMolecules).push(f);renderMolecules();$('builtResult').innerHTML='<div class="success">已加入 '+prettyFormula(f)+' 到 '+(selectedSide==='left'?'反應物':'生成物')+'。</div>'}catch(e){$('builtResult').innerHTML='<span class="error">'+esc(e.message)+'</span>'}
  });
  $('addToLeft').onclick=()=>{try{addCurrentToSide('left')}catch(e){$('builtResult').innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
  $('addToRight').onclick=()=>{try{addCurrentToSide('right')}catch(e){$('builtResult').innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
  $('clearReaction').onclick=()=>{leftMolecules.length=0;rightMolecules.length=0;currentFormula=[];renderMolecule();renderMolecules();$('builtResult').innerHTML=''};
  $('swapReaction').onclick=()=>{[leftMolecules,rightMolecules]=[rightMolecules,leftMolecules];window.leftMolecules=leftMolecules;window.rightMolecules=rightMolecules;renderMolecules()};
  $('balanceBuilt').onclick=()=>{try{if(!leftMolecules.length||!rightMolecules.length)throw Error('請先把反應物與生成物都加入反應式');showBalanced(balanceEquation(leftMolecules.join('+')+'->'+rightMolecules.join('+')),$('builtResult'))}catch(e){$('builtResult').innerHTML='<span class="error">'+esc(e.message)+'</span>'}};
  const filter=$('elementSearch');
  if(filter)filter.oninput=()=>{const q=filter.value.trim().toLowerCase();document.querySelectorAll('#periodicTable .element').forEach(b=>{const e=elements.find(x=>x[0]===b.dataset.symbol);b.style.display=!q||e[0].toLowerCase().includes(q)||e[1].toLowerCase().includes(q)?'':'none'})};
  renderMolecule();renderMolecules();
}

// MathBox v6：左側功能選單
function initSidebar(){
  if(document.querySelector('.side-menu')) return;
  const page=document.body.dataset.page||'';
  const parts=location.pathname.split('/').filter(Boolean);
  const depth=Math.max(0, parts.length-2);
  const rootPath='';
  const groups=[
    {title:'主要',items:[
      [rootPath+'index.html','🏠','首頁',''],
      [rootPath+'ai.html','🤖','AI 數學助手','ai']
    ]},
    {title:'🧮 數學｜中心',items:[
      [rootPath+'math-center.html','🧮','數學中心','math'],
      [rootPath+'math.html','📚','數學總覽','math-overview']
    ]},
    {title:'➗ 數學｜基礎與代數',items:[
      [rootPath+'math-basic-category.html','➗','基礎計算','basic-math'],
      [rootPath+'basic-math.html','🔢','基礎數學工具','basic-math-root'],
      [rootPath+'calculator.html','🧮','計算機','calculator'],
      [rootPath+'quadratic.html','🔢','二次方程式','quadratic'],
      [rootPath+'math-algebra.html','📐','代數工具','algebra']
    ]},
    {title:'📈 數學｜函數與座標',items:[
      [rootPath+'graph.html','📈','函數繪圖','graph'],
      [rootPath+'analysis.html','📊','函數分析','analysis'],
      [rootPath+'math-functions.html','📈','函數與座標中心','functions'],
      [rootPath+'cubic.html','〽️','三次函數','cubic']
    ]},
    {title:'📐 數學｜幾何',items:[
      [rootPath+'geometry.html','📐','幾何計算','geometry-root'],
      [rootPath+'math-geometry.html','📐','幾何工具中心','geometry'],
      [rootPath+'math-geometry.html','📍','座標幾何','geometry-distance']
    ]},
    {title:'🔢 數學｜數列與數論',items:[
      [rootPath+'sequence.html','🔢','數列計算','sequence-root'],
      [rootPath+'math-sequence.html','🔢','數列工具中心','sequence'],
      [rootPath+'math-number.html','🔍','數論工具','number']
    ]},
    {title:'📊 數學｜統計與機率',items:[
      [rootPath+'statistics.html','📊','統計','statistics-root'],
      [rootPath+'math-statistics.html','📊','統計工具中心','statistics'],
      [rootPath+'probability.html','🎲','機率','probability'],
      [rootPath+'combinatorics.html','🎯','排列組合','combinatorics']
    ]},
    {title:'🔲 數學｜其他工具',items:[
      [rootPath+'matrix.html','🔲','矩陣','matrix'],
      [rootPath+'units.html','📏','單位換算','units']
    ]},
    {title:'📚 學習',items:[
      [rootPath+'education.html','📚','學習中心','education-root'],
      [rootPath+'highschool-math.html','📚','高中數學基礎教學','education'],
      [rootPath+'learning-formulas.html','📖','公式大全','formulas'],
      [rootPath+'practice.html','📝','數學練習題','practice']
    ]},
    {title:'⚗️ 化學',items:[
      [rootPath+'chemistry-category.html','⚗️','化學中心','chemistry-center'],
      [rootPath+'chemistry.html','⚖️','化學方程式配平','chemistry'],
      [rootPath+'chemistry-mole.html','⚖️','莫耳計算','mole'],
      [rootPath+'chemistry-learning.html','📚','高中化學基礎教學','chemistry-learn'],
      [rootPath+'chemistry-learn.html','🧪','化學教學總覽','chemistry-learn-root']
    ]},
    {title:'其他',items:[
      [rootPath+'history.html','🕘','紀錄','history']
    ]}
  ];
  const wrap=document.createElement('div');
  wrap.innerHTML=`<button class="menu-toggle" id="menuToggle" aria-label="開啟功能選單" aria-expanded="false">☰</button><div class="side-overlay" id="sideOverlay"></div><aside class="side-menu" id="sideMenu"><div class="side-brand"><a href="${rootPath}index.html">📐 <span>MathBox</span></a></div><div class="side-title">功能選單</div><nav>${groups.map(g=>`<div class="side-group"><div class="side-group-title">${g.title}</div>${g.items.map(x=>`<a class="side-link ${page===x[3]?'active':''}" href="${x[0]}"><span class="side-icon">${x[1]}</span><span>${x[2]}</span></a>`).join('')}</div>`).join('')}</nav></aside>`;
  document.body.prepend(wrap);
  const btn=$('menuToggle'), menu=$('sideMenu'), overlay=$('sideOverlay');
  const close=()=>{menu.classList.remove('open');overlay.classList.remove('show');btn.setAttribute('aria-expanded','false')};
  btn.onclick=()=>{const open=menu.classList.toggle('open');overlay.classList.toggle('show',open);btn.setAttribute('aria-expanded',String(open))};
  overlay.onclick=close;
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
}

function parseNumberList(text){
  const nums=String(text).replace(/[，、；;]/g,',').split(/\s*,\s*|\s+/).filter(Boolean).map(Number);
  if(!nums.length||nums.some(n=>!Number.isFinite(n))) throw Error('請提供有效的數字，例如 1, 2, 3, 4');
  return nums;
}
function statAnswer(nums){
  const a=[...nums].sort((x,y)=>x-y), n=a.length, sum=a.reduce((x,y)=>x+y,0), mean=sum/n;
  const median=n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;
  const freq=new Map(); a.forEach(x=>freq.set(x,(freq.get(x)||0)+1));
  const maxf=Math.max(...freq.values()); const modes=maxf>1?[...freq].filter(([,f])=>f===maxf).map(([x])=>x):[];
  const variance=a.reduce((s,x)=>s+(x-mean)**2,0)/n;
  return `統計結果\n平均數：${fmt(mean)}\n中位數：${fmt(median)}\n${modes.length?'眾數：'+modes.map(fmt).join('、')+'\n':''}最小值：${fmt(a[0])}\n最大值：${fmt(a[n-1])}\n全距：${fmt(a[n-1]-a[0])}\n母體變異數：${fmt(variance)}\n母體標準差：${fmt(Math.sqrt(variance))}`;
}
function factorialBig(n){
  if(!Number.isInteger(n)||n<0||n>170) throw Error('n 必須是 0～170 的整數');
  return factorial(n);
}
function nPr(n,r){if(!Number.isInteger(n)||!Number.isInteger(r)||n<0||r<0||r>n)throw Error('請確認 n、r 為整數且 0 ≤ r ≤ n');return factorialBig(n)/factorialBig(n-r)}
function nCr(n,r){return nPr(n,r)/factorialBig(r)}
function solveLinearText(raw){
  const eq=raw.match(/(?:解|solve)?\s*(-?\d+(?:\.\d+)?)\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/i);
  if(!eq)return null;
  const a=Number(eq[1]), b=(eq[2]==='-'?-1:1)*Number(eq[3]), c=Number(eq[4]);
  if(a===0)return '這不是一次方程式，因為 x 的係數不能是 0。';
  const x=(c-b)/a;
  return `解題：\n${a}x ${b>=0?'+ ': '- '}${Math.abs(b)} = ${c}\n${a}x = ${fmt(c-b)}\nx = ${fmt(x)}`;
}
function solveQuadraticText(raw){
  let m=raw.match(/(?:解|solve)?\s*(-?\d+(?:\.\d+)?)\s*x\^?2\s*([+-])\s*(\d+(?:\.\d+)?)\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*=\s*0/i);
  if(!m)return null;
  const a=Number(m[1]), b=(m[2]==='-'?-1:1)*Number(m[3]), c=(m[4]==='-'?-1:1)*Number(m[5]);
  if(a===0)return solveLinearText(`${b}x ${c>=0?'+':''}${c}=0`);
  const D=b*b-4*a*c;
  if(D<0)return `判別式 Δ = ${fmt(D)}\n沒有實數根。`;
  if(D===0)return `判別式 Δ = 0\n重根：x = ${fmt(-b/(2*a))}`;
  return `判別式 Δ = ${fmt(D)}\nx₁ = ${fmt((-b+Math.sqrt(D))/(2*a))}\nx₂ = ${fmt((-b-Math.sqrt(D))/(2*a))}`;
}
function geometryText(raw){
  let m=raw.match(/(?:三角形).*?(?:底|base)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:高|height)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m)return `三角形面積 = ${fmt(Number(m[1])*Number(m[2])/2)}`;
  m=raw.match(/(?:梯形).*?(?:上底|a)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:下底|b)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:高|height|h)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m)return `梯形面積 = (上底＋下底)×高÷2 = ${fmt((Number(m[1])+Number(m[2]))*Number(m[3])/2)}`;
  m=raw.match(/(?:圓|圓形).*?(?:半徑|radius|r)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const r=Number(m[1]);return `圓面積 = πr² = ${fmt(Math.PI*r*r)}\n圓周長 = 2πr = ${fmt(2*Math.PI*r)}`}
  m=raw.match(/(?:長方形|矩形).*?(?:長)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:寬)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const l=Number(m[1]),w=Number(m[2]);return `長方形面積 = ${fmt(l*w)}\n周長 = ${fmt(2*(l+w))}`}
  m=raw.match(/(?:球).*?(?:半徑|radius|r)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const r=Number(m[1]);return `球表面積 = ${fmt(4*Math.PI*r*r)}\n球體積 = ${fmt(4*Math.PI*r*r*r/3)}`}
  m=raw.match(/(?:圓柱).*?(?:半徑|radius|r)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:高|height|h)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const r=Number(m[1]),h=Number(m[2]);return `圓柱底面積 = ${fmt(Math.PI*r*r)}\n體積 = ${fmt(Math.PI*r*r*h)}`}
  m=raw.match(/(?:圓錐).*?(?:半徑|radius|r)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)\D+(?:高|height|h)\s*[=:：]?\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const r=Number(m[1]),h=Number(m[2]);return `圓錐底面積 = ${fmt(Math.PI*r*r)}\n體積 = ${fmt(Math.PI*r*r*h/3)}`}
  m=raw.match(/(?:兩點距離|距離).*?\(?\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*\)?\D+\(?\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*\)?/i);
  if(m){const d=Math.hypot(Number(m[3])-Number(m[1]),Number(m[4])-Number(m[2]));return `兩點距離 = √((x₂−x₁)²+(y₂−y₁)²) = ${fmt(d)}`}
  m=raw.match(/(?:勾股|畢氏).*?(?:兩股|直角邊)?\s*(-?\d+(?:\.\d+)?)\s*(?:和|、|與|,|，)\s*(-?\d+(?:\.\d+)?)/i);
  if(m){const a=Number(m[1]),b=Number(m[2]);return `若兩股為 ${a}、${b}，斜邊 = √(a²+b²) = ${fmt(Math.sqrt(a*a+b*b))}`}
  return null;
}
function functionAnalysisText(raw){
  const m=raw.match(/(?:f\s*\(\s*x\s*\)|函數)\s*(?:=|＝)\s*([^，。]+?)(?:\s*(?:範圍|在)\s*(-?\d+(?:\.\d+)?)\s*(?:到|至|~|～)\s*(-?\d+(?:\.\d+)?))?$/i);
  if(!m)return null;
  const expr=m[1].trim(), xmin=m[2]===undefined?-10:Number(m[2]), xmax=m[3]===undefined?10:Number(m[3]);
  if(!(xmax>xmin))return '函數分析的 x 範圍必須是最大值大於最小值。';
  let min={x:0,y:Infinity},max={x:0,y:-Infinity},roots=[],prev=null;
  for(let i=0;i<=1200;i++){
    const x=xmin+(xmax-xmin)*i/1200; let y; try{y=evaluateExpression(expr,x)}catch{continue}
    if(!Number.isFinite(y)||Math.abs(y)>1e12){prev=null;continue}
    if(y<min.y)min={x,y}; if(y>max.y)max={x,y};
    if(prev&&prev.y*y<0){const t=prev.x+(x-prev.x)*(-prev.y)/(y-prev.y);roots.push(t)}
    if(Math.abs(y)<1e-7)roots.push(x); prev={x,y};
  }
  const uniq=[...new Set(roots.map(x=>Number(x.toFixed(6))))];
  return `函數分析 f(x)=${expr}\n近似最小值：f(${fmt(min.x)}) ≈ ${fmt(min.y)}\n近似最大值：f(${fmt(max.x)}) ≈ ${fmt(max.y)}\ny 截距：${fmt(evaluateExpression(expr,0))}\nx 截距：約 ${uniq.length?uniq.map(fmt).join('、'):'找不到或沒有'}`;
}
function probabilityText(raw){
  let m=raw.match(/P\s*\(\s*A\s*\)\s*=\s*(0?\.\d+|1(?:\.0+)?)\s*[,， ]+P\s*\(\s*B\s*\)\s*=\s*(0?\.\d+|1(?:\.0+)?)/i);
  if(m){const a=Number(m[1]),b=Number(m[2]);return `P(A) = ${a}\nP(B) = ${b}\n若 A、B 獨立：P(A∩B) = ${fmt(a*b)}\nP(A補集) = ${fmt(1-a)}`}
  m=raw.match(/(?:有利結果|成功結果)\s*(\d+)\s*(?:÷|\/|除以)\s*(?:總結果|所有結果|可能結果)\s*(\d+)/);
  if(m){const p=Number(m[1])/Number(m[2]);return `P = ${m[1]} ÷ ${m[2]} = ${fmt(p)} = ${fmt(p*100)}%`}
  m=raw.match(/(?:骰子|dice).*?(?:擲|丟|出現).*?([1-6])/i);
  if(m)return `公平六面骰擲出 ${m[1]} 的機率 = 1/6 ≈ ${fmt(100/6)}%`;
  return null;
}
function matrixParseText(t){
  const rows=String(t).trim().split(/\s*;\s*/).filter(Boolean).map(r=>r.trim().split(/[ ,]+/).map(Number));
  if(!rows.length||rows.some(r=>!r.length||r.some(x=>!Number.isFinite(x))||r.length!==rows[0].length))throw Error('矩陣每列欄數必須相同');
  return rows;
}
function matrixFromAI(raw){
  const ms=[...raw.matchAll(/\[\s*([^\]]+)\]/g)].map(x=>x[1]);
  if(ms.length<1)return null;
  try{
    const A=matrixParseText(ms[0]);
    if(/det|行列式/i.test(raw))return `det(A) = ${fmt(det(A))}`;
    if(/反矩陣|逆矩陣|inverse|inv/i.test(raw))return `A⁻¹ =\n${matText(inv(A)).replace(/<[^>]+>/g,' ')}`;
    if(ms.length>=2){const B=matrixParseText(ms[1]);if(/乘|×|multiply/i.test(raw)){if(A[0].length!==B.length)throw Error('A 的欄數必須等於 B 的列數');const C=A.map(r=>B[0].map((_,j)=>r.reduce((z,x,k)=>z+x*B[k][j],0)));return `A×B =\n${C.map(r=>'[ '+r.map(fmt).join(', ')+' ]').join('\n')}`}if(A.length!==B.length||A[0].length!==B[0].length)throw Error('矩陣尺寸必須相同');const C=A.map((r,i)=>r.map((x,j)=>x+B[i][j]));return `A+B =\n${C.map(r=>'[ '+r.map(fmt).join(', ')+' ]').join('\n')}`}
  }catch(e){return '矩陣格式有問題：'+e.message}
  return null;
}
function sequenceText(raw){
  const m=raw.match(/(?:數列|序列)?\s*[:：]?\s*(-?\d+(?:\.\d+)?(?:\s*[,，、]\s*-?\d+(?:\.\d+)?){2,})/);
  if(!m)return null;
  const a=parseNumberList(m[1]);
  if(a.length<3)return null;
  const d=a[1]-a[0];
  if(a.every((x,i)=>i===0||Math.abs(x-a[i-1]-d)<1e-10)) return `這是等差數列，公差 d = ${fmt(d)}\n下一項 = ${fmt(a[a.length-1]+d)}`;
  if(a.every((x,i)=>i===0||a[i-1]!==0&&Math.abs(x/a[i-1]-(a[1]/a[0]))<1e-10)) {const r=a[1]/a[0];return `這是等比數列，公比 r = ${fmt(r)}\n下一項 = ${fmt(a[a.length-1]*r)}`}
  return '我看不出這組數字是標準等差或等比數列。';
}
function unitText(raw){
  const m=raw.match(/(-?\d+(?:\.\d+)?)\s*(mm|cm|m|km|ft|in|毫米|公分|公尺|公里|英尺|英吋|g|kg|mg|lb|克|公斤|毫克|磅|l|L|ml|mL|升|毫升|s|min|h|day|秒|分鐘|小時|天|°c|℃|°f|°k|攝氏|華氏|開爾文)\s*(?:轉換|換成|等於|to|->)\s*(mm|cm|m|km|ft|in|毫米|公分|公尺|公里|英尺|英吋|g|kg|mg|lb|克|公斤|毫克|磅|l|L|ml|mL|升|毫升|s|min|h|day|秒|分鐘|小時|天|°c|℃|°f|°k|攝氏|華氏|開爾文)/i);
  if(!m)return null;
  const value=Number(m[1]), norm=u=>u.toLowerCase().replace('毫米','mm').replace('公分','cm').replace('公尺','m').replace('公里','km').replace('英尺','ft').replace('英吋','in').replace('克','g').replace('公斤','kg').replace('毫克','mg').replace('磅','lb').replace('升','l').replace('毫升','ml').replace('秒','s').replace('分鐘','min').replace('小時','h').replace('天','day').replace('℃','°c').replace('攝氏','°c').replace('華氏','°f').replace('開爾文','°k');
  const from=norm(m[2]),to=norm(m[3]);
  const groups={length:{mm:.001,cm:.01,m:1,km:1000,ft:.3048,in:.0254},mass:{mg:1e-6,g:.001,kg:1,lb:.45359237},volume:{ml:1e-6,l:.001},time:{s:1,min:60,h:3600,day:86400}};
  for(const g of Object.values(groups))if(from in g&&to in g)return `${value}${m[2]} = ${fmt(value*g[from]/g[to])}${m[3]}`;
  if(from==='°c'||from==='°f'||from==='°k'){
    let c=from==='°c'?value:from==='°f'?(value-32)*5/9:value-273.15;
    const z=to==='°c'?c:to==='°f'?c*9/5+32:c+273.15;
    return `${value}${m[2]} = ${fmt(z)}${m[3]}`;
  }
  return '目前無法在不同物理量類別之間直接換算。';
}
function matrixText(raw){ return matrixFromAI(raw); }
function chemistryText(raw){
  const text=String(raw).trim();
  const arrow=text.match(/(?:->|→|=>|=)/);
  if(!arrow)return null;
  const parts=text.split(arrow[0]);
  if(parts.length!==2)return null;
  const lhs=parts[0].trim(), rhs=parts[1].trim();
  if(!lhs || !rhs || !/[A-Z][a-z]*/.test(lhs) || !/[A-Z][a-z]*/.test(rhs))return null;
  try{
    const r=balanceEquation(lhs+'->'+rhs);
    const left=r.L.map((x,i)=>(r.co[i]===1?'':r.co[i])+x).join(' + ');
    const right=r.R.map((x,i)=>(r.co[r.L.length+i]===1?'':r.co[r.L.length+i])+x).join(' + ');
    return '配平結果：\n'+left+' → '+right+'\n最簡整數比：'+r.co.join(' : ')+'\n檢查元素：'+r.els.join('、');
  }catch(e){return '這個化學方程式目前無法配平：'+e.message}
}
function localAIAnswer(q){
  const raw=String(q).trim(), s=raw.toLowerCase().replace(/\s+/g,' ');
  if(!raw)return '請輸入問題，我會使用 MathBox 的工具能力幫你處理。';
  if(/^(你好|嗨|哈囉|hello|hi)[！!。.]?$/.test(s))return '你好！我是 MathBox AI。我可以使用本站的計算、方程式、統計、矩陣、排列組合、機率、幾何、數列、單位與化學配平能力。';
  if(/你能做什麼|可以做什麼|有哪些功能|所有功能/.test(raw))return '我可以處理：\n🧮 科學計算：算式、三角函數、平方根、百分比\n🔢 方程式：一次、二次方程式\n📈 函數：說明函數與基本圖形概念\n📊 統計：平均數、中位數、眾數、全距、變異數、標準差\n🔲 矩陣：基本矩陣運算\n🎯 排列組合：nPr、nCr、階乘\n🎲 機率：基本機率概念與計算\n📐 幾何：三角形、圓、長方形、勾股\n🔢 數列：等差、等比\n📏 單位：常見長度與重量換算\n🧪 化學：化學方程式配平';
  if(/質數|素數/.test(raw))return '質數是大於 1，而且只有 1 和自己兩個正因數的整數。例如 2、3、5、7、11。';
  if(/偶數/.test(raw))return '偶數是可以被 2 整除的整數，例如 −4、0、2、8。';
  if(/奇數/.test(raw))return '奇數是不能被 2 整除的整數，例如 −3、1、5、9。';
  if(/二次方程式/.test(raw)&&!/[=＝].*x/.test(raw))return '二次方程式可寫成 ax² + bx + c = 0（a ≠ 0），判別式 Δ=b²−4ac。本站的二次方程式工具可以直接輸入 a、b、c 求根。';
  if(/一次方程式/.test(raw)&&!/[=＝].*x/.test(raw))return '一次方程式的未知數最高次為 1，例如 2x+5=13。';
  const q2=solveQuadraticText(raw); if(q2)return q2;
  const q1=solveLinearText(raw); if(q1)return q1;
  const chem=chemistryText(raw); if(chem)return chem;
  const mat=matrixText(raw); if(mat)return mat;
  const fa=functionAnalysisText(raw); if(fa)return fa;
  const geo=geometryText(raw); if(geo)return geo;
  const prob=probabilityText(raw); if(prob)return prob;
  const unit=unitText(raw); if(unit)return unit;
  const seq=sequenceText(raw); if(seq)return seq;
  let m=raw.match(/(?:排列|排列數|npr|p)\s*[（(]?\s*(\d+)\s*[,，]\s*(\d+)\s*[）)]?/i)||raw.match(/(\d+)\s*[pP]\s*(\d+)/);
  if(m)return `排列 ${m[1]}P${m[2]} = ${fmt(nPr(Number(m[1]),Number(m[2])))}`;
  m=raw.match(/(?:組合|組合數|ncr|c)\s*[（(]?\s*(\d+)\s*[,，]\s*(\d+)\s*[）)]?/i)||raw.match(/(\d+)\s*[cC]\s*(\d+)/);
  if(m)return `組合 ${m[1]}C${m[2]} = ${fmt(nCr(Number(m[1]),Number(m[2])))}`;
  m=raw.match(/(?:階乘|factorial)\s*(\d+)/i)||raw.match(/(\d+)\s*!/);
  if(m)return `${m[1]}! = ${fmt(factorialBig(Number(m[1])))}`;
  if(/統計|平均數|平均值|中位數|眾數|標準差|變異數/.test(raw)){
    const lm=raw.match(/(?:統計|資料|數據|data)?\s*[:：]?\s*((?:-?\d+(?:\.\d+)?\s*[,，、\s]\s*)+-?\d+(?:\.\d+)?)/i);
    if(lm){try{return statAnswer(parseNumberList(lm[1]))}catch(e){}}
    return '統計可以輸入例如「統計 10, 20, 20, 30, 40」。我會算平均數、中位數、眾數、全距、變異數與標準差。';
  }
  if(/機率/.test(raw)){
    const pm=raw.match(/(\d+)\s*(?:種|個|面)?\s*(?:結果|事件).*?(\d+)\s*(?:種|個|個結果|個有利)/);
    if(pm){const p=Number(pm[2])/Number(pm[1]);return `基本機率 = 有利結果數 ÷ 所有可能結果數 = ${pm[2]} ÷ ${pm[1]} = ${fmt(p)} = ${fmt(p*100)}%`}
    return '基本機率公式：P(A)=有利結果數÷所有可能結果數。例如公平骰子擲出 6 的機率是 1/6。';
  }
  if(/三角形.*面積|面積.*三角形/.test(raw))return '三角形面積 = 底 × 高 ÷ 2。你也可以直接問我「三角形底 10 高 6 的面積」。';
  if(/圓.*面積|面積.*圓/.test(raw))return '圓面積 = πr²；圓周長 = 2πr。';
  if(/勾股|畢氏/.test(raw))return '直角三角形符合 a²+b²=c²，其中 c 是斜邊。';
  if(/等差|等比|數列/.test(raw)&&!/[0-9]/.test(raw))return '你可以輸入「數列 2, 5, 8, 11」或「數列 3, 6, 12, 24」，我會判斷等差/等比並求下一項。';
  if(/函數繪圖|畫圖|函數圖形/.test(raw))return '函數繪圖工具支援輸入例如 x^2-4、sin(x)、sqrt(x)。AI 可以幫你整理函數，但實際圖形請到「函數繪圖」頁面查看。';
  if(/化學|配平/.test(raw))return '化學工具支援用週期表組成分子，也可以輸入例如「H2 + O2 -> H2O」讓我直接配平。';
  // 最後才嘗試數學算式，這讓「6+7」、「例如 6+7」、「計算 6+7」都能工作。
  let expr=raw.replace(/^(?:例如|ex|example|計算|算|算一下|幫我算|幫我計算|答案|calculate|calc)\s*/i,'').replace(/^[:：]\s*/,'').replace(/=/g,'');
  if(/^[0-9πeE+\-*/().,%^×÷√\s]+$/i.test(expr) || /^(?:sqrt|sin|cos|tan|abs|ln|log|exp|floor|ceil|round)\s*\(/i.test(expr)){
    expr=expr.replace(/√\s*/g,'sqrt');
    try{return `答案是：${fmt(evaluateExpression(expr))}`;}catch(e){return '我有看到這是一個數學算式，但格式似乎有問題：'+e.message}
  }
  return '我目前是「不用 API Key 的本機 MathBox AI」，不是連線型 ChatGPT；但我可以直接使用本站各工具的計算能力。請把題目寫成算式、方程式、統計資料、幾何條件、排列組合、數列或化學方程式，我會直接幫你算。';
}
function initLocalAI(){
  if(!$('aiInput')||!$('aiSend')||!$('aiMessages')) return;
  if(window.__mathboxAIInitialized) return;
  window.__mathboxAIInitialized=true;
  const input=$('aiInput'), sendBtn=$('aiSend'), messages=$('aiMessages');
  const add=(text,who)=>{
    const d=document.createElement('div');
    d.className='ai-message '+who;
    d.innerHTML=esc(text).replace(/\n/g,'<br>');
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
  };
  let sending=false;
  const send=()=>{
    if(sending)return;
    const q=input.value.trim();
    if(!q)return;
    sending=true;
    sendBtn.disabled=true;
    input.disabled=true;
    add(q,'user');
    input.value='';
    const answer=localAIAnswer(q);
    add(answer,'bot');
    input.disabled=false;
    sendBtn.disabled=false;
    sending=false;
    input.focus();
  };
  sendBtn.onclick=send;
  input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send()}};
  document.querySelectorAll('[data-ai-q]').forEach(b=>b.onclick=()=>{
    if(sending)return;
    input.value=b.dataset.aiQ||'';
    send();
  });
}

initSidebar();
initLocalAI();

})();
