/* ============================================================
 * 入境游外卖打车 H5 · 共享数据层
 * 从「外卖打车管理后台页面.html」抽取，供 5 个 H5 文件共用
 * ============================================================ */

/* ---------- 外卖订单（7 笔） ---------- */
const ORDERS = {
  'SG20260907140212':{
    id:'SG20260907140212', tenant:'杭州趣游科技', name:'John Smith', lang:'英语', passport:'E12345678', phone:'13812346620', deviceNo:'DEV-2026-0001',
    source:'AI对话', status:'已支付', meta:'下单 2026-10-20 14:02:12', balance:'326.2',
    sgUrl:'https://g.clawdot.ai/DdFJI',
    merchant:'海底捞火锅(西湖店)',summary:'麻辣锅底 + 酸梅汤 · 2 件',category:'火锅',
    rider:{name:'王骑手',phone:'13857123456',score:'4.8',trips:'1,234'},
    pointLogs:[
      {tm:'2026-09-07 14:02:11',type:'冻结',amount:74.8,note:'下单预占冻结',operator:'系统'},
      {tm:'2026-09-07 14:02:15',type:'实扣',amount:74.8,note:'支付完成实际扣减',operator:'系统'}
    ],
    addr:{label:'杭州君悦酒店 1212 房',detail:'杭州市西湖区湖滨路 28 号',contact:'John / 13812346620',note:'放前台，到了打电话'},
    money:{goods:68.00,delivery:0,service:6.80,total:74.80},
    items:[{name:'麻辣火锅锅底',spec:'中辣·加麻',qty:1,price:58.00,sub:58.00},{name:'酸梅汤',spec:'常规',qty:1,price:10.00,sub:10.00}],
    timeline:[{state:'done',t:'已支付',d:'2026-09-07 14:02:12'},{state:'wait',t:'等待商家接单',d:''}],
    logs:[{tm:'14:02:11',txt:'积分冻结 74.8（预占）',op:'系统'},{tm:'14:02:13',txt:'老外于硬件点击「去支付」',op:'硬件'},
           {tm:'14:02:14',txt:'调用 create_order（preview_id / token / callback_url）',op:'服务端'},{tm:'14:02:15',txt:'闪购返回 order_id，下单成功',op:'闪购'},
           {tm:'14:02:15',txt:'扣减积分 74.8（冻结转实际）',op:'系统'},{tm:'14:02:15',txt:'闪购企业账户扣款 ¥68.00',op:'闪购'}],
    compensations:[{tm:'2026-09-13 17:05:18',points:20.0,operator:'李娜 13800138018'},{tm:'2026-09-09 16:10:33',points:6.0,operator:'李娜 13800138018'}]
  },
  'SG20260907112543':{
    id:'SG20260907112543', tenant:'杭州趣游科技', name:'佐藤健', lang:'日语', passport:'T12345678', phone:'13712342210', deviceNo:'DEV-2026-0002',
    source:'AI对话', status:'商家备餐中', meta:'下单 2026-10-15 11:25:43', balance:'412.5',
    sgUrl:'https://g.clawdot.ai/DdFJI',
    merchant:'沙县小吃(湖滨店)',summary:'蒸饺 + 拌面 · 2 件',category:'快餐',
    rider:{name:'李骑手',phone:'13958056789',score:'4.9',trips:'2,345'},
    pointLogs:[
      {tm:'2026-09-07 11:25:40',type:'冻结',amount:31.5,note:'下单预占冻结',operator:'系统'},
      {tm:'2026-09-07 11:25:43',type:'实扣',amount:31.5,note:'支付完成实际扣减',operator:'系统'}
    ],
    addr:{label:'杭州柏悦酒店 808 房',detail:'杭州市西湖区长生路 27 号',contact:'佐藤健 / 13712342210',note:'不要香菜'},
    money:{goods:28.60,delivery:0,service:2.90,total:31.50},
    items:[{name:'蒸饺',spec:'常规',qty:1,price:16.00,sub:16.00},{name:'拌面',spec:'常规',qty:1,price:12.60,sub:12.60}],
    timeline:[{state:'done',t:'已支付',d:'2026-09-07 11:25:43'},{state:'done',t:'商家接单',d:'2026-09-07 11:28:05'},
               {state:'current',t:'商家备餐中',d:'2026-09-07 11:30:10'},{state:'wait',t:'待配送',d:''}],
    logs:[{tm:'11:25:40',txt:'积分冻结 31.5（预占）',op:'系统'},{tm:'11:25:42',txt:'老外于硬件点击「去支付」',op:'硬件'},
           {tm:'11:25:43',txt:'create_order 成功，扣减积分 31.5',op:'系统'},{tm:'11:25:43',txt:'闪购企业账户扣款 ¥28.60',op:'闪购'},
           {tm:'11:28:05',txt:'状态推送：商家接单',op:'MCP回调'},{tm:'11:30:10',txt:'状态推送：商家备餐中',op:'MCP回调'}],
    compensations:[]
  },
  'SG20260907112055':{
    id:'SG20260907112055', tenant:'浙江文投数媒', name:'Emma Wilson', lang:'英语', passport:'G76543210', phone:'15912343381', deviceNo:'DEV-2026-0003',
    source:'客服代下单', status:'配送中', meta:'下单 2026-09-07 11:20:55', eta:'11:50', balance:'158.0',
    merchant:'麦当劳(武林店)',summary:'麦辣鸡腿堡套餐 · 1 件',category:'快餐',
    cs:{name:'张敏',account:'13900139032',push:'11:20:30',confirm:'11:21:05'},
    rider:{name:'赵骑手',phone:'13738190123',score:'4.7',trips:'3,456'},
    pointLogs:[
      {tm:'2026-09-07 11:20:55',type:'冻结',amount:42.0,note:'下单预占冻结',operator:'系统'},
      {tm:'2026-09-07 11:21:06',type:'实扣',amount:42.0,note:'支付完成实际扣减',operator:'系统'}
    ],
    addr:{label:'杭州温德姆酒店 1506 房',detail:'杭州市下城区武林广场 1 号',contact:'Emma / 15912343381',note:'放房间门口'},
    money:{goods:38.20,delivery:0,service:3.80,total:42.00},
    items:[{name:'麦辣鸡腿堡套餐',spec:'中杯可乐',qty:1,price:38.20,sub:38.20}],
    timeline:[{state:'done',t:'已支付',d:'2026-09-07 11:21:06'},{state:'done',t:'商家接单',d:'2026-09-07 11:24:02'},
               {state:'done',t:'骑手取餐',d:'2026-09-07 11:38:09'},{state:'current',t:'配送中',d:'2026-09-07 11:40:03'},{state:'wait',t:'已送达',d:''}],
    logs:[{tm:'11:20:30',txt:'客服 13900139032 代点订单并推送硬件',op:'客服'},{tm:'11:21:05',txt:'老外确认支付，积分冻结 42.0',op:'硬件'},
           {tm:'11:21:06',txt:'create_order 成功，扣减积分 42.0',op:'系统'},{tm:'11:21:06',txt:'闪购企业账户扣款 ¥38.20',op:'闪购'},
           {tm:'11:24:02',txt:'状态推送：商家接单',op:'MCP回调'},{tm:'11:38:09',txt:'状态推送：骑手取餐',op:'MCP回调'},
           {tm:'11:40:03',txt:'状态推送：配送中（骑手出发）',op:'MCP回调'}],
    compensations:[{tm:'2026-09-12 21:02:35',points:15.0,operator:'张敏 13900139032'},{tm:'2026-09-10 21:30:26',points:18.0,operator:'张敏 13900139032'}]
  },
  'SG20260906190533':{
    id:'SG20260906190533', tenant:'浙江文投数媒', name:'佐藤健', lang:'日语', passport:'T12345678', phone:'13712342210', deviceNo:'DEV-2026-0002',
    source:'AI对话', status:'已完成', meta:'下单 2026-09-06 19:05:33', balance:'412.5',
    merchant:'沙县小吃(湖滨店)',summary:'蒸饺 + 拌面 · 2 件',category:'快餐',
    rider:{name:'陈骑手',phone:'13606534567',score:'5.0',trips:'4,567'},
    pointLogs:[
      {tm:'2026-09-06 19:05:40',type:'冻结',amount:31.5,note:'下单预占冻结',operator:'系统'},
      {tm:'2026-09-06 19:05:43',type:'实扣',amount:31.5,note:'支付完成实际扣减',operator:'系统'}
    ],
    addr:{label:'杭州柏悦酒店 808 房',detail:'杭州市西湖区长生路 27 号',contact:'佐藤健 / 13712342210',note:'不要香菜'},
    money:{goods:28.60,delivery:0,service:2.90,total:31.50},
    items:[{name:'蒸饺',spec:'常规',qty:1,price:16.00,sub:16.00},{name:'拌面',spec:'常规',qty:1,price:12.60,sub:12.60}],
    timeline:[{state:'done',t:'已支付',d:'2026-09-06 19:05:43'},{state:'done',t:'商家接单',d:'2026-09-06 19:08:05'},
               {state:'done',t:'骑手取餐',d:'2026-09-06 19:20:18'},{state:'done',t:'配送中',d:'2026-09-06 19:22:03'},{state:'done',t:'已完成',d:'2026-09-06 19:35:12'}],
    logs:[{tm:'19:05:40',txt:'积分冻结 31.5（预占）',op:'系统'},{tm:'19:05:42',txt:'老外于硬件点击「去支付」',op:'硬件'},
           {tm:'19:05:43',txt:'create_order 成功，扣减积分 31.5',op:'系统'},{tm:'19:05:43',txt:'闪购企业账户扣款 ¥28.60',op:'闪购'},
           {tm:'19:35:12',txt:'状态推送：已完成（已送达并确认）',op:'MCP回调'}],
    compensations:[{tm:'2026-09-12 14:55:12',points:10.0,operator:'张敏 13900139032'},{tm:'2026-09-09 12:58:11',points:3.0,operator:'张敏 13900139032'}]
  },
  'SG20260906170010':{
    id:'SG20260906170010', tenant:'杭州趣游科技', name:'Kim Min-jun', lang:'韩语', passport:'M12345678', phone:'18612349045', deviceNo:'DEV-2026-0004',
    source:'客服代下单', status:'已取消', meta:'下单 2026-09-06 17:00:10', balance:'220.0',
    merchant:'星巴克(西湖天地)',summary:'燕麦拿铁 · 1 件',category:'咖啡',
    cs:{name:'李娜',account:'13800138018',push:'17:00:02',confirm:'—'},
    pointLogs:[
      {tm:'2026-09-06 17:00:20',type:'冻结',amount:32.0,note:'下单预占冻结',operator:'系统'},
      {tm:'2026-09-06 17:02:16',type:'解冻',amount:32.0,note:'订单取消，积分解冻',operator:'系统'}
    ],
    addr:{label:'杭州湖滨大酒店 602 房',detail:'杭州市上城区湖滨路 15 号',contact:'Kim / 18612349045',note:'联系前台'},
    money:{goods:29.10,delivery:0,service:2.90,total:32.00},
    items:[{name:'燕麦拿铁',spec:'大杯·热',qty:1,price:29.10,sub:29.10}],
    timeline:[{state:'done',t:'订单创建',d:'2026-09-06 17:00:10'},{state:'closed',t:'已取消',d:'2026-09-06 17:02:15'}],
    logs:[{tm:'17:00:02',txt:'客服 13800138018 代点订单并推送硬件',op:'客服'},{tm:'17:00:20',txt:'老外查看订单但未确认支付',op:'硬件'},
           {tm:'17:02:15',txt:'老外主动取消订单',op:'硬件'},{tm:'17:02:16',txt:'关单，无积分扣减、无企业账户扣款',op:'系统'}],
    compensations:[]
  },
  'SG20260906143008':{
    id:'SG20260906143008', tenant:'上海入境通', name:'Kim Min-jun', lang:'韩语', passport:'M12345678', phone:'18612349045', deviceNo:'DEV-2026-0004',
    source:'客服代下单', status:'下单或履约失败', meta:'下单 2026-09-06 14:30:08', balance:'220.0（未扣减）',
    merchant:'星巴克(西湖天地)',summary:'燕麦拿铁 · 1 件',category:'咖啡',
    cs:{name:'李娜',account:'13800138018',push:'14:30:02',confirm:'14:30:20'},
    pointLogs:[
      {tm:'2026-09-06 14:30:20',type:'冻结',amount:32.0,note:'老外确认支付，积分冻结',operator:'系统'},
      {tm:'2026-09-06 14:30:52',type:'解冻',amount:32.0,note:'create_order 超时关单，积分解冻',operator:'系统'}
    ],
    addr:{label:'杭州湖滨大酒店 602 房',detail:'杭州市上城区湖滨路 15 号',contact:'Kim / 18612349045',note:'联系前台'},
    money:{goods:29.10,delivery:0,service:2.90,total:32.00},
    items:[{name:'燕麦拿铁',spec:'大杯·热',qty:1,price:29.10,sub:29.10}],
    timeline:[{state:'done',t:'订单已创建',d:'2026-09-06 14:30:08'},{state:'closed',t:'关单',d:'2026-09-06 14:30:52'}],
    logs:[{tm:'14:30:02',txt:'客服 13800138018 代点订单并推送硬件',op:'客服'},{tm:'14:30:20',txt:'老外确认支付，积分冻结 32.0',op:'硬件'},
           {tm:'14:30:21',txt:'调用 create_order（token）',op:'服务端'},{tm:'14:30:51',txt:'create_order 同步超时，无 order_id 返回',op:'系统'},
           {tm:'14:30:52',txt:'关单，解冻积分 32.0（无资损）',op:'系统'}],
    compensations:[]
  },
  'SG20260905183044':{
    id:'SG20260905183044', tenant:'上海入境通', name:'John Smith', lang:'英语', passport:'E12345678', phone:'13812346620', deviceNo:'DEV-2026-0001',
    source:'AI对话', status:'已退款', meta:'下单 2026-09-05 18:30:44', balance:'326.2',
    merchant:'肯德基(湖滨店)',summary:'劲脆鸡腿堡 · 1 件',category:'快餐',
    pointLogs:[
      {tm:'2026-09-05 18:30:40',type:'冻结',amount:28.0,note:'老外确认支付，积分冻结',operator:'硬件'},
      {tm:'2026-09-05 18:30:41',type:'实扣',amount:28.0,note:'create_order 成功，扣减积分',operator:'系统'},
      {tm:'2026-09-05 18:31:03',type:'解冻',amount:28.0,note:'商家接单失败，自动退款',operator:'系统'}
    ],
    addr:{label:'杭州君悦酒店 1212 房',detail:'杭州市西湖区湖滨路 28 号',contact:'John / 13812346620',note:'放前台，到了打电话'},
    money:{goods:25.50,delivery:0,service:2.50,total:28.00},
    refund:{points:28.0,complete:'2026-09-05 18:33:10',status:'退款成功'},
    items:[{name:'劲脆鸡腿堡',spec:'常规',qty:1,price:25.50,sub:25.50}],
    timeline:[{state:'done',t:'已支付',d:'2026-09-05 18:30:44'},{state:'refund',t:'商家接单失败',d:'2026-09-05 18:31:02'},
               {state:'refund',t:'退款完成',d:'2026-09-05 18:33:10'}],
    logs:[{tm:'18:30:40',txt:'积分冻结 28.0，老外确认支付',op:'硬件'},{tm:'18:30:41',txt:'create_order 成功，扣减积分 28.0',op:'系统'},
           {tm:'18:31:02',txt:'状态推送：商家接单失败',op:'MCP回调'},{tm:'18:31:03',txt:'自动触发退款：积分 +28.0 退回',op:'系统'},
           {tm:'18:33:10',txt:'闪购企业账户冲正 ¥25.50 完成',op:'闪购'}],
    compensations:[]
  }
};

