/**
* @author laowang.x
*/
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  
const fetch = require('node-fetch'); 
const { TextDecoder, TextEncoder } = require('util');
const rpc = new JsonRpc('https://eospush.tokenpocket.pro', { fetch }); 
const signatureProvider = new JsSignatureProvider(["这里填私钥"]);
const api = new Api({ rpc, signatureProvider , textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
let accounts =["这里填 eos account"];

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

let dig = 100;//倍数

(async () =>{

	var balanceArr = [];
	while(true){
		try {
			var balance = await rpc.get_currency_balance("eidosonecoin","eidosonecoin","EIDOS");
			balance = parseInt(balance[0].split(" ")[0]);
			if(balanceArr.length >= 50){
				balanceArr.shift();
			}
			balanceArr.push(parseInt(balance));
			var sum = balanceArr.reduce((a,b)=>(a +b));	
			var max = balanceArr.reduce((a,b)=>((a> b)?a:b));	
			var average = Math.ceil(sum/balanceArr.length);
		} catch (e) {
//			console.log(e);
			var balance = 0;
			continue;
		}
		var axis = ((average+20)<(max-70))?(max-70):(average+20);
		if(balance > axis){
			console.log("length:"+balanceArr.length+";average:"+average+";max:"+max+";now:"+balance+";axis:"+axis);
			//length 采样数组长度  average 平均值 max 最大值 now当前值  axis 高于此值即挖
			var account = accounts.shift();
			accounts.push(account);
			try {
				var myactions = [];
				var myaction =  {
					account: 'eosio.token',
					 name: 'transfer',
					 authorization: [{
					       actor: account,
					       permission: 'active',
					 }],
					data: {
						      "from": account,
						      "to": "eidosonecoin",
						      "quantity": "0.0001 EOS",
						      "memo": ""
					      },
				};
				for(var i =0; i<dig; i++){
					myactions.push(myaction)
				}

				const result = await api.transact({
					actions: myactions
				}, {
					blocksBehind: 3,
					expireSeconds: 10,
				});
//				console.log(result);
			} catch (e) {
//				console.log(e);
				continue;
			}
		}

         if(balance<axis){
			await sleep(1000);
		}

	}
})();

