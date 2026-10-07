import * as THREE from './three.module.min.js';

const DOC = {
  superpod:'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/abstract.html',
  parts:'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-components.html',
  fabric:'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html',
  rack:'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html',
  network:'https://docs.nvidia.com/dgx/dgxgb200-user-guide/networking.html',
  cabling:'https://docs.nvidia.com/dgx-superpod/design-guide-cabling-data-centers/latest/ndr-components.html'
};
const PAGES={
  overview:{name:'SuperPOD 全局',eyebrow:'01 / 设备位置示意',title:'8 台计算柜，加独立网络区',lead:'前排是完整的 8 台 NVL72 计算柜，共 576 张 GPU。后排蓝色为 InfiniBand 计算网，橙色为 Ethernet 存储／带内管理网。点任一设备继续放大。',vendor:'NVIDIA DGX GB200 SuperPOD · 一个可扩展单元',fact:'网络区的机柜是设备分区示意，不代表官方规定只能用这几台物理机柜。蓝线从计算托盘的 ConnectX-7 出来；橙线从 BlueField-3 出来；柜内 NVSwitch 不接这两条线。',source:DOC.fabric,next:'topology'},
  topology:{name:'逻辑网络',eyebrow:'01 / 数据从哪里走',title:'同一计算柜，三条不同的数据路',lead:'柜内 GPU 互访走绿色 NVLink；跨柜 GPU 计算走蓝色 ConnectX-7 → InfiniBand；访问共享存储与集群服务走橙色 BlueField-3 → Ethernet。紫色 BMC 是另一路低速带外管理。',vendor:'DGX GB200 SuperPOD 参考拓扑',fact:'Leaf 和 Spine 是网络层级，不等于一台机柜。InfiniBand 的 QM9700 在计算柜外的网络区；NVSwitch 在每台计算柜内。',source:DOC.fabric,next:'ibRail'},
  rack:{name:'NVL72 计算机柜',eyebrow:'02 / 进入机柜',title:'72 张 GPU 的一台“计算机”',lead:'点击机柜里的计算托盘或绿色 NVLink 交换托盘，继续看内部。真实机柜有 18 个计算托盘和 9 个交换托盘。',vendor:'NVIDIA DGX GB200 NVL72',fact:'另外还有 2 台管理 ToR、供电架、母排与液冷歧管。此模型按功能分区，非实物 U 位排布。',source:DOC.rack,next:'tray'},
  tray:{name:'计算托盘',eyebrow:'03 / 打开机箱',title:'每层托盘同时接三套互联',lead:'点 GPU、Grace、ConnectX-7、BlueField-3、SSD 或紫色 PCIe 器件。蓝色网卡去跨柜计算网，橙色 DPU 去存储／带内网；GPU 之间另走柜内 NVLink。',vendor:'NVIDIA 整机设计与核心芯片',fact:'每托盘 2 Grace CPU、4 Blackwell GPU、4 ConnectX-7、2 BlueField-3、4 块 E1.S 缓存盘和 1 块 M.2 启动盘。托盘内部器件位置为教学示意。',source:DOC.parts,next:'nic'},
  switch:{name:'NVLink 交换托盘',eyebrow:'03 / 柜内高速交换',title:'NVSwitch 连接 72 张 GPU',lead:'每层交换托盘有 2 颗 NVSwitch ASIC。9 层合计 18 颗芯片，经机柜背部被动铜缆连接 GPU。',vendor:'NVIDIA NVSwitch',fact:'这段柜内互联走铜背板；下面拆开的 OSFP 光模块属于柜外 InfiniBand／Ethernet 交换机，不在这个托盘里。',source:DOC.rack,next:'ibRail'},
  gpu:{name:'Blackwell GPU',eyebrow:'04 / 计算核心',title:'GPU 与周围的 HBM',lead:'中间是 GPU，周围是 HBM 显存堆叠。正在计算的权重、激活值和 KV cache 主要在这里等待运算。',vendor:'GPU：NVIDIA · HBM 器件厂商未指定',fact:'本演示不把 GPU 上方的 HBM 品牌猜成某家供应商；参考架构未指定具体批次。',source:DOC.parts,next:'switch'},
  cpu:{name:'Grace CPU',eyebrow:'04 / 主机处理器',title:'Grace 做控制与数据准备',lead:'Grace 运行主机软件，并通过 NVLink-C2C 与 Blackwell GPU 组成 GB200 Superchip。',vendor:'NVIDIA Grace',fact:'一层计算托盘有两颗 Grace CPU；CPU–GPU 的 C2C 与 GPU–GPU 的 NVSwitch 网络不同。',source:DOC.parts,next:'gpu'},
  nic:{name:'ConnectX-7 网卡',eyebrow:'04 / 跨柜出口',title:'网卡把计算托盘接入 IB',lead:'4 张 ConnectX-7 分别提供 400G InfiniBand 端口。主机侧通过本地 PCIe 体系接入；网络侧经光模块和光纤走向计算网 Leaf。',vendor:'NVIDIA ConnectX-7',fact:'PCIe 是托盘内的外设连接；InfiniBand 是出去后的计算网络。网卡位于两者的边界，不能把它当 NVSwitch。',source:DOC.rack,next:'ibRail'},
  pcie:{name:'PCIe 交换与本地外设',eyebrow:'04 / 托盘内连接',title:'PCIe 没消失：它连接网卡和本地外设',lead:'Grace 所在主机通过 PCIe 体系接入网卡、DPU 和 NVMe 等外设，部分链路经过 PCIe Switch。紫色表示本地 I/O，不是柜内 GPU 互访的 NVLink，也不是跨柜的 InfiniBand。',vendor:'PCIe Switch 供应商未在参考架构中指明',fact:'官方 GB200 托盘方框图画出了 PCIe 和 PCIe switches。此 3D 展示只表示功能层级，不复刻每颗器件的精确走线。',source:DOC.rack,next:'nic'},
  dpu:{name:'BlueField-3 DPU',eyebrow:'04 / Ethernet 出口',title:'两张 DPU，四个 200GbE 端口',lead:'每托盘的两张 BlueField-3 各有两个高速 Ethernet 端口：左侧端口进存储网，右侧端口进带内网络。它们与 ConnectX-7 的 InfiniBand 端口分开。',vendor:'NVIDIA BlueField-3',fact:'四个高速端口中，两路用于存储访问，两路用于带内服务。存储网络可使用 RoCE；另有 RJ45 BMC 管理口走低速带外网络。',source:DOC.network,next:'eth'},
  ssd:{name:'NVMe SSD',eyebrow:'04 / 本地存储',title:'缓存和启动盘在托盘里',lead:'每托盘 4 块 E1.S NVMe 数据缓存盘与 1 块 M.2 启动盘；大规模共享存储仍在外部。',vendor:'具体 SSD 制造商未披露',fact:'本地 SSD、GPU 的 HBM、外部共享存储是三个不同层级。',source:DOC.rack,next:'eth'},
  ibRail:{name:'一条 IB Rail',eyebrow:'02 / 放大一条 Rail',title:'8 台计算柜 → 8 Leaf → 6 Spine',lead:'本 Rail 中，每台 NVL72 柜的 18 个计算托盘各有一条 400G 链路，汇入本柜对应的 QM9700 Leaf。跨柜数据从源 Leaf 上行到 Spine，再下行到目标 Leaf。',vendor:'NVIDIA Quantum QM9700 · NDR400',fact:'这是 4 条并行 Rail 中的一条；整组共有 32 台 Leaf、24 台 Spine。画面只高亮 Rack 1 → Rack 8 的一条示例路径；实际每台 Leaf 连向多个 Spine。',source:DOC.fabric,next:'ibChip'},
  ibChip:{name:'Quantum 交换机内部',eyebrow:'03 / 打开交换机',title:'光模块与交换 ASIC 分工',lead:'前面板的 OSFP 笼子插入光模块。模块把光纤里的信号变为高速电信号，经板上走线送到 Quantum-2 ASIC；ASIC 决定数据发往哪个端口。点击伸出的模块继续拆开。',vendor:'交换机与 ASIC：NVIDIA Quantum-2',fact:'QM9700 是 64 端口 NDR 交换机，配 32 个双端口 OSFP 笼子。DSP、Driver、探测器和 TIA 若存在于这条链路，属于插入的光模块，不是交换 ASIC 的四个部件。',source:'https://networking-docs.nvidia.com/qm97x0hw',next:'optics'},
  eth:{name:'Ethernet 存储／带内网',eyebrow:'02 / 与 IB 平行的网络',title:'BlueField-3 → SN5600 → 存储与服务',lead:'每个计算托盘有 2 张 BlueField-3、共 4 个 200GbE 端口。两路接共享存储网络，两路接集群服务所在的带内网络；接入 SN5600 Leaf，再汇聚到一对 SN5600 Spine。',vendor:'NVIDIA Spectrum-4 SN5600',fact:'图中交换机是各层代表设备，不冒充整组 Ethernet 的精确 Leaf 数量。紫色 BMC → 柜内管理 ToR → SN2201 属于单独的低速带外管理链路。',source:DOC.fabric,next:'ethChip'},
  ethChip:{name:'Spectrum 交换机内部',eyebrow:'03 / 打开交换机',title:'Spectrum-4 负责以太网分组交换',lead:'前面板的 OSFP 光模块收发光信号；板上高速电走线把模块接到 Spectrum-4 ASIC，由它按以太网分组转发。点击伸出的模块看发射与接收电路。',vendor:'交换机与 ASIC：NVIDIA Spectrum-4',fact:'SN5600 机箱、交换 ASIC 和 OSFP 模块是三个层级。这里的板上摆位是功能示意，不是 SN5600 实物拆机。',source:'https://networking-docs.nvidia.com/sn5000hw/introduction',next:'optics'},
  optics:{name:'OSFP 光模块内部',eyebrow:'04 / 光电转换',title:'发射、接收是两条不同的链',lead:'发射 Tx：交换 ASIC 电信号 → 模块内信号处理 → Driver → 激光器／调制器 → 光纤。接收 Rx：光纤 → 光探测器 PD → TIA → 模块内信号处理 → 交换 ASIC。',vendor:'功能示意；具体光模块 OEM 与器件组合未指定',fact:'本页紫色块示意传统光模块里的 DSP／CDR。GB200 柜内 NVLink 走铜背板，没有光模块 DSP；跨柜光纤链路使用 OSFP 光模块。NVIDIA 的 GB200 参考架构没有披露每个模块内部的 DSP 料号，因此不能断言每个端口都相同。PD 负责接收，TIA 放大其电流；LPO 或铜缆是另一种实现。',source:'https://investor.marvell.com/image/marvell-accelerated-infrastructure-for-the-ai-era-event.pdf',sourceLabel:'光模块结构资料',next:'overview'},
  facility:{name:'机柜基础设施',eyebrow:'03 / 电力与热',title:'供电、液冷、管理 ToR',lead:'电源架和母排给托盘供电；冷板和液冷歧管为 CPU/GPU 带走热量；两台管理 ToR 连接托盘和交换托盘的 BMC。',vendor:'NVIDIA 系统设计；细分供应商未完整披露',fact:'机柜管理 ToR 属于带外管理链路，不是计算 InfiniBand Leaf，也不承担 GPU 的 NVLink 数据交换。',source:DOC.rack,next:'rack'}
};
const PARENTS={rack:'overview',tray:'rack',switch:'rack',gpu:'tray',cpu:'tray',nic:'tray',pcie:'tray',dpu:'tray',ssd:'tray',ibRail:'overview',ibChip:'ibRail',eth:'overview',ethChip:'eth',optics:'ibChip',facility:'rack'};
const canvas=document.getElementById('scene'), brief=document.getElementById('brief'), trail=document.getElementById('trail'), drillNav=document.getElementById('drillNav'), shade=document.getElementById('shade'), hoverLabel=document.getElementById('hoverLabel');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){document.getElementById('app').insertAdjacentHTML('beforeend','<div class="error">当前浏览器无法启动 WebGL 3D 画面。请用支持 WebGL 的浏览器打开。</div>');throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.34;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071019);scene.fog=new THREE.FogExp2(0x071019,.019);
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,180);
scene.add(new THREE.HemisphereLight(0xa4cbdf,0x131a20,2.1));
const key=new THREE.DirectionalLight(0xd9edff,3.2);key.position.set(-9,15,11);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-22;key.shadow.camera.right=22;key.shadow.camera.top=20;key.shadow.camera.bottom=-20;scene.add(key);
const rim=new THREE.DirectionalLight(0x71b8c4,1.7);rim.position.set(9,7,-10);scene.add(rim);
const point=new THREE.PointLight(0x76b900,30,15);point.position.set(-5,6,3);scene.add(point);
const MAT={metal:new THREE.MeshStandardMaterial({color:0x28333d,metalness:.86,roughness:.3}),dark:new THREE.MeshStandardMaterial({color:0x101a23,metalness:.68,roughness:.4}),black:new THREE.MeshStandardMaterial({color:0x0a1118,metalness:.55,roughness:.5}),silver:new THREE.MeshStandardMaterial({color:0x71828c,metalness:.82,roughness:.27}),board:new THREE.MeshStandardMaterial({color:0x123d30,metalness:.18,roughness:.63}),green:new THREE.MeshStandardMaterial({color:0x76b900,metalness:.28,roughness:.42,emissive:0x263d06,emissiveIntensity:.4}),blue:new THREE.MeshStandardMaterial({color:0x3f9cdb,metalness:.28,roughness:.36,emissive:0x0c3260,emissiveIntensity:.5}),amber:new THREE.MeshStandardMaterial({color:0xdc8f4a,metalness:.4,roughness:.36,emissive:0x572b0a,emissiveIntensity:.4}),purple:new THREE.MeshStandardMaterial({color:0x9d75c8,metalness:.36,roughness:.36,emissive:0x37205b,emissiveIntensity:.45}),glass:new THREE.MeshPhysicalMaterial({color:0x87a5b3,metalness:.1,roughness:.12,transmission:.75,transparent:true,opacity:.27,depthWrite:false}),copper:new THREE.MeshStandardMaterial({color:0xa56d46,metalness:.83,roughness:.31}),chip:new THREE.MeshStandardMaterial({color:0x253638,metalness:.55,roughness:.31})};
const geobox=new THREE.BoxGeometry(1,1,1);let content=new THREE.Group();scene.add(content);const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let current='overview',lastPhysical='overview', hovered=null, dragging=false, moved=false, down={x:0,y:0}, theta=.38,phi=1.12,radius=19,focus=new THREE.Vector3(0,2,0),autoTime=0,transitioning=false;
function box(parent,w,h,d,x,y,z,mat=MAT.metal,select){const m=new THREE.Mesh(geobox,mat);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;if(select)m.userData.select=select;parent.add(m);return m;}
function line(parent,pts,color,width=.025){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,pts.length*8),width,5,false),new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.38,emissive:color,emissiveIntensity:.1}));parent.add(mesh);return mesh;}
function sphere(parent,r,x,y,z,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat);m.position.set(x,y,z);parent.add(m);return m;}
function label(parent,text,x,y,z,scale=1,color='#daf2e0'){
  const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='rgba(7,17,25,.82)';ctx.beginPath();ctx.roundRect(3,6,762,114,14);ctx.fill();ctx.strokeStyle='rgba(125,181,142,.5)';ctx.lineWidth=3;ctx.stroke();ctx.font='600 42px Noto Sans SC, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,384,64,724);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.position.set(x,y,z);sprite.scale.set(3.35*scale,.56*scale,1);parent.add(sprite);return sprite;
}
function platform(parent,w=16,d=12){box(parent,w,.3,d,0,-.19,0,MAT.black);const grid=new THREE.GridHelper(Math.max(w,d)*1.6,32,0x254351,0x1b2e37);grid.position.y=-.025;parent.add(grid);for(let i=-1;i<=1;i+=2){box(parent,w,.025,.035,0,.0,i*d/2*.88,MAT.blue)}}
function port(parent,x,y,z,color=0x70bbff,target='optics'){const outer=box(parent,.18,.12,.045,x,y,z,MAT.black,target);box(parent,.105,.045,.052,x,y,z+.028,new THREE.MeshBasicMaterial({color}),target);return outer}
function rack(parent,x=0,z=0,s=1,id='01',detailed=false,select='rack'){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);g.userData.select=select;
  const W=2.25,H=5.7,D=1.65;box(g,W,.14,D,0,.12,0,MAT.metal);box(g,W,.14,D,0,H,0,MAT.metal);
  for(const xx of [-W/2+.07,W/2-.07])for(const zz of [-D/2+.06,D/2-.06])box(g,.14,H,D*.02,xx,H/2+.1,zz,MAT.silver);
  box(g,.075,H,D,-W/2,H/2+.1,0,MAT.dark);box(g,.075,H,D,W/2,H/2+.1,0,MAT.dark);box(g,W,.04,D,0,H/2,.0,MAT.dark);
  const front=D/2+.035;const rows=detailed?29:22;const rowH=(H-.47)/rows;
  for(let i=0;i<rows;i++){
    const y=.32+i*rowH;const sw=detailed?i>=18&&i<27:i>=14&&i<20;const mg=detailed?i>=27:i>=20;
    const target=mg?'facility':sw?'switch':'tray';
    const mm=mg?MAT.copper:sw?MAT.metal:MAT.dark;
    box(g,W-.32,rowH*.78,D*.84,0,y,-.01,mm,detailed?target:select);
    box(g,W-.30,rowH*.55,.045,0,y,front,sw?MAT.chip:MAT.metal,detailed?target:select);
    for(let j=0;j<8;j++)box(g,.12,.025,.055,-.78+j*.22,y,front+.038,sw?MAT.green:MAT.black,detailed?target:select);
    if(i%3===0)sphere(g,.028,.93,y,front+.035,sw?MAT.green:mg?MAT.amber:MAT.blue);
  }
  box(g,W-.25,.11,.11,0,H-.07,front+.02,MAT.silver,detailed?'facility':select);
  // Cabinet door is intentionally translucent so its contents remain visible.
  const door=box(g,W-.17,H-.24,.035,detailed?W+.18:0,H/2+.1,detailed?front-.25:front+.18,MAT.glass);door.castShadow=false;door.raycast=()=>{};
  if(detailed)door.rotation.y=-.48;
  label(g,detailed?'DGX GB200 NVL72':`NVL72 · ${id}`,0,H+.48,0,detailed?.95:.72);
  return g;
}
function networkCabinet(parent,x,z,mat,target,title,count){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.select=target;parent.add(g);
  const w=3.15,h=5.15,d=1.75;
  box(g,w,.16,d,0,.1,0,MAT.metal,target);box(g,w,.16,d,0,h,0,MAT.metal,target);
  for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(g,.12,h,.12,xx,h/2,zz,MAT.silver,target);
  box(g,w-.22,h-.2,.055,0,h/2,-d/2,MAT.dark,target);
  for(let i=0;i<count;i++){
    const y=.48+i*(h-.9)/count;
    box(g,w-.3,(h-.9)/count*.74,d*.79,0,y,.02,MAT.dark,target);
    box(g,w-.27,(h-.9)/count*.53,.05,0,y,d/2+.03,mat,target);
    for(let j=0;j<8;j++)port(g,-1.13+j*.32,y,d/2+.065,mat===MAT.amber?0xf3ad6a:0x66bafa,target);
  }
  label(g,title,0,h+.57,0,.79,mat===MAT.amber?'#ffd0a4':'#a9dfff');
  return g;
}
function makeOverview(){
  platform(content,30,18);
  for(let i=0;i<8;i++){
    const x=(i-3.5)*2.78;
    rack(content,x,3.9,.77,String(i+1).padStart(2,'0'),false,'rack');
    // One blue and one amber uplink bundle per compute rack. They leave from NICs on the compute trays, not NVSwitch.
    line(content,[[x,4.1,3.03],[x,5.1,1.85],[x,5.1,-.55],[-8.3,5.65,-3.95]],0x448fcc,.017);
    line(content,[[x,3.83,3.05],[x,4.55,1.95],[x,4.55,.65],[8.3,5.0,-3.95]],0xd58b4c,.015);
  }
  networkCabinet(content,-8.3,-5.45,MAT.blue,'ibRail','IB LEAF · 32 台 QM9700',8);
  networkCabinet(content,-1.5,-5.45,MAT.blue,'ibRail','IB SPINE · 24 台 QM9700',6);
  networkCabinet(content,8.3,-5.45,MAT.amber,'eth','ETH · SN5600 交换组',7);
  for(let i=0;i<5;i++)line(content,[[-7.7+i*.2,5.35,-5.42],[-5.1+i*.12,5.7,-5.75],[-2.6+i*.18,5.3,-5.42]],0x5caff2,.022);
  label(content,'8 台 NVL72 计算柜 · 72 GPU / 柜',0,6.1,3.95,1.12);
  label(content,'蓝色：CX-7 → IB   橙色：BF3 → Ethernet',0,.52,-8.1,.88);
  label(content,'网络柜为分区示意；请点进去看设备数量',0,.48,7.35,.73);
}
function logicalNode(parent,x,z,title,mat,target){const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);g.userData.select=target;box(g,2.55,.17,1.18,0,.15,0,MAT.metal,target);box(g,2.15,.28,.85,0,.36,0,MAT.dark,target);box(g,.86,.12,.59,0,.57,0,mat,target);for(let i=0;i<6;i++)port(g,-.81+i*.32,.38,.62,mat===MAT.green?0x9add53:mat===MAT.blue?0x65bbff:mat===MAT.amber?0xf3b16e:0xc798ee,target);label(g,title,0,1.03,0,.72);return g}
function makeTopology(){
  platform(content,22,19);
  const rows=[
    {z:-6.1,color:0x8ccb45,mat:MAT.green,title:'① 柜内：NVLink',nodes:[['GPU','gpu'],['NVSwitch ×18','switch'],['同柜 GPU','gpu']]},
    {z:-3.05,color:0x5caff2,mat:MAT.blue,title:'② 跨柜计算：InfiniBand',nodes:[['R1 CX-7','nic'],['R1 Leaf','ibRail'],['Spine','ibRail'],['R8 Leaf','ibRail'],['R8 CX-7','nic']]},
    {z:0,color:0xe7a365,mat:MAT.amber,title:'③ 共享存储：Ethernet',nodes:[['BF3 存储端口','dpu'],['SN5600 Leaf','eth'],['SN5600 汇聚','eth'],['共享存储','eth']]},
    {z:3.05,color:0xdfaa6f,mat:MAT.amber,title:'④ 带内服务：Ethernet',nodes:[['BF3 带内端口','dpu'],['SN5600 Leaf','eth'],['SN5600 汇聚','eth'],['集群服务','eth']]},
    {z:6.1,color:0xc798ee,mat:MAT.purple,title:'⑤ 带外维护：Ethernet',nodes:[['BMC 管理口','facility'],['柜内管理 ToR','facility'],['SN2201 管理网','facility']]}
  ];
  for(const row of rows){
    box(content,20.5,.025,2.78,0,.025,row.z,new THREE.MeshBasicMaterial({color:row.color,transparent:true,opacity:.07,depthWrite:false}));
    label(content,row.title,0,1.54,row.z,.83);
    const xs=row.nodes.length===5?[-8.25,-4.12,0,4.12,8.25]:row.nodes.length===4?[-7.3,-2.43,2.43,7.3]:[-6.6,0,6.6];
    row.nodes.forEach(([name,target],i)=>logicalNode(content,xs[i],row.z,name,row.mat,target));
    for(let i=0;i<xs.length-1;i++){
      line(content,[[xs[i]+1.32,.51,row.z],[xs[i]+(xs[i+1]-xs[i])/2,.73,row.z],[xs[i+1]-1.32,.51,row.z]],row.color,.034);
    }
  }
  label(content,'每一行是一条用途不同的路；点击设备放大',0,2.15,-8.65,.8);
}
function makeRack(){platform(content,9,7);const g=rack(content,0,0,1.1,'01',true);label(content,'计算托盘 ×18',-3.4,2.1,.9,.75,'#d7e8ea');label(content,'NVLink 交换托盘 ×9',3.5,4.7,.9,.75,'#baf08c');label(content,'供电 / 管理 ToR',3.4,5.9,.9,.7,'#ffd0a2');for(let i=0;i<8;i++)line(content,[[1.13,1+i*.37,-.7],[1.6,1.5+i*.35,-1.15],[1.1,3.3+i*.2,-.7]],0x86a85c,.022);return g}
function chassis(parent,w,d,h=.45){box(parent,w,.12,d,0,.13,0,MAT.metal);box(parent,w,.48,.1,0,.36,d/2,MAT.silver);box(parent,w,.48,.1,0,.36,-d/2,MAT.dark);box(parent,.1,.48,d,-w/2,.36,0,MAT.metal);box(parent,.1,.48,d,w/2,.36,0,MAT.metal);box(parent,w-.2,.035,d-.2,0,.26,0,MAT.board);box(parent,w*.82,.07,.12,0,.69,-d/2-.22,MAT.silver);}
function chip(parent,x,z,w,d,mat,target,top=true){const g=new THREE.Group();g.position.set(x,.44,z);parent.add(g);g.userData.select=target;box(g,w,.13,d,0,.0,0,MAT.black,target);box(g,w*.84,.16,d*.84,0,.11,0,mat,target);if(top){for(let i=-1;i<=1;i+=2){box(g,w*.26,.09,d*.27,i*w*.29,.24,-d*.3,MAT.silver,target)}}return g}
function makeTray(){platform(content,12,9);const g=new THREE.Group();content.add(g);chassis(g,8,4.6);for(const x of [-2.1,2.1]){chip(g,x,-.62,.95,.95,MAT.silver,'cpu');for(const dz of [.48,1.22]){chip(g,x+(dz===1.22?-.72:.72),dz,1.03,.82,MAT.green,'gpu');for(const dx of [-.43,.43])box(g,.16,.12,.34,x+(dz===1.22?-.72:.72)+dx,.72,dz,MAT.silver,'gpu')}}for(let i=0;i<4;i++){const x=-2.76+i*.56;box(g,.43,.11,.7,x,.48,-1.7,MAT.blue,'nic');port(g,x,.56,2.38,0x67bfff,'nic')}for(let i=0;i<2;i++){const x=.73+i*.72;box(g,.53,.14,.76,x,.48,-1.7,MAT.amber,'dpu');port(g,x-.13,.57,2.38,0xeaaa70,'dpu');port(g,x+.13,.57,2.38,0xf2cb8a,'dpu')}for(let i=0;i<4;i++){box(g,.3,.1,.64,2.2+i*.32,.47,1.78,MAT.silver,'ssd')}box(g,.25,.08,.62,3.55,.47,1.78,MAT.silver,'ssd');for(const x of [-3.25,3.25]){chip(g,x,-.47,.51,.57,MAT.purple,'pcie',false);line(g,[[x,.48,-.47],[x*.75,.48,-.9],[x*.62,.51,-1.4]],0xb18ad8,.018)}for(let i=0;i<26;i++){const x=-3.5+(i%13)*.55,z=-1.15+Math.floor(i/13)*2.7;box(g,.06,.015,.45,x,.3,z,new THREE.MeshStandardMaterial({color:0x387d58,metalness:.54,roughness:.4}))}label(content,'GRACE CPU ×2',0,1.42,-.62,.64);label(content,'BLACKWELL GPU ×4',0,1.64,1.05,.88);label(content,'PCIe SWITCH',0,1.52,-1.53,.72,'#d4b6f3');label(content,'CX-7 ×4 / BF3 ×2 / NVMe',0,1.1,2.85,.79);return g}
function makeSwitch(){platform(content,11,8);const g=new THREE.Group();content.add(g);chassis(g,7.5,3.5);for(const x of [-1.75,1.75]){chip(g,x,0,1.55,1.55,MAT.green,'switch',false);for(let i=0;i<9;i++)box(g,.04,.018,.45,x-.72+i*.18,.73,-1.16,MAT.copper,'switch')}for(let i=0;i<28;i++)port(g,-3.4+i*.25,.42,1.84,i%2?0x90ca4a:0x7994a2,'switch');for(let i=0;i<15;i++){const x=-3.25+i*.46;box(g,.08,.16,.18,x,.35,-1.81,MAT.copper,'switch')}label(content,'NVIDIA NVSWITCH ASIC ×2',0,1.9,0,.9);label(content,'机柜背面：被动铜缆连接器',0,1.16,-2.45,.76);return g}
function miniatureSwitch(parent,x,y,z,w,mat,target){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);g.userData.select=target;
  box(g,w,.27,.68,0,0,0,MAT.dark,target);
  box(g,w-.08,.16,.045,0,0,.37,mat,target);
  for(let i=0;i<8;i++)port(g,-w*.39+i*w*.11,0,.43,mat===MAT.amber?0xf1ad69:0x79bdff,target);
  return g;
}
function makeIbRail(){
  platform(content,23,13);
  const xs=Array.from({length:8},(_,i)=>(i-3.5)*2.52);
  for(let i=0;i<8;i++){
    const x=xs[i];
    box(content,1.23,1.35,.86,x,.77,4.18,MAT.dark,'rack');
    box(content,1.08,.08,.9,x,1.45,4.18,MAT.silver,'rack');
    for(let k=0;k<4;k++)box(content,.94,.16,.075,x,.47+k*.24,4.65,MAT.metal,'rack');
    label(content,`R${i+1}`,x,1.89,4.18,.48);
    miniatureSwitch(content,x,.52,1.15,1.55,MAT.blue,'ibChip');
    line(content,[[x,.77,3.72],[x,.85,2.4],[x,.52,1.58]],0x5caff2,.021);
  }
  for(let i=0;i<6;i++){
    const x=(i-2.5)*2.38;
    miniatureSwitch(content,x,2.42,-3.45,1.78,MAT.blue,'ibChip');
    label(content,`S${i+1}`,x,2.92,-3.4,.48);
  }
  for(let i=0;i<8;i++){
    const x=xs[i],sx=(i%6-2.5)*2.38;
    line(content,[[x,.53,.75],[x,1.52,-1.08],[sx,2.4,-3.05]],0x315c7e,.014);
  }
  // Highlight a real type of route, without implying that only one path exists.
  line(content,[[xs[0],1.48,4.18],[xs[0],.69,1.15],[xs[0],1.55,-.86],[0,2.42,-3.08],[xs[7],1.55,-.86],[xs[7],.69,1.15],[xs[7],1.48,4.18]],0x7fd0ff,.055);
  label(content,'R1 → Leaf 1 → Spine → Leaf 8 → R8',0,4.12,-.15,.83);
  label(content,'每条柜→Leaf：18 个托盘 × 400G',0,.45,6.0,.73);
  label(content,'LEAF · 每计算柜一台 / 本 Rail',0,1.38,1.1,.76);
  label(content,'SPINE · 6 台 / 本 Rail',0,3.3,-4.7,.73);
}
function makeEthFabric(){
  platform(content,23,15);
  box(content,3.45,.16,3.3,-8,.15,-.65,MAT.board,'dpu');
  for(let i=0;i<2;i++){
    const z=-1.65+i*1.9;
    box(content,2.54,.2,.73,-8,.47,z,MAT.amber,'dpu');
    box(content,1.08,.17,.51,-8.15,.65,z,MAT.chip,'dpu');
    for(let j=0;j<2;j++)port(content,-7.1+j*.3,.53,z+.4,0xf4b26c,'dpu');
  }
  label(content,'计算托盘 · BF3 ×2',-8,1.7,-.5,.75);
  label(content,'每托盘 4 × 200GbE',-8,.83,2.12,.71);
  // The storage and in-band ports enter different logical segments of the same Ethernet fabric.
  miniatureSwitch(content,-2.9,.6,-3.15,3.6,MAT.amber,'ethChip');
  miniatureSwitch(content,-2.9,.6,1.35,3.6,MAT.amber,'ethChip');
  label(content,'存储 Leaf · SN5600',-2.9,1.23,-3.15,.69);
  label(content,'带内 Leaf · SN5600',-2.9,1.23,1.35,.69);
  for(let i=0;i<2;i++){
    const z=-1.65+i*1.9;
    line(content,[[-6.8,.66,z],[-5,.95,-2.5+i*.28],[-4.6,.6,-3.15]],0xe5a05e,.029);
    line(content,[[-6.65,.66,z+.2],[-5,.95,.55+i*.3],[-4.6,.6,1.35]],0xf3c487,.029);
  }
  for(let i=0;i<2;i++)miniatureSwitch(content,2.7,.55+i*.64,-.9,3.8,MAT.amber,'ethChip');
  label(content,'SN5600 汇聚 / SPINE ×2',2.7,2.25,-.9,.78);
  for(const z of [-3.15,1.35])for(const y of [.55,1.19])line(content,[[-1.05,.62,z],[.6,.85,z*.5],[.85,y,-.9]],0xd5965d,.02);
  box(content,2.25,1.62,1.32,8,1.0,-3.1,MAT.metal,'ethChip');
  box(content,2.25,1.62,1.32,8,1.0,1.4,MAT.dark,'ethChip');
  label(content,'共享存储',8,2.22,-3.1,.68);
  label(content,'集群服务',8,2.22,1.4,.68);
  line(content,[[4.6,1.2,-1.1],[6.3,1.65,-2.5],[7,1.2,-3.1]],0xe5a05e,.04);
  line(content,[[4.6,.63,-.7],[6.3,1.1,.75],[7,.8,1.4]],0xf3c487,.04);
  // Out-of-band is rack-local and low-speed; it is not one of BlueField's four 200GbE ports.
  miniatureSwitch(content,-2.9,.48,5.0,3.2,MAT.purple,'facility');
  miniatureSwitch(content,2.7,.48,5.0,3.2,MAT.purple,'facility');
  label(content,'BMC → 柜内管理 ToR',-5.8,1.25,5.0,.66,'#d8b6f3');
  label(content,'SN2201 管理网',3.9,1.25,5.0,.66,'#d8b6f3');
  line(content,[[-1.25,.53,5.0],[0,.77,5.0],[1.05,.53,5.0]],0xc798ee,.032);
  label(content,'这张网与蓝色 InfiniBand 独立',0,.46,-6.6,.78);
}
function makeNetworkInside(type){
  platform(content,11,8);
  const ib=type==='ibChip',col=ib?0x5caff2:0xe7a365;
  const g=new THREE.Group();content.add(g);chassis(g,7.6,3.6);
  box(g,6.9,.045,3.05,0,.37,0,MAT.board,type);
  chip(g,0,-.35,1.85,1.8,ib?MAT.blue:MAT.amber,type,false);
  // Copper board traces connect the electronic switch ASIC to the front-panel cages.
  for(const x of [-2.7,-1.7,-.7,.7,1.7,2.7]){
    line(g,[[x*.22,.49,.52],[x*.62,.49,1.02],[x,.49,1.42]],0xb58962,.024);
  }
  for(let i=0;i<8;i++){
    const x=-3.12+i*.89;
    box(g,.73,.28,.42,x,.53,1.49,MAT.dark,'optics');
    box(g,.49,.12,.09,x,.54,1.76,ib?MAT.blue:MAT.amber,'optics');
  }
  // One module is pulled slightly forward to expose the cage/module boundary.
  box(g,.71,.25,.82,1.33,.62,2.05,MAT.silver,'optics');
  box(g,.55,.14,.51,1.33,.78,2.16,MAT.board,'optics');
  box(g,.45,.16,.16,1.33,.66,2.5,ib?MAT.blue:MAT.amber,'optics');
  for(const x of [-2.7,-1.95,2.35,2.95])box(g,.48,.11,.42,x,.49,-1.11,MAT.chip,type);
  label(content,ib?'QUANTUM-2 交换 ASIC':'SPECTRUM-4 交换 ASIC',0,1.48,-.5,.79);
  label(content,'板上高速电走线',-2.0,1.02,.8,.61,'#ecc39b');
  label(content,'OSFP 笼子',-1.95,1.14,2.05,.62);
  label(content,'点击抽出的光模块',2.12,1.45,2.17,.69);
  return g;
}
function makeOptics(){
  platform(content,12,8);
  const g=new THREE.Group();content.add(g);
  box(g,7.2,.12,2.8,0,.27,0,MAT.board,'optics');
  // Left: electrical contacts face the switch. Right: two optical lanes leave the module.
  box(g,.56,.22,2.15,-3.25,.48,0,MAT.copper,'optics');
  for(let i=0;i<12;i++)box(g,.035,.026,.2,-3.58+i*.055,.62,-.95,MAT.silver,'optics');
  box(g,.75,.26,1.55,-2.02,.57,0,MAT.purple,'optics');
  box(g,.78,.25,.63,-.42,.57,-.75,MAT.amber,'optics');
  box(g,1.06,.27,.67,1.18,.59,-.75,MAT.amber,'optics');
  box(g,.75,.26,.63,-.42,.57,.76,MAT.blue,'optics');
  box(g,.77,.25,.63,1.18,.59,.76,MAT.blue,'optics');
  box(g,.41,.36,2.42,3.56,.54,0,MAT.silver,'optics');
  for(const z of [-.78,.78]){
    const m=new THREE.Mesh(new THREE.TorusGeometry(.15,.035,8,18),MAT.silver);
    m.rotation.y=Math.PI/2;m.position.set(3.79,.57,z);g.add(m);
  }
  line(g,[[-2.83,.73,-.74],[-2.03,.73,-.74],[-.42,.75,-.74],[1.18,.76,-.74],[3.55,.75,-.78],[4.6,.62,-1.05]],0xe6a06b,.039);
  line(g,[[4.6,.62,1.05],[3.55,.75,.78],[1.18,.76,.76],[-.42,.75,.76],[-2.03,.73,.76],[-2.83,.73,.76]],0x69b9f0,.039);
  label(content,'DSP / CDR 示意',-2.03,1.39,0,.61,'#dbc5f5');
  label(content,'Driver',-.42,1.36,-.79,.52,'#ffd1a5');
  label(content,'激光器 / 调制器',1.25,1.38,-.79,.65,'#ffd1a5');
  label(content,'光探测器 PD',1.27,1.39,.77,.61,'#b5dcff');
  label(content,'TIA',-.43,1.35,.77,.52,'#b5dcff');
  label(content,'Tx 发射 →',-1.3,2.05,-1.03,.69,'#ffd1a5');
  label(content,'光纤',4.28,1.22,0,.59);
  return g;
}
function makeGpu(){platform(content,9,7);const g=new THREE.Group();content.add(g);box(g,4.8,.2,4.2,0,.37,0,MAT.board,'gpu');box(g,2.2,.23,2.2,0,.65,0,MAT.black,'gpu');box(g,1.8,.19,1.8,0,.87,0,MAT.green,'gpu');const ps=[[-1.76,-1.42],[-.6,-1.55],[.6,-1.55],[1.76,-1.42],[-1.76,1.42],[-.6,1.55],[.6,1.55],[1.76,1.42]];for(const [x,z]of ps)box(g,.59,.27,.55,x,.75,z,MAT.silver,'gpu');label(content,'GPU DIE',0,1.32,0,.68);label(content,'HBM 堆叠 ×8',0,1.18,2.35,.78);return g}
function makeSmallPart(type){platform(content,9,7);const g=new THREE.Group();content.add(g);const ib=type==='nic',dpu=type==='dpu',ssd=type==='ssd',cpu=type==='cpu';box(g,6,.2,3,0,.28,0,ssd?MAT.metal:MAT.board,type);if(cpu){chip(g,0,0,2.1,2.1,MAT.silver,'cpu',false);for(let i=0;i<10;i++)box(g,.1,.04,2.15,-2.6+i*.55,.39,-1.33,MAT.copper,'cpu')}else if(ssd){for(let i=0;i<4;i++){box(g,.55,.18,2.4,-2.15+i*1.42,.53,0,MAT.silver,'ssd');box(g,.38,.07,.75,-2.15+i*1.42,.66,.3,MAT.chip,'ssd')}}else{chip(g,-.9,0,1.65,1.65,ib?MAT.blue:MAT.amber,type,false);for(let i=0;i<6;i++)box(g,.38,.12,.56,.58+i*.34,.49,-.75,MAT.chip,type);if(dpu){port(g,1.25,.52,1.57,0xe9ab72,'eth');port(g,2.05,.52,1.57,0xf2cb8a,'eth');label(content,'左：存储 200GbE',-1.55,1.34,2.0,.6,'#ffd0a4');label(content,'右：带内 200GbE',1.7,1.34,2.0,.6,'#ffe3b4')}else for(let i=0;i<2;i++)port(g,1.3+i*.72,.52,1.57,0x72bfff,'ib')}label(content,cpu?'NVIDIA GRACE CPU':ssd?'NVMe SSD':ib?'CONNECTX-7 / 400G IB':'BLUEFIELD-3 / ETHERNET',0,2.0,0,.88);return g}
function makePcie(){platform(content,10,8);const g=new THREE.Group();content.add(g);box(g,7,.18,3.8,0,.2,0,MAT.board,'pcie');chip(g,0,0,1.42,1.42,MAT.purple,'pcie',false);for(let i=0;i<8;i++){const x=-3.08+i*.88;box(g,.5,.14,.78,x,.42,i%2?1.18:-1.18,i<4?MAT.blue:MAT.silver,'pcie');line(g,[[x,.52,i%2?1.18:-1.18],[x*.55,.52,i%2?.65:-.65],[0,.52,0]],0xb18ad8,.018)}label(content,'PCIe SWITCH / 本地 I-O',0,1.75,0,.9,'#dfc3ff');label(content,'示意：网卡、DPU 与 NVMe 等外设',0,1.18,2.3,.73);return g}
function makeFacility(){platform(content,10,8);const g=rack(content,0,0,1,'01',true,'facility');box(content,.24,5.4,.2,1.65,2.9,-.7,MAT.copper,'facility');for(let i=0;i<6;i++)line(content,[[1.4,.7+i*.73,-.7],[2.1,.8+i*.73,-.95],[2.3,1.2+i*.66,-1.7]],0x48abc6,.032);label(content,'母排 / 供电',2.7,5.45,-.4,.68);label(content,'冷板 / 液冷歧管',2.9,2.9,-1.3,.68);return g}
function build(view){scene.remove(content);content=new THREE.Group();scene.add(content);const builders={overview:makeOverview,topology:makeTopology,rack:makeRack,tray:makeTray,switch:makeSwitch,gpu:makeGpu,cpu:()=>makeSmallPart('cpu'),nic:()=>makeSmallPart('nic'),pcie:makePcie,dpu:()=>makeSmallPart('dpu'),ssd:()=>makeSmallPart('ssd'),ibRail:makeIbRail,ibChip:()=>makeNetworkInside('ibChip'),eth:makeEthFabric,ethChip:()=>makeNetworkInside('ethChip'),optics:makeOptics,facility:makeFacility};builders[view]();const preset={overview:[29,.28,1.13,2.3],topology:[28,.24,.78,.5],rack:[11,.37,1.2,3],tray:[12,.42,.88,.5],switch:[9,.37,.99,.45],gpu:[8,.4,.88,.75],ibRail:[26,.18,.9,1.4],eth:[23,.24,.89,1.3],ibChip:[9,.4,.9,.65],ethChip:[9,.4,.9,.65],optics:[11.2,.12,.65,.65],facility:[11,.45,1.17,3]};const p=preset[view]||[10,.42,.9,.65];[radius,theta,phi]=p;focus.set(['overview','topology','ibRail','eth'].includes(view)?3:(view==='optics'?1.25:(view==='ibChip'||view==='ethChip'?.55:0)),p[3],0);updateCamera();}
function updateCamera(){phi=THREE.MathUtils.clamp(phi,.25,1.5);radius=THREE.MathUtils.clamp(radius,3.3,36);camera.position.set(focus.x+radius*Math.sin(phi)*Math.sin(theta),focus.y+radius*Math.cos(phi),focus.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(focus)}
function updateUi(){const p=PAGES[current];brief.innerHTML=`<div class="eyebrow">${p.eyebrow}</div><h1>${p.title}</h1><p class="lead">${p.lead}</p><div class="rule"></div><div class="vendor-label">公开可确认的产品 / 供应商</div><div class="vendor">${p.vendor}</div><p class="fact">${p.fact}</p><a href="${p.source}" target="_blank" rel="noopener noreferrer">${p.sourceLabel||'NVIDIA 官方资料'} ↗</a>${p.next?`<button class="next" type="button" data-view="${p.next}">继续进入：${PAGES[p.next].name}</button>`:''}`;let chain=[current],c=current;while(PARENTS[c]){c=PARENTS[c];chain.unshift(c)}trail.innerHTML=chain.map((key,i)=>`${i?'<span>/</span>':''}${i===chain.length-1?`<strong>${PAGES[key].name}</strong>`:`<button type="button" data-view="${key}">${PAGES[key].name}</button>`}`).join('');const ibStages=[['ibRail','一条 IB Rail'],['ibChip','交换机内部'],['optics','可插拔光模块']];drillNav.hidden=!ibStages.some(([key])=>key===current);drillNav.innerHTML=drillNav.hidden?'':ibStages.map(([key,name],i)=>`<button type="button" data-view="${key}" class="${key===current?'active':''}" ${key===current?'aria-current="page"':''}>${i+1}. ${name}</button>`).join('<span aria-hidden="true">→</span>');document.querySelectorAll('.quick-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===current));document.getElementById('physicalLens').classList.toggle('active',current!=='topology');document.getElementById('logicalLens').classList.toggle('active',current==='topology');hoverLabel.classList.remove('visible')}
function go(view,replace=false){if(view==='ib')view='ibRail';if(!PAGES[view]||transitioning)return;transitioning=true;hovered=null;shade.classList.add('active');const start=performance.now(),base=radius;function zoom(t){const q=Math.min(1,(t-start)/240);radius=base*(1-.24*q);updateCamera();if(q<1)requestAnimationFrame(zoom)}requestAnimationFrame(zoom);setTimeout(()=>{current=view;if(view!=='topology')lastPhysical=view;build(view);updateUi();if(!replace)history.pushState({view},'',view==='overview'?location.pathname:`#${view}`);else history.replaceState({view},'',view==='overview'?location.pathname:`#${view}`);shade.classList.remove('active');transitioning=false},280)}
document.getElementById('physicalLens').addEventListener('click',()=>go(lastPhysical==='topology'?'overview':lastPhysical));
document.getElementById('logicalLens').addEventListener('click',()=>go('topology'));
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)go(b.dataset.view)});window.addEventListener('popstate',()=>go(location.hash==='#ib'?'ibRail':(PAGES[location.hash.slice(1)]?location.hash.slice(1):'overview'),true));
function hit(e){const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);for(const h of raycaster.intersectObjects(content.children,true)){let o=h.object;while(o&&!o.userData.select)o=o.parent;if(o&&o.userData.select)return o.userData.select}return null}
canvas.addEventListener('pointerdown',e=>{dragging=true;moved=false;down={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(dragging){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;theta-=dx*.006;phi-=dy*.006;updateCamera();down={x:e.clientX,y:e.clientY};hoverLabel.classList.remove('visible')}else{const target=hit(e);hovered=target;if(target&&PAGES[target]){hoverLabel.textContent=`点击进入 · ${PAGES[target].name}`;hoverLabel.style.left=`${Math.min(innerWidth-190,e.clientX+16)}px`;hoverLabel.style.top=`${Math.max(16,e.clientY-35)}px`;hoverLabel.classList.add('visible');canvas.style.cursor='pointer'}else{hoverLabel.classList.remove('visible');canvas.style.cursor='grab'}}});canvas.addEventListener('pointerup',e=>{if(dragging&&!moved){const target=hit(e);if(target&&target!==current)go(target)}dragging=false});canvas.addEventListener('pointercancel',()=>{dragging=false});canvas.addEventListener('wheel',e=>{e.preventDefault();radius*=1+Math.sign(e.deltaY)*.085;updateCamera()},{passive:false});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(){requestAnimationFrame(animate);autoTime+=.003;if(current==='overview'&&!dragging&&!transitioning){theta+=.00022;updateCamera()}renderer.render(scene,camera)}
const initialView=location.hash==='#ib'?'ibRail':(PAGES[location.hash.slice(1)]?location.hash.slice(1):'overview');build(initialView);current=initialView;if(location.hash==='#ib')history.replaceState({view:initialView},'',`#${initialView}`);if(current!=='topology')lastPhysical=current;updateUi();animate();