/* ---------- 补偿积分审核单 ---------- */
let COMP_REVIEWS = [
  { id:'CP20260914001', orderId:'SG20260907140212', points:30.0, reason:'外卖超时约 50 分钟，老外等待过久', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-14 10:12:33', status:'待审核', reviewer:'', reviewerAccount:'', reviewTm:'', comment:'' },
  { id:'CP20260914002', orderId:'SG20260907112055', points:8.0, reason:'配送途中洒漏，餐品不完整', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-14 11:05:10', status:'待审核', reviewer:'', reviewerAccount:'', reviewTm:'', comment:'' },
  { id:'CP20260914003', orderId:'SG20260906190533', points:12.0, reason:'送达时间超出预计 25 分钟', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-14 09:20:41', status:'待审核', reviewer:'', reviewerAccount:'', reviewTm:'', comment:'' },
  { id:'CP20260913004', orderId:'SG20260907140212', points:20.0, reason:'餐品温度不达标，老外要求补偿', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-13 16:40:02', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-13 17:05:18', comment:'情况属实，同意补偿' },
  { id:'CP20260912005', orderId:'SG20260907112055', points:15.0, reason:'骑手送错楼层，老外自行下楼取餐', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-12 20:30:11', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-12 21:02:35', comment:'核实无误，同意补偿' },
  { id:'CP20260912006', orderId:'SG20260906190533', points:10.0, reason:'少送一份小食', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-12 14:22:08', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-12 14:55:12', comment:'同意补偿' },
  { id:'CP20260910007', orderId:'SG20260907112055', points:18.0, reason:'订单延迟超 1 小时，老外多次催单', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-10 21:05:12', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-10 21:30:26', comment:'延迟属实，同意补偿' },
  { id:'CP20260909008', orderId:'SG20260907140212', points:6.0, reason:'汤汁外漏，餐盒污染', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-09 15:44:07', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-09 16:10:33', comment:'同意补偿' },
  { id:'CP20260909009', orderId:'SG20260906190533', points:3.0, reason:'餐具缺失，老外无法就餐', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-09 12:30:55', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-09 12:58:11', comment:'同意补偿' },
  { id:'CP20260913010', orderId:'SG20260907112543', points:31.5, reason:'出餐慢导致老外投诉', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-13 09:12:55', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-13 09:40:22', comment:'缺少配送异常凭证，请补充后重新提交' },
  { id:'CP20260912011', orderId:'SG20260907112055', points:25.0, reason:'老外投诉配送员态度问题', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-12 10:18:44', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-12 10:45:20', comment:'与既有补偿重复，不予重复补偿' },
  { id:'CP20260911012', orderId:'SG20260907140212', points:35.0, reason:'老外要求整单退款转补偿', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-11 11:08:44', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-11 11:35:20', comment:'申请金额超出实际损失，请按实际损失重新评估' },
  { id:'CP20260910013', orderId:'SG20260907112543', points:5.0, reason:'配送费争议', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-10 10:02:19', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-10 10:30:47', comment:'配送费按平台规则收取，不予补偿' },
  { id:'CP20260908014', orderId:'SG20260907112543', points:12.0, reason:'老外要求部分退款', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-08 18:20:41', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-08 18:50:09', comment:'证据不足，请提供配送异常照片' },
  // ===== 打车业态审核单（CC 开头订单）=====
  { id:'CP20260914015', orderId:'CC20261014091001', points:25.0, reason:'司机绕路，实际费用超出预估较多', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-14 13:40:22', status:'待审核', reviewer:'', reviewerAccount:'', reviewTm:'', comment:'' },
  { id:'CP20260914016', orderId:'CC20261014091802', points:10.0, reason:'司机服务态度差，老外投诉', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-14 14:05:10', status:'待审核', reviewer:'', reviewerAccount:'', reviewTm:'', comment:'' },
  { id:'CP20260913017', orderId:'CC20261014090303', points:15.0, reason:'取消订单仍被收取取消费', applicant:'李娜', applicantAccount:'13800138018', applyTm:'2026-09-13 15:22:36', status:'已通过', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-13 15:50:02', comment:'核实为系统异常扣费，同意补偿' },
  { id:'CP20260912018', orderId:'CC20261014084604', points:8.0, reason:'行程中司机临时加价', applicant:'张敏', applicantAccount:'13900139032', applyTm:'2026-09-12 16:18:51', status:'已驳回', reviewer:'王强', reviewerAccount:'13700137001', reviewTm:'2026-09-12 16:45:33', comment:'加价属司机个人行为，已另行处理司机，不予积分补偿' }
];

/* ---------- 审核单申请凭证（mock 占位图，按凭证ID固定种子） ---------- */
// 为每条审核单生成 1~3 张凭证小图/大图 URL（picsum.photos 按 seed 固定图片）
(function injectEvidences(){
  // 凭证与业务场景的对应关系（让 mock 图尽量贴近文案）
  var SCENE_SEED = {
    'waimai_late':   ['food-delivery-late', 'takeout-box-cold', 'cold-noodles'],
    'waimai_spill':  ['spilled-soup', 'leaking-lunchbox', 'stained-package'],
    'waimai_wrong':  ['wrong-floor-note', 'delivery-location'],
    'waimai_missing':['missing-cutlery', 'empty-side-dish'],
    'taxi_detour':   ['taxi-detour-map', 'long-route-gps'],
    'taxi_attitude': ['driver-review-bad', 'complaint-chat'],
    'taxi_fee':      ['receipt-overcharge', 'cancel-fee-screenshot'],
    'taxi_surge':    ['price-change-screen', 'driver-bargain']
  };
  // 每条审核单对应的场景 key 与图片张数
  var PLAN = {
    'CP20260914001': { scene:'waimai_late',    count:3 },
    'CP20260914002': { scene:'waimai_spill',   count:2 },
    'CP20260914003': { scene:'waimai_late',    count:1 },
    'CP20260913004': { scene:'waimai_late',    count:2 },
    'CP20260912005': { scene:'waimai_wrong',   count:2 },
    'CP20260912006': { scene:'waimai_missing', count:1 },
    'CP20260910007': { scene:'waimai_late',    count:3 },
    'CP20260909008': { scene:'waimai_spill',   count:2 },
    'CP20260909009': { scene:'waimai_missing', count:1 },
    'CP20260913010': { scene:'waimai_late',    count:0 },
    'CP20260912011': { scene:'waimai_wrong',   count:2 },
    'CP20260911012': { scene:'waimai_spill',   count:3 },
    'CP20260910013': { scene:'waimai_late',    count:1 },
    'CP20260908014': { scene:'waimai_spill',   count:2 },
    'CP20260914015': { scene:'taxi_detour',    count:3 },
    'CP20260914016': { scene:'taxi_attitude',  count:2 },
    'CP20260913017': { scene:'taxi_fee',       count:2 },
    'CP20260912018': { scene:'taxi_surge',     count:2 }
  };
  COMP_REVIEWS.forEach(function(item){
    var plan = PLAN[item.id] || { scene:'waimai_late', count:1 };
    var seeds = SCENE_SEED[plan.scene] || SCENE_SEED['waimai_late'];
    var list = [];
    for (var i = 0; i < plan.count; i++) {
      var seed = seeds[i % seeds.length] + '-' + item.id.toLowerCase() + '-' + (i + 1);
      list.push({
        id: item.id + '-EV' + (i + 1),
        thumb: 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/120/120',
        large: 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/600/600'
      });
    }
    item.evidences = list;
  });
})();

/* ---------- 老外档案 ---------- */
const TOURISTS = [
  {id:'T001', userId:'U346620', name:'John Smith', lang:'英语', passport:'E12345678', phone:'13812346620', deviceNo:'DEV-2026-0001', city:'杭州', lng:120.1551, lat:30.2741, balance:'412.5', loc:'杭州湖滨银泰 in77',
   diet:'不吃辣；忌花生、香菜', pref:'少油少盐；餐具要 2 份，送到前台请致电',
   addrs:[
    {label:'杭州君悦酒店 1212 房', detail:'杭州市西湖区湖滨路 28 号', contact:'John / 13812346620', note:'放前台，到了打电话', lng:120.1622, lat:30.2490},
    {label:'杭州君悦酒店 行政酒廊 8F', detail:'杭州市西湖区湖滨路 28 号', contact:'John / 13812346620', note:'送至 8 层行政酒廊', lng:120.1622, lat:30.2490},
    {label:'杭州西子湖四季酒店 3205 房', detail:'杭州市西湖区灵隐路 5 号', contact:'John / 13812346620', note:'前次入住，备用地址', lng:120.1288, lat:30.2570},
    {label:'杭州东站维也纳酒店 706 房', detail:'杭州市上城区东站西广场 1 号', contact:'John / 13812346620', note:'备用地址', lng:120.2130, lat:30.2885},
    {label:'杭州湖滨银泰 in77 公寓 1806', detail:'杭州市上城区延安路 98 号', contact:'John / 13812346620', note:'楼下有门禁，到了请致电', lng:120.1655, lat:30.2488},
    {label:'杭州黄龙饭店 1508 房', detail:'杭州市西湖区曙光路 120 号', contact:'John / 13812346620', note:'备用地址', lng:120.1349, lat:30.2686},
    {label:'杭州西湖国宾馆 8 号楼 201', detail:'杭州市西湖区杨公堤 18 号', contact:'John / 13812346620', note:'周末度假住址', lng:120.1305, lat:30.2385},
    {label:'杭州城站汉庭酒店 512 房', detail:'杭州市上城区清泰街 152 号', contact:'John / 13812346620', note:'临时住一晚', lng:120.1802, lat:30.2436},
    {label:'杭州萧山机场亚朵酒店 908 房', detail:'杭州市萧山区机场路 66 号', contact:'John / 13812346620', note:'次日早班机，送前台', lng:120.4341, lat:30.2361}
  ]},
  {id:'T002', userId:'U342210', name:'佐藤健', lang:'日语', passport:'T12345678', phone:'13712342210', deviceNo:'DEV-2026-0002', city:'杭州', lng:120.1551, lat:30.2741, balance:'704.8', loc:'杭州湖滨银泰 in77',
   diet:'不吃香菜、不吃动物内脏', pref:'口味清淡；不要放味精；需要一次性筷子',
   addrs:[
    {label:'杭州柏悦酒店 808 房', detail:'杭州市西湖区长生路 27 号', contact:'佐藤健 / 13712342210', note:'不要香菜', lng:120.1640, lat:30.2521},
    {label:'杭州柏悦酒店 37F 会所', detail:'杭州市西湖区长生路 27 号', contact:'佐藤健 / 13712342210', note:'送至 37 层会所前台', lng:120.1640, lat:30.2521},
    {label:'杭州城中香格里拉 1501 房', detail:'杭州市下城区长寿路 6 号', contact:'佐藤健 / 13712342210', note:'备用地址', lng:120.1637, lat:30.2673},
    {label:'杭州黄龙饭店 508 房', detail:'杭州市西湖区曙光路 120 号', contact:'佐藤健 / 13712342210', note:'备用地址', lng:120.1349, lat:30.2686},
    {label:'杭州湖滨银泰 in77 服务中心', detail:'杭州市上城区延安路 98 号', contact:'佐藤健 / 13712342210', note:'送至 1 层服务中心', lng:120.1655, lat:30.2488},
    {label:'杭州萧山机场希尔顿 2201 房', detail:'杭州市萧山区机场路 88 号', contact:'佐藤健 / 13712342210', note:'转机过夜', lng:120.4341, lat:30.2361}
  ]},
  {id:'T003', userId:'U343381', name:'Emma Wilson', lang:'英语', passport:'G76543210', phone:'15912343381', deviceNo:'DEV-2026-0003', city:'杭州', lng:120.1551, lat:30.2741, balance:'186.2', loc:'杭州湖滨银泰 in77',
   diet:'素食（不吃任何肉类）', pref:'偏好甜口；不要葱姜蒜；送到房间门口即可',
   addrs:[
    {label:'杭州温德姆酒店 1506 房', detail:'杭州市下城区武林广场 1 号', contact:'Emma / 15912343381', note:'放房间门口', lng:120.1685, lat:30.2748},
    {label:'杭州温德姆酒店 2F 大堂吧', detail:'杭州市下城区武林广场 1 号', contact:'Emma / 15912343381', note:'送至大堂吧', lng:120.1685, lat:30.2748},
    {label:'杭州武林万怡酒店 2108 房', detail:'杭州市拱墅区体育场路 333 号', contact:'Emma / 15912343381', note:'备用地址', lng:120.1620, lat:30.2790},
    {label:'杭州湖滨银泰附近民宿', detail:'杭州市上城区平海路 124 号', contact:'Emma / 15912343381', note:'备用地址，需提前电话', lng:120.1660, lat:30.2500},
    {label:'杭州西子湖四季酒店 2208 房', detail:'杭州市西湖区灵隐路 5 号', contact:'Emma / 15912343381', note:'朋友代收', lng:120.1288, lat:30.2570},
    {label:'杭州城站维也纳 903 房', detail:'杭州市上城区东站西广场 1 号', contact:'Emma / 15912343381', note:'备用地址', lng:120.2130, lat:30.2885}
  ]},
  {id:'T004', userId:'U349045', name:'Kim Min-jun', lang:'韩语', passport:'M12345678', phone:'18612349045', deviceNo:'DEV-2026-0004', city:'杭州', lng:120.1551, lat:30.2741, balance:'258.0', loc:'杭州湖滨银泰 in77',
   diet:'忌海鲜（含虾蟹贝类）', pref:'偏辣；需要湿巾；联系前台转房间',
   addrs:[
    {label:'杭州湖滨大酒店 602 房', detail:'杭州市上城区湖滨路 15 号', contact:'Kim / 18612349045', note:'联系前台', lng:120.1601, lat:30.2503},
    {label:'杭州湖滨大酒店 1F 商务中心', detail:'杭州市上城区湖滨路 15 号', contact:'Kim / 18612349045', note:'送至商务中心', lng:120.1601, lat:30.2503},
    {label:'杭州索菲特西湖大酒店 1203 房', detail:'杭州市上城区西湖大道 333 号', contact:'Kim / 18612349045', note:'备用地址', lng:120.1655, lat:30.2455},
    {label:'杭州西湖国宾馆 8 号楼 201', detail:'杭州市西湖区杨公堤 18 号', contact:'Kim / 18612349045', note:'备用地址', lng:120.1305, lat:30.2385},
    {label:'杭州黄龙饭店 1206 房', detail:'杭州市西湖区曙光路 120 号', contact:'Kim / 18612349045', note:'备用地址', lng:120.1349, lat:30.2686},
    {label:'杭州东站维也纳酒店 508 房', detail:'杭州市上城区东站西广场 1 号', contact:'Kim / 18612349045', note:'返程前住址', lng:120.2130, lat:30.2885}
  ]}
];

/* ---------- 推荐地址 ---------- */
const ADDR_RECOMMENDS = [
  {id:'A001', label:'杭州君悦酒店', detail:'杭州市西湖区湖滨路 28 号', lng:120.1622, lat:30.2490},
  {id:'A002', label:'杭州柏悦酒店', detail:'杭州市西湖区长生路 27 号', lng:120.1640, lat:30.2521},
  {id:'A003', label:'杭州温德姆酒店', detail:'杭州市下城区武林广场 1 号', lng:120.1685, lat:30.2748},
  {id:'A004', label:'杭州湖滨大酒店', detail:'杭州市上城区湖滨路 15 号', lng:120.1601, lat:30.2503},
  {id:'A005', label:'杭州城中香格里拉', detail:'杭州市下城区长寿路 6 号', lng:120.1637, lat:30.2673},
  {id:'A006', label:'杭州西子湖四季酒店', detail:'杭州市西湖区灵隐路 5 号', lng:120.1288, lat:30.2570},
  {id:'A007', label:'杭州黄龙饭店', detail:'杭州市西湖区曙光路 120 号', lng:120.1349, lat:30.2686}
];

/* ---------- 商家 ---------- */
const SHOPS = [
  {id:'S001', name:'外婆家(武林广场店)', brand:'外婆家', cat:'家常菜', logo:{e:'🍲',a:'#fff3e6',b:'#ffd9b3'},
   distance:'1203m', eta:'35分钟', deliveryFee:'配送 约¥3.0', packingFee:2.0, score:4.8, monthlySales:8620, minOrder:30,
   menu:[
     {name:'西湖醋鱼', img:'https://picsum.photos/seed/xihu-cuyu/120/120', spec:'标准份', price:68.00, desc:'西湖名吃，酸甜开胃'},
     {name:'叫花鸡', img:'https://picsum.photos/seed/jiaohuaji/120/120', spec:'整只', price:98.00, desc:'传统名菜，荷香四溢'},
     {name:'东坡肉', img:'https://picsum.photos/seed/dongporou/120/120', spec:'标准份', price:38.00, desc:'肥而不腻，入口即化'},
     {name:'龙井虾仁', img:'https://picsum.photos/seed/longjing-xiaren/120/120', spec:'标准份', price:88.00, desc:'明前龙井，清新淡雅'},
     {name:'宋嫂鱼羹', img:'https://picsum.photos/seed/songsao-yugeng/120/120', spec:'标准份', price:48.00, desc:'鲜嫩滑爽，汤浓味醇'},
     {name:'干炸响铃', img:'https://picsum.photos/seed/ganzha-xiangling/120/120', spec:'标准份', price:28.00, desc:'酥脆可口，豆香浓郁'}
   ]},
  {id:'S002', name:'海底捞火锅(西湖店)', brand:'海底捞', cat:'火锅', logo:{e:'🥘',a:'#ffe6e6',b:'#ffcccc'},
   distance:'856m', eta:'30分钟', deliveryFee:'免配送费', packingFee:3.0, score:4.9, monthlySales:12450, minOrder:50,
   menu:[
     {name:'麻辣火锅锅底', img:'https://picsum.photos/seed/mala-guodi/120/120', spec:'中辣·加麻', price:58.00, desc:'经典川味，麻辣鲜香'},
     {name:'番茄火锅锅底', img:'https://picsum.photos/seed/fanqie-guodi/120/120', spec:'标准', price:52.00, desc:'酸甜开胃，老少皆宜'},
     {name:'澳洲肥牛卷', img:'https://picsum.photos/seed/feiniu-juan/120/120', spec:'200g', price:42.00, desc:'肉质鲜嫩，入口即化'},
     {name:'鲜虾滑', img:'https://picsum.photos/seed/xia-hua/120/120', spec:'150g', price:38.00, desc:'手打虾滑，Q弹鲜美'},
     {name:'毛肚', img:'https://picsum.photos/seed/maodu/120/120', spec:'150g', price:45.00, desc:'七上八下，脆嫩爽口'},
     {name:'酸梅汤', img:'https://picsum.photos/seed/suanmei-tang/120/120', spec:'常规', price:10.00, desc:'解辣神器，酸甜可口'}
   ]},
  {id:'S003', name:'沙县小吃(湖滨店)', brand:'沙县小吃', cat:'小吃快餐', logo:{e:'🍜',a:'#e6f7ff',b:'#b3e0ff'},
   distance:'320m', eta:'20分钟', deliveryFee:'配送 约¥2.0', packingFee:1.0, score:4.5, monthlySales:5680, minOrder:15,
   menu:[
     {name:'蒸饺', img:'https://picsum.photos/seed/zhengjiao/120/120', spec:'常规', price:16.00, desc:'皮薄馅大，鲜香多汁'},
     {name:'拌面', img:'https://picsum.photos/seed/banmian/120/120', spec:'常规', price:12.60, desc:'花生酱香，面条劲道'},
     {name:'云吞', img:'https://picsum.photos/seed/yuntun/120/120', spec:'常规', price:15.00, desc:'汤鲜味美，皮薄馅嫩'},
     {name:'炖汤', img:'https://picsum.photos/seed/dun-tang/120/120', spec:'常规', price:18.00, desc:'营养丰富，滋补养生'},
     {name:'炒粉', img:'https://picsum.photos/seed/chaofen/120/120', spec:'常规', price:14.00, desc:'锅气十足，香而不腻'}
   ]},
  {id:'S004', name:'麦当劳(武林店)', brand:'麦当劳', cat:'汉堡', logo:{e:'🍔',a:'#fff9e6',b:'#ffefb3'},
   distance:'650m', eta:'25分钟', deliveryFee:'配送 约¥4.0', packingFee:1.5, score:4.7, monthlySales:15230, minOrder:20,
   menu:[
     {name:'麦辣鸡腿堡套餐', img:'https://picsum.photos/seed/mailai-jitui/120/120', spec:'中杯可乐', price:38.20, desc:'经典汉堡+薯条+可乐'},
     {name:'巨无霸套餐', img:'https://picsum.photos/seed/juwuba/120/120', spec:'大杯可乐', price:45.00, desc:'双层牛肉，满足之选'},
     {name:'麦香鱼套餐', img:'https://picsum.photos/seed/maixiangyu/120/120', spec:'中杯可乐', price:35.00, desc:'深海鳕鱼，鲜香美味'},
     {name:'开心乐园餐', img:'https://picsum.photos/seed/leyuancan/120/120', spec:'玩具款', price:32.00, desc:'儿童首选，营养搭配'}
   ]},
  {id:'S005', name:'星巴克(西湖天地)', brand:'星巴克', cat:'咖啡', logo:{e:'☕',a:'#f0e6ff',b:'#d9b3ff'},
   distance:'480m', eta:'15分钟', deliveryFee:'配送 约¥3.0', packingFee:0.5, score:4.8, monthlySales:8920, minOrder:25,
   menu:[
     {name:'燕麦拿铁', img:'https://picsum.photos/seed/yanmai-latte/120/120', spec:'大杯·热', price:29.10, desc:'燕麦奶香，丝滑醇厚'},
     {name:'美式咖啡', img:'https://picsum.photos/seed/meishi-kafei/120/120', spec:'大杯·热', price:25.00, desc:'经典黑咖，提神醒脑'},
     {name:'星冰乐', img:'https://picsum.photos/seed/xingbingle/120/120', spec:'大杯·冰', price:32.00, desc:'冰爽夏日，甜蜜享受'},
     {name:'抹茶拿铁', img:'https://picsum.photos/seed/mocha-latte/120/120', spec:'大杯·热', price:30.00, desc:'日式抹茶，清新回甘'}
   ]},
  {id:'S006', name:'肯德基(湖滨店)', brand:'肯德基', cat:'汉堡', logo:{e:'🍗',a:'#ffe6f0',b:'#ffb3d9'},
   distance:'720m', eta:'22分钟', deliveryFee:'配送 约¥4.0', packingFee:1.5, score:4.6, monthlySales:11340, minOrder:25,
   menu:[
     {name:'劲脆鸡腿堡', img:'https://picsum.photos/seed/jincui-jitui/120/120', spec:'常规', price:25.50, desc:'外脆里嫩，经典美味'},
     {name:'香辣鸡腿堡', img:'https://picsum.photos/seed/xiangla-jitui/120/120', spec:'常规', price:28.00, desc:'香辣过瘾，回味无穷'},
     {name:'原味鸡', img:'https://picsum.photos/seed/yuanwei-ji/120/120', spec:'2块', price:32.00, desc:'秘制的香脆，经典原味'},
     {name:'蛋挞', img:'https://picsum.photos/seed/danta/120/120', spec:'2只', price:15.00, desc:'酥脆外皮，嫩滑内馅'}
   ]},
  {id:'S007', name:'瑞幸咖啡(湖滨银泰店)', brand:'瑞幸咖啡', cat:'咖啡', logo:{e:'🥤',a:'#e6fff2',b:'#b3ffd9'},
   distance:'380m', eta:'12分钟', deliveryFee:'免配送费', packingFee:0.5, score:4.7, monthlySales:18760, minOrder:15,
   menu:[
     {name:'生椰拿铁', img:'https://picsum.photos/seed/shengye-latte/120/120', spec:'大杯·冰', price:18.00, desc:'椰香浓郁，咖啡醇厚'},
     {name:'厚乳拿铁', img:'https://picsum.photos/seed/houru-latte/120/120', spec:'大杯·热', price:16.00, desc:'奶香四溢，口感丝滑'},
     {name:'美式咖啡', img:'https://picsum.photos/seed/luckin-meishi/120/120', spec:'大杯·热', price:13.00, desc:'经典黑咖，提神必备'},
     {name:'陨石拿铁', img:'https://picsum.photos/seed/yunshi-latte/120/120', spec:'大杯·冰', price:19.00, desc:'黑糖珍珠，Q弹有嚼劲'}
   ]}
];

/* ---------- 打车点位 ---------- */
const TX_PLACES = {
  '西湖景区':          ['西湖景区', 'West Lake Scenic Area',            120.1332, 30.2466],
  '西湖断桥':          ['西湖断桥', 'West Lake Broken Bridge',           120.1517, 30.2593],
  '西湖音乐喷泉':      ['西湖音乐喷泉', 'West Lake Music Fountain',       120.1524, 30.2504],
  '西湖游船码头':      ['西湖游船码头', 'West Lake Cruise Pier · Hubin',  120.1566, 30.2466],
  '西湖三潭印月':      ['西湖三潭印月', 'Three Pools Mirroring the Moon', 120.1445, 30.2405],
  '西湖雷峰塔':        ['西湖雷峰塔', 'Leifeng Pagoda',                   120.1493, 30.2308],
  '西湖苏堤春晓':      ['西湖苏堤春晓', 'Su Causeway in Spring',          120.1352, 30.2455],
  '灵隐寺':            ['灵隐寺', 'Lingyin Temple',                      120.1021, 30.2408],
  '杭州东站':          ['杭州东站到达层', 'Hangzhou East Railway Station · Arrivals', 120.2126, 30.2907],
  '萧山国际机场':      ['萧山国际机场 T4 航站楼', 'Xiaoshan Intl Airport · Terminal 4', 120.4341, 30.2361],
  '杭州君悦酒店':      ['杭州君悦酒店', 'Grand Hyatt Hangzhou',          120.1612, 30.2490],
  '杭州柏悦酒店':      ['杭州柏悦酒店', 'Park Hyatt Hangzhou',           120.1710, 30.2462],
  '西子湖四季酒店':    ['杭州西子湖四季酒店正门', 'Four Seasons Hotel Hangzhou', 120.1271, 30.2477],
  '河坊街':            ['河坊街历史街区', 'Hefang Street Historic Block', 120.1712, 30.2372],
  '武林广场':          ['武林广场', 'Wulin Square',                      120.1668, 30.2782],
  '西溪湿地':          ['西溪国家湿地公园', 'Xixi National Wetland Park', 120.0608, 30.2692],
  '城站火车站':        ['杭州城站火车站', 'Hangzhou Railway Station',    120.1802, 30.2436],
  '湖滨银泰':          ['湖滨银泰 in77', 'Intime in77 · Hubin',          120.1663, 30.2508],
  '西湖文化广场':      ['西湖文化广场', 'West Lake Cultural Square',      120.1659, 30.2848],
  '外滩':              ['外滩', 'The Bund',                              121.4900, 31.2397],
  '虹桥火车站':        ['上海虹桥站', 'Shanghai Hongqiao Railway Station', 121.3194, 31.1943],
  '浦东国际机场':      ['浦东国际机场 T2', 'Pudong Intl Airport · T2',    121.8086, 31.1434],
  '南京路步行街':      ['南京路步行街', 'Nanjing Road Pedestrian Street', 121.4790, 31.2340],
  '上海环球金融中心':  ['上海环球金融中心', 'Shanghai World Financial Center', 121.5050, 31.2345],
  '静安寺':            ['静安寺', 'Jing an Temple',                      121.4450, 31.2230],
  '陆家嘴':            ['陆家嘴环路', 'Lujiazui Ring Road',              121.5030, 31.2380]
};

/* ---------- 打车司机库 ---------- */
const TX_DRIVERS = [
  {name:'王建国', virtualPhone:'17012343821', plate:'浙A·1D2F3', model:'吉利帝豪EV',   color:'白色', score:'4.98', trips:'3241', eta:3},
  {name:'李国强', virtualPhone:'17012344476', plate:'浙A·7K9M2', model:'几何A Pro',    color:'银灰', score:'4.95', trips:'2716', eta:5},
  {name:'张伟民', virtualPhone:'17012345182', model:'曹操60',      plate:'浙A·3F8H1', color:'蓝色', score:'4.91', trips:'1984', eta:2},
  {name:'陈建华', virtualPhone:'17012346093', plate:'沪A·5N2Q7', model:'极氪001',      color:'黑色', score:'4.99', trips:'4102', eta:6},
  {name:'刘志远', virtualPhone:'17012347345', plate:'浙A·9B4C6', model:'吉利几何G6',   color:'白色', score:'4.88', trips:'1533', eta:4},
  {name:'赵海涛', virtualPhone:'17012348261', plate:'浙A·2W6E8', model:'威马E.5',      color:'灰色', score:'4.93', trips:'2207', eta:3}
];

/* ---------- 打车订单事件流水模板 ---------- */
const TX_EVENT_SEQ = {
  1:  [['14','下单成功']],
  9:  [['14','下单成功'],['1','司机接单']],
  12: [['14','下单成功'],['1','司机接单'],['3','司机已到达']],
  3:  [['14','下单成功'],['1','司机接单'],['3','司机已到达'],['4','司机开始计费']],
  8:  [['14','下单成功'],['1','司机接单'],['3','司机已到达'],['4','司机开始计费'],['5','司机结束计费']],
  5:  [['14','下单成功'],['1','司机接单'],['3','司机已到达'],['4','司机开始计费'],['5','司机结束计费'],['6','司机输入额外费用，结束服务']],
  7:  [['14','下单成功'],['1','司机接单'],['3','司机已到达'],['4','司机开始计费'],['5','司机结束计费'],['6','司机输入额外费用，结束服务'],['11','用户支付']],
  4:  [['14','下单成功'],['22','系统取消（120s 无司机接单）']],
  10: [['14','下单成功'],['1','司机接单'],['21','用户取消（需付取消费）']],
  13: [['14','下单成功'],['1','司机接单'],['21','用户取消（需付取消费）'],['44','用户支付取消费']],
  14: [['14','下单成功'],['1','司机接单'],['21','用户取消（需付取消费）'],['44','用户支付取消费'],['45','客服免责取消费']],
  20: [['14','下单成功'],['21','用户取消（免费取消时长内）']],
  21: [['14','下单成功'],['20','曹操客服取消']],
  26: [['14','下单成功'],['1','司机接单'],['26','司机取消（免费取消）']]
};

/* ---------- 打车订单种子数据 ---------- */
const TX_SEED = [
  {id:'CC20261014091001', pu:'杭州君悦酒店', dst:'萧山国际机场', cno:'1140671095002201', cao:1,  s:'未派单',   tenant:'杭州趣游科技', name:'James Miller',  lang:'英语', passport:'US8812001', phone:'13901120001', dev:'DEV-2026-0101', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-14 09:10:01', est:[38.0,3.8],  bill:null,        fee:0,    bal:412.5, driver:-1},
  {id:'CC20261014091802', pu:'西子湖四季酒店', dst:'杭州东站', cno:'1140671095002202', cao:9,  s:'开始服务',   tenant:'杭州趣游科技', name:'Sofia Rossi',   lang:'意大利语', passport:'IT4451202', phone:'13901120002', dev:'DEV-2026-0102', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-14 09:18:02', est:[46.0,4.6],  bill:null,        fee:0,    bal:298.0, driver:0},
  {id:'CC20261014090303', pu:'杭州柏悦酒店', dst:'灵隐寺', cno:'1140671095002203', cao:12, s:'司机已到达',   tenant:'浙江文投数媒', name:'Hans Weber',    lang:'德语', passport:'DE2231003', phone:'13901120003', dev:'DEV-2026-0103', src:'AI对话',      car:'商务型', city:'杭州', cc:'0571', tm:'2026-10-14 09:03:03', est:[88.0,8.8],  bill:null,        fee:8.8,   bal:560.4, driver:1},
  {id:'CC20261014084604', pu:'灵隐寺', dst:'西湖景区', cno:'1140671095002204', cao:3,  s:'乘客上车·计费开始',   tenant:'杭州趣游科技', name:'Emma Wilson',   lang:'英语', passport:'GB7765404', phone:'13901120004', dev:'DEV-2026-0104', src:'客服代下单',  car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-14 08:46:04', est:[52.0,5.2],  bill:null,        fee:0,    bal:186.2, driver:2, cs:{name:'张敏',account:'13900139032'}},
  {id:'CC20261014092905', pu:'外滩', dst:'浦东国际机场', cno:'1140671095002205', cao:9,  s:'开始服务',   tenant:'上海入境通',   name:'佐藤健太',      lang:'日语', passport:'JP3312005', phone:'13901120005', dev:'DEV-2026-0105', src:'客服代下单',  car:'豪华型', city:'上海', cc:'021',  tm:'2026-10-14 09:29:05', est:[132.0,13.2],bill:null,        fee:0,    bal:704.8, driver:3, cs:{name:'王芳',account:'13700137021'}},
  {id:'CC20261014093306', pu:'武林广场', dst:'西湖景区', cno:'1140671095002206', cao:12, s:'司机已到达',   tenant:'杭州趣游科技', name:'Lucas Martin',  lang:'法语', passport:'FR9901206', phone:'13901120006', dev:'DEV-2026-0106', src:'AI对话',      car:'新能源', city:'杭州', cc:'0571', tm:'2026-10-14 09:33:06', est:[29.0,2.9],  bill:null,        fee:0,    bal:97.4,  driver:4},
  {id:'CC20261014082007', pu:'河坊街', dst:'杭州东站', cno:'1140671095002207', cao:5,  s:'订单待支付',   tenant:'杭州趣游科技', name:'Anna Schmidt',  lang:'德语', passport:'DE1122007', phone:'13901120007', dev:'DEV-2026-0107', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-14 08:20:07', est:[44.0,4.4],  bill:[47.0,4.7],  fee:0,    bal:233.9, driver:2},
  {id:'CC20261014075508', pu:'西湖文化广场', dst:'城站火车站', cno:'1140671095002208', cao:8,  s:'行程结束·计费结束',   tenant:'浙江文投数媒', name:'Kim Min-jun',   lang:'韩语', passport:'KR5567008', phone:'13901120008', dev:'DEV-2026-0108', src:'AI对话',      car:'优选', city:'杭州', cc:'0571', tm:'2026-10-14 07:55:08', est:[36.0,3.6],  bill:[36.0,3.6],  fee:0,    bal:150.0, driver:5},
  {id:'CC20261014073809', pu:'西湖景区', dst:'萧山国际机场', cno:'1140671095002209', cao:7,  s:'订单已支付',   tenant:'杭州趣游科技', name:'John Smith',    lang:'英语', passport:'US6642009', phone:'13901120009', dev:'DEV-2026-0109', src:'AI对话',      car:'豪华型', city:'杭州', cc:'0571', tm:'2026-10-14 07:38:09', est:[126.0,12.6],bill:[118.0,11.8],fee:0,    bal:389.6, driver:1},
  {id:'CC20261013210510', pu:'杭州柏悦酒店', dst:'萧山国际机场', cno:'1140671095002210', cao:7,  s:'订单已支付',   tenant:'浙江文投数媒', name:'Maria Garcia',  lang:'西班牙语', passport:'ES7788010', phone:'13901120010', dev:'DEV-2026-0110', src:'客服代下单',  car:'商务型', city:'杭州', cc:'0571', tm:'2026-10-13 21:05:10', est:[96.0,9.6],  bill:[108.0,10.8],fee:0,    bal:64.3,  driver:0, debt:11.2, cs:{name:'李娜',account:'13800138018'}},
  {id:'CC20261013184211', pu:'南京路步行街', dst:'静安寺', cno:'1140671095002211', cao:7,  s:'订单已支付',   tenant:'上海入境通',   name:'Pierre Dubois', lang:'法语', passport:'FR2233011', phone:'13901120011', dev:'DEV-2026-0111', src:'AI对话',      car:'舒适型', city:'上海', cc:'021',  tm:'2026-10-13 18:42:11', est:[61.0,6.1],  bill:[61.0,6.1],  fee:0,    bal:275.8, driver:3},
  {id:'CC20261013163012', pu:'杭州东站', dst:'西湖景区', cno:'1140671095002212', cao:4,  s:'订单系统取消',   tenant:'杭州趣游科技', name:'Olga Petrova',  lang:'俄语', passport:'RU4455012', phone:'13901120012', dev:'DEV-2026-0112', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-13 16:30:12', est:[42.0,4.2],  bill:null,        fee:0,    bal:318.0, driver:-1, cancel:'无车接单：120s 内附近无司机接单，订单被曹操系统撤销'},
  {id:'CC20261013154513', pu:'湖滨银泰', dst:'西溪湿地', cno:'1140671095002213', cao:10, s:'订单取消·待付款',   tenant:'浙江文投数媒', name:'David Chen',    lang:'英语', passport:'CA8877013', phone:'13901120013', dev:'DEV-2026-0113', src:'AI对话',      car:'优选', city:'杭州', cc:'0571', tm:'2026-10-13 15:45:13', est:[33.0,3.3],  bill:null,        fee:8.0,  bal:204.6, driver:5, cancel:'用户取消（已过免费取消时长，需支付取消费 8.0 积分）'},
  {id:'CC20261013150214', pu:'城站火车站', dst:'灵隐寺', cno:'1140671095002214', cao:13, s:'订单取消·已支付',   tenant:'杭州趣游科技', name:'Elena Novak',   lang:'捷克语', passport:'CZ1144014', phone:'13901120014', dev:'DEV-2026-0114', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-13 15:02:14', est:[39.0,3.9],  bill:null,        fee:9.0,  bal:266.1, driver:2, cancel:'用户取消，取消费 9.0 积分已支付'},
  {id:'CC20261013142815', pu:'陆家嘴', dst:'虹桥火车站', cno:'1140671095002215', cao:14, s:'订单取消已免责取消费',   tenant:'上海入境通',   name:'Thomas Müller', lang:'德语', passport:'DE5533015', phone:'13901120015', dev:'DEV-2026-0115', src:'客服代下单',  car:'新能源', city:'上海', cc:'021',  tm:'2026-10-13 14:28:15', est:[26.0,2.6],  bill:null,        fee:0,    bal:501.2, driver:4, cancel:'客服免责：司机长时间未到达，客服申请免除取消费', cs:{name:'王芳',account:'13700137021'}},
  {id:'CC20261013135016', pu:'西湖景区', dst:'河坊街', cno:'1140671095002216', cao:20, s:'用户取消',   tenant:'杭州趣游科技', name:'Yuki Tanaka',   lang:'日语', passport:'JP6677016', phone:'13901120016', dev:'DEV-2026-0116', src:'AI对话',      car:'优选', city:'杭州', cc:'0571', tm:'2026-10-13 13:50:16', est:[31.0,3.1],  bill:null,        fee:0,    bal:412.9, driver:5, cancel:'用户取消（免费取消时长内，无取消费）'},
  {id:'CC20261013125517', pu:'西溪湿地', dst:'武林广场', cno:'1140671095002217', cao:20, s:'用户取消',   tenant:'浙江文投数媒', name:'Marco Bianchi', lang:'意大利语', passport:'IT2233017', phone:'13901120017', dev:'DEV-2026-0117', src:'客服代下单',  car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-13 12:55:17', est:[37.0,3.7],  bill:null,        fee:0,    bal:158.7, driver:1, cancel:'客服协助老外取消（按乘客原因码提交）', cs:{name:'李娜',account:'13800138018'}},
  {id:'CC20261013114018', pu:'杭州君悦酒店', dst:'杭州东站', cno:'1140671095002218', cao:21, s:'曹操客服取消',   tenant:'杭州趣游科技', name:'Sarah Johnson', lang:'英语', passport:'US3344018', phone:'13901120018', dev:'DEV-2026-0118', src:'AI对话',      car:'豪华型', city:'杭州', cc:'0571', tm:'2026-10-13 11:40:18', est:[124.0,12.4],bill:null,        fee:0,    bal:620.5, driver:3, cancel:'客服取消：司机车辆故障无法到场，曹操客服侧发起取消'},
  {id:'CC20261013101519', pu:'上海环球金融中心', dst:'浦东国际机场', cno:'1140671095002219', cao:26, s:'司机取消',   tenant:'上海入境通',   name:'Ahmed Hassan',  lang:'阿拉伯语', passport:'EG1122019', phone:'13901120019', dev:'DEV-2026-0119', src:'AI对话',      car:'商务型', city:'上海', cc:'021',  tm:'2026-10-13 10:15:19', est:[92.0,9.2],  bill:null,        fee:0,    bal:377.3, driver:0, cancel:'司机取消（司机到达后超最大等待时间，免费取消）'},
  {id:'CC20261013094820', pu:'西湖景区', dst:'湖滨银泰', cno:'1140671095002220', cao:7,  s:'订单已支付',   tenant:'杭州趣游科技', name:'Nina Kowalski', lang:'波兰语', passport:'PL9988020', phone:'13901120020', dev:'DEV-2026-0120', src:'AI对话',      car:'舒适型', city:'杭州', cc:'0571', tm:'2026-10-13 09:48:20', est:[28.0,2.8],  bill:[28.0,2.8],  fee:0,    bal:145.0, driver:4}
];

/* ---------- 打车常用函数 ---------- */
function txPlace(name){
  const p = TX_PLACES[name] || [name, name, 0, 0];
  return {zh: p[0], en: p[1], lng: p[2], lat: p[3]};
}

function txAddMin(tm, min){
  const d = new Date(tm.replace(/-/g,'/'));
  d.setMinutes(d.getMinutes() + min);
  const p = n => (n<10?'0':'') + n;
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
}

function txBuildStreams(o){
  const s = o.tCaoStatus;
  o.tEvents = (TX_EVENT_SEQ[s] || []).map((e, i) => ({tm: txAddMin(o.tCreated, i), code: e[0], label: e[1]}));
  const L = [];
  const push = (min, type, amount, note) => L.push({tm: txAddMin(o.tCreated, min), type, amount: Number(amount.toFixed(1)), note, operator:'系统'});
  push(1, '冻结', o.tFrozen, '按所选车型最高报价冻结（曹操预估价 ' + o.tEst.cao.toFixed(1) + ' + 平台服务费 ' + o.tEst.svc.toFixed(1) + '）');
  if(s === 4)             push(3, '解冻', o.tFrozen, '120s 内无司机接单，订单被曹操系统撤销，冻结积分全额解冻');
  else if(s === 20 || s === 26) push(3, '解冻', o.tFrozen, '免费取消，冻结积分全额解冻');
  else if(s === 14)       push(3, '解冻', o.tFrozen, '客服免责（取消费已退回），冻结积分全额解冻');
  else if(s === 10)       push(3, '待扣', o.tCancelFee, '已产生取消费，待老外支付后实扣（当前冻结仍挂账）');
  else if(s === 13) { push(4, '实扣', o.tCancelFee, '扣除取消费'); push(4, '解冻', o.tFrozen - o.tCancelFee, '解冻剩余冻结积分'); }
  else if([5,8,7].indexOf(s) >= 0){
    const act = o.tBill ? o.tBill.cao + o.tBill.svc : o.tEst.cao + o.tEst.svc;
    const b = o.tBill || o.tEst;
    push(30, '实扣', Math.min(act, o.tFrozen), '按曹操实际账单实扣（曹操 ' + b.cao.toFixed(1) + ' + 服务费 ' + b.svc.toFixed(1) + '）');
    if(act < o.tFrozen)      push(31, '解冻', o.tFrozen - act, '实扣 < 冻结，多冻结的差额立即解冻');
    else if(act > o.tFrozen) push(31, '挂欠账', act - o.tFrozen, '实扣 > 冻结，超出部分挂欠账（下次充值抵扣）');
    if(s === 7) push(32, '确认费用', 0, '调用「2.12 确认费用」完成订单（曹操侧从企业余额扣款）');
  }
  o.tPointLogs = L;
  const ops = [{tm: o.tCreated, operator:'系统', action:'创建打车订单，调用「2.7 多车型下单叫车」（多车型同时呼叫）'}];
  if(o.src === '客服代下单') ops.unshift({tm: txAddMin(o.tCreated,-6), operator:'客服 李娜 13800138018', action:'客服代下单：选好上车点与目的地，推送整单给老外确认后提交'});
  if([4,10,13,14,20,21,26].indexOf(s) >= 0){
    const who = s === 21 ? '客服' : (s === 26 ? '司机' : (s === 4 ? '曹操系统' : (s === 20 ? '老外' : '客服')));
    ops.push({tm: txAddMin(o.tCreated, 3), operator: who, action:'取消订单：' + (o.cancel || '')});
    if(o.tCancelFee > 0) ops.push({tm: txAddMin(o.tCreated, 4), operator:'系统', action:'取消费 ' + o.tCancelFee.toFixed(1) + ' 积分已计入本单'});
  }
  if(s === 7) ops.push({tm: txAddMin(o.tCreated, 33), operator:'系统', action:'「2.12 确认费用」已确认，曹操侧完成扣款'});
  o.tLogs = ops;
}

/* ---------- 打车订单构建 ---------- */
const TAXI_ORDERS = {};
TX_SEED.forEach(s => {
  const driver = s.driver >= 0 ? TX_DRIVERS[s.driver] : null;
  const o = {
    id: s.id, biz: '打车', tenant: s.tenant, name: s.name, lang: s.lang,
    passport: s.passport, phone: s.phone, deviceNo: s.dev, status: s.s,
    merchant: '曹操出行 · ' + s.car,
    money: {goods: s.est[0], delivery: 0, service: s.est[1], total: Number((s.est[0] + s.est[1]).toFixed(1))},
    balance: String(s.bal), compensations: [],
    tCaoNo: s.cno, tCaoStatus: s.cao, tSource: s.src, tCarType: s.car,
    tCity: s.city, tCityCode: s.cc, tCreated: s.tm, tPushed: true,
    tPickup: txPlace(s.pu), tDest: txPlace(s.dst),
    summary: txPlace(s.pu).zh + ' → ' + txPlace(s.dst).zh,
    tDriver: driver,
    tEst: {cao: s.est[0], svc: s.est[1]},
    tBill: s.bill ? {cao: s.bill[0], svc: s.bill[1]} : null,
    tCancelFee: s.fee || 0,
    tFrozen: Number((s.est[0] + s.est[1]).toFixed(1)),
    tDeducted: 0, tReleased: 0, tDebt: s.debt || 0,
    tCancelPending: false, tCancelMsg: null,
    tDestPending: false, tDestProposal: null, tDestMsg: null, tDestPendingAt: null,
    src: s.src, tCancelReason: s.cancel || '',
    cs: s.cs || null
  };
  if(s.bill){
    const act = s.bill[0] + s.bill[1];
    o.tDeducted = Math.min(act, o.tFrozen);
    o.tReleased = Math.max(0, o.tFrozen - act);
    o.tDebt = Math.max(0, act - o.tFrozen);
  }
  txBuildStreams(o);
  TAXI_ORDERS[o.id] = o;
});

/* ---------- 打车代下单老外 ---------- */
const TX_TOURISTS = [
  {id:'TX001', name:'James Miller',  lang:'英语',     passport:'US8812001', phone:'13901120001', deviceNo:'DEV-2026-0101', city:'杭州', lng:120.1612, lat:30.2490, balance:'412.5', favCar:'舒适型'},
  {id:'TX002', name:'Sofia Rossi',   lang:'意大利语', passport:'IT4451202', phone:'13901120002', deviceNo:'DEV-2026-0102', city:'杭州', lng:120.1271, lat:30.2477, balance:'298.0', favCar:'豪华型'},
  {id:'TX003', name:'Hans Weber',    lang:'德语',     passport:'DE2231003', phone:'13901120003', deviceNo:'DEV-2026-0103', city:'杭州', lng:120.1710, lat:30.2462, balance:'560.4', favCar:'礼帽专车'},
  {id:'TX004', name:'Emma Wilson',   lang:'英语',     passport:'GB7765404', phone:'13901120004', deviceNo:'DEV-2026-0104', city:'杭州', lng:120.1021, lat:30.2408, balance:'186.2', favCar:'舒适型'},
  {id:'TX005', name:'佐藤健太',      lang:'日语',     passport:'JP3312005', phone:'13901120005', deviceNo:'DEV-2026-0105', city:'上海', lng:121.4900, lat:31.2397, balance:'704.8', favCar:'豪华型'}
];

const TX_CITY_CARS = { '杭州':'0571', '上海':'021' };
const TX_CAR_FLAGFALL = {'舒适型':10,'新能源':9,'优选':11,'商务型':14,'豪华型':18,'礼帽专车':16};
const TX_CAR_RATE = {'舒适型':2.3,'新能源':2.1,'优选':2.6,'商务型':3.2,'豪华型':4.5,'礼帽专车':3.8};
const TX_DEFAULT_CARS = ['舒适型','豪华型','礼帽专车'];
const TX_CAR_SEATS = {'舒适型':'1-4 人','豪华型':'1-4 人','礼帽专车':'1-7 人'};

/* ---------- 打车 POI 子点位 ---------- */
const TX_POI_CHILDREN = {
  '杭州': ['西湖景区','灵隐寺','杭州东站','萧山国际机场','河坊街','武林广场','西溪湿地','城站火车站','湖滨银泰','杭州君悦酒店','杭州柏悦酒店'],
  '上海': ['外滩','虹桥火车站','浦东国际机场','南京路步行街','上海环球金融中心','静安寺','陆家嘴']
};

/* ---------- 通用工具 ---------- */
function maskPhone(txt){
  return String(txt || '').replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2');
}
function maskPassport(txt){
  const s = String(txt || '');
  if(s.length <= 4) return s;
  return s[0] + '****' + s.slice(-4);
}
function userIdOf(t){
  return 'U' + String(t.phone || '').slice(-6);
}
function fmtMoney(n){
  return '¥' + Number(n || 0).toFixed(2);
}
function fmtPoints(n){
  return Number(n || 0).toFixed(1) + ' 积分';
}
function escHtml(s){
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function nowStr(){
  const d = new Date();
  const p = n => (n<10?'0':'') + n;
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
}
