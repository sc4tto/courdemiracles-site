(() => {
  'use strict';

  const TRANSFER_TOPIC='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const TRANSFER_SINGLE_TOPIC='0xc3d58168c5bfaa5db26e4ab3bc87d0ee1efb7b6cfcac74441ca4a6f9a8ad2d6';
  const ZERO_TOPIC=`0x${'0'.repeat(64)}`;
  const CHAIN_IDS=Object.freeze({
    ethereum:'0x1',
    base:'0x2105'
  });

  let csrfToken='';
  let authenticatedAddress='';
  let authenticationExpiresAt=0;

  class ServiceError extends Error {
    constructor(code,message,{status=0,cause}={}){
      super(message,{cause});
      this.name='PixelSheetOpenSeaError';
      this.code=code;
      this.status=status;
    }
  }

  function configuredApiBase(){
    const meta=document.querySelector('meta[name="pixel-nft-api-base"]')?.content?.trim();
    const sameOriginPreview=window.location?.hostname?.endsWith('.vercel.app')
      || ['localhost','127.0.0.1'].includes(window.location?.hostname);
    const fallback=sameOriginPreview?window.location.origin:'';
    const raw=(window.PIXEL_SHEET_NFT_API_BASE||meta||fallback||'').replace(/\/+$/,'');
    if(!raw)return '';
    let url;
    try{url=new URL(raw);}catch(error){throw new ServiceError('CONFIG_INVALID','L’indirizzo del servizio NFT non è valido.',{cause:error});}
    const local=['localhost','127.0.0.1'].includes(url.hostname);
    if(url.origin!==raw||(!local&&url.protocol!=='https:')){
      throw new ServiceError('CONFIG_INVALID','Il servizio NFT deve usare un’origine HTTPS senza percorsi aggiuntivi.');
    }
    return url.origin;
  }

  function provider(){
    if(!window.ethereum?.request){
      throw new ServiceError('WALLET_UNAVAILABLE','Nessun wallet Ethereum compatibile è disponibile in questo browser.');
    }
    return window.ethereum;
  }

  function normalizeAddress(value,label='wallet'){
    if(typeof value!=='string'||!/^0x[0-9a-fA-F]{40}$/.test(value)){
      throw new ServiceError('WALLET_INVALID',`${label} non è un indirizzo EVM valido.`);
    }
    return value.toLowerCase();
  }

  function sameAddress(left,right){
    return normalizeAddress(left)===normalizeAddress(right);
  }

  function safeMessage(error,fallback){
    if(error?.code===4001||error?.code==='ACTION_REJECTED')return 'Operazione annullata nel wallet.';
    return error?.message||fallback;
  }

  async function readJson(response){
    const text=await response.text();
    if(!text)return {};
    try{return JSON.parse(text);}catch(error){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','Il servizio ha restituito una risposta non valida.',{status:response.status,cause:error});
    }
  }

  async function api(path,{method='GET',body,authenticated=false}={}){
    const base=configuredApiBase();
    if(!base)throw new ServiceError('NOT_CONFIGURED','Il collegamento protetto a OpenSea non è ancora configurato.');
    const headers={Accept:'application/json'};
    if(body!==undefined)headers['Content-Type']='application/json';
    if(authenticated){
      if(!csrfToken)throw new ServiceError('AUTH_REQUIRED','Ricollega il wallet per autorizzare questa operazione.');
      headers['X-CSRF-Token']=csrfToken;
    }
    let response;
    try{
      response=await fetch(`${base}${path}`,{
        method,
        headers,
        body:body===undefined?undefined:JSON.stringify(body),
        credentials:'include',
        cache:'no-store',
        referrerPolicy:'no-referrer'
      });
    }catch(error){
      throw new ServiceError('SERVICE_UNREACHABLE','Il servizio protetto non è raggiungibile.',{cause:error});
    }
    const payload=await readJson(response);
    if(!response.ok){
      const remote=payload?.error||{};
      if(response.status===401||remote.code==='SESSION_REQUIRED')resetAuthentication();
      const upstreamStatus=remote?.details?.upstreamStatus;
      const diagnostic=Number.isInteger(upstreamStatus)?` [${path}: OpenSea HTTP ${upstreamStatus}]`:'';
      throw new ServiceError(remote.code||'SERVICE_ERROR',`${remote.message||`Richiesta non riuscita (${response.status}).`}${diagnostic}`,{status:response.status});
    }
    return payload;
  }

  function resetAuthentication(){
    csrfToken='';
    authenticatedAddress='';
    authenticationExpiresAt=0;
  }

  async function walletAccounts(){
    const accounts=await provider().request({method:'eth_accounts'});
    return Array.isArray(accounts)?accounts:[];
  }

  async function assertCurrentWallet(address){
    const accounts=await walletAccounts();
    if(!accounts[0]||!sameAddress(accounts[0],address)){
      resetAuthentication();
      throw new ServiceError('WALLET_CHANGED','L’account attivo nel wallet è cambiato. Ricollegalo e prepara nuovamente la NFT.');
    }
    return accounts[0];
  }

  async function signChallenge(message,address){
    try{
      return await provider().request({method:'personal_sign',params:[message,address]});
    }catch(error){
      throw new ServiceError('SIGNATURE_REJECTED',safeMessage(error,'Impossibile verificare il wallet.'),{cause:error});
    }
  }

  async function authenticate(address){
    const normalized=normalizeAddress(address);
    await assertCurrentWallet(address);
    if(csrfToken&&authenticatedAddress===normalized&&authenticationExpiresAt>Date.now()+30_000){
      return;
    }
    resetAuthentication();
    const challenge=await api('/api/auth/challenge',{method:'POST',body:{address}});
    if(typeof challenge.message!=='string'||!challenge.message){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','Il servizio non ha restituito la richiesta di verifica del wallet.');
    }
    const signature=await signChallenge(challenge.message,address);
    const verified=await api('/api/auth/verify',{
      method:'POST',
      body:{address,message:challenge.message,signature}
    });
    if(!sameAddress(verified.address,address)||typeof verified.csrfToken!=='string'||!verified.csrfToken){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','La verifica del wallet non ha restituito una sessione valida.');
    }
    csrfToken=verified.csrfToken;
    authenticatedAddress=normalized;
    const expiry=typeof verified.expiresAt==='number'
      ? verified.expiresAt
      : Date.parse(verified.expiresAt||'');
    authenticationExpiresAt=Number.isFinite(expiry)?expiry:Date.now()+5*60_000;
  }

  function outputFilename(sourceName){
    const base=String(sourceName||'pixel-sheet')
      .replace(/\.[^.]+$/,'')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'')
      .slice(0,60)||'pixel-sheet';
    return `${base}-${Date.now()}.png`;
  }

  function validateUploadContext(value){
    if(!value||typeof value!=='object'||Array.isArray(value)){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','OpenSea non ha restituito un contesto di caricamento valido.');
    }
    let url;
    try{url=new URL(value.url);}catch{
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','OpenSea ha restituito un indirizzo di caricamento non valido.');
    }
    if(url.protocol!=='https:'||!['POST','PUT'].includes(value.method)||typeof value.token!=='string'||!value.token){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','Il contesto di caricamento OpenSea è incompleto.');
    }
    if(!value.fields||typeof value.fields!=='object'||Array.isArray(value.fields)||Object.values(value.fields).some(item=>typeof item!=='string')){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','I campi di caricamento OpenSea non sono validi.');
    }
    return {url:url.href,method:value.method,fields:value.fields,token:value.token};
  }

  async function uploadPng(context,blob,filename){
    if(!(blob instanceof Blob)||blob.type!=='image/png'){
      throw new ServiceError('IMAGE_INVALID','La conversione non ha prodotto un file PNG valido.');
    }
    let response;
    try{
      if(context.method==='POST'){
        const form=new FormData();
        for(const [key,value] of Object.entries(context.fields))form.append(key,value);
        form.append('file',blob,filename);
        response=await fetch(context.url,{method:'POST',body:form,credentials:'omit',referrerPolicy:'no-referrer'});
      }else{
        if(Object.keys(context.fields).length){
          throw new ServiceError('UPLOAD_UNSUPPORTED','Il servizio ha richiesto campi non supportati per un caricamento PUT.');
        }
        response=await fetch(context.url,{method:'PUT',body:blob,credentials:'omit',referrerPolicy:'no-referrer'});
      }
    }catch(error){
      if(error instanceof ServiceError)throw error;
      throw new ServiceError('UPLOAD_FAILED','Il caricamento dell’immagine su OpenSea non è riuscito.',{cause:error});
    }
    if(!response.ok)throw new ServiceError('UPLOAD_FAILED',`Il caricamento dell’immagine non è riuscito (${response.status}).`,{status:response.status});
  }

  function conversionTraits(conversion){
    const settings=conversion.settings||{};
    const output=conversion.output||{};
    return [
      ['Larghezza',output.width],
      ['Altezza',output.height],
      ['Palette',settings.palette],
      ['Dithering',settings.dither],
      ['Metrica colore',settings.metric],
      ['Passo (mm)',settings.pitchMm]
    ].filter(([,value])=>value!==undefined&&value!==null&&String(value)!=='')
      .map(([traitType,value])=>({traitType,value:String(value)}));
  }

  function normalizeConfiguration(payload){
    const config=payload?.config||payload;
    const openSea=config?.openSea||{};
    if(openSea.apiKeyConfigured!==true||openSea.scopedPatConfigured!==true||openSea.dropConfigured!==true||openSea.contractConfigured!==true||config.walletConfigured!==true||config.sessionSecretConfigured!==true){
      throw new ServiceError('NOT_CONFIGURED','Il servizio OpenSea non è ancora completamente configurato. Nessun file è stato inviato.');
    }
    if(typeof openSea.chain!=='string'||!openSea.chain){
      throw new ServiceError('NOT_CONFIGURED','La rete della collezione Pixel Sheet non è configurata.');
    }
    return {chain:openSea.chain,shelfTitle:openSea.shelfTitle||'Pixel Sheet'};
  }

  function normalizeTransaction(payload){
    const transaction=payload?.transaction||payload;
    if(!transaction||typeof transaction!=='object'||
      !/^0x[0-9a-fA-F]{40}$/.test(transaction.to||'')||
      !/^0x[0-9a-fA-F]*$/.test(transaction.data||'')||
      !/^0x[0-9a-fA-F]+$/.test(transaction.value||'')||
      typeof transaction.chain!=='string'){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','OpenSea non ha restituito una transazione valida.');
    }
    return {
      to:transaction.to,
      data:transaction.data,
      value:transaction.value,
      chain:transaction.chain
    };
  }

  async function prepare({imageBlob,conversion,metadata,wallet}){
    if(!conversion||!metadata||!wallet)throw new ServiceError('INVALID_REQUEST','La scheda NFT è incompleta.');
    const address=normalizeAddress(wallet.address);
    const configuration=normalizeConfiguration(await api('/api/config'));
    await authenticate(address);

    const filename=outputFilename(conversion.source?.name);
    const contextsPayload=await api('/api/media/context',{
      method:'POST',
      authenticated:true,
      body:{filenames:[filename]}
    });
    const contexts=Array.isArray(contextsPayload)?contextsPayload:contextsPayload?.contexts;
    if(!Array.isArray(contexts)||contexts.length!==1){
      throw new ServiceError('UPSTREAM_INVALID_RESPONSE','OpenSea non ha restituito un unico contesto per l’immagine.');
    }
    const context=validateUploadContext(contexts[0]);
    await uploadPng(context,imageBlob,filename);

    const transactionPayload=await api('/api/mint/prepare',{
      method:'POST',
      authenticated:true,
      body:{
        mediaToken:context.token,
        name:String(metadata.title||''),
        description:String(metadata.description||''),
        supply:String(metadata.supply||1),
        traits:conversionTraits(conversion)
      }
    });
    const transaction=normalizeTransaction(transactionPayload);
    if(transaction.chain!==configuration.chain){
      throw new ServiceError('CHAIN_MISMATCH','La rete restituita da OpenSea non coincide con la collezione configurata.');
    }
    return Object.freeze({
      conversionVersion:conversion.version,
      walletAddress:address,
      transaction:Object.freeze(transaction),
      shelfTitle:configuration.shelfTitle,
      metadata:Object.freeze({title:String(metadata.title||''),description:String(metadata.description||'')})
    });
  }

  function chainIdFor(slug){
    const id=CHAIN_IDS[String(slug||'').toLowerCase()];
    if(!id)throw new ServiceError('CHAIN_UNSUPPORTED',`La rete “${slug}” non è ancora supportata dall’interfaccia.`);
    return id;
  }

  async function ensureTransactionChain(slug){
    const expected=chainIdFor(slug);
    const current=String(await provider().request({method:'eth_chainId'})).toLowerCase();
    if(current===expected)return expected;
    try{
      await provider().request({method:'wallet_switchEthereumChain',params:[{chainId:expected}]});
    }catch(error){
      if(error?.code===4902){
        throw new ServiceError('CHAIN_NOT_AVAILABLE','La rete richiesta non è presente nel wallet. Aggiungila e riprova.',{cause:error});
      }
      throw new ServiceError('CHAIN_SWITCH_REJECTED',safeMessage(error,'Cambio di rete non riuscito.'),{cause:error});
    }
    const changed=String(await provider().request({method:'eth_chainId'})).toLowerCase();
    if(changed!==expected)throw new ServiceError('CHAIN_MISMATCH','Il wallet non è passato alla rete richiesta.');
    return expected;
  }

  function delay(milliseconds){return new Promise(resolve=>setTimeout(resolve,milliseconds));}

  async function waitForReceipt(hash,{timeoutMs=10*60_000,pollMs=3000}={}){
    const started=Date.now();
    while(Date.now()-started<timeoutMs){
      const receipt=await provider().request({method:'eth_getTransactionReceipt',params:[hash]});
      if(receipt)return receipt;
      await delay(pollMs);
    }
    throw new ServiceError('RECEIPT_TIMEOUT','La transazione è stata inviata ma la conferma sta impiegando più del previsto. Controllala nel wallet.');
  }

  function topicAddress(topic){
    if(typeof topic!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(topic))return '';
    return `0x${topic.slice(-40)}`.toLowerCase();
  }

  function decimalTokenId(hex){
    try{return BigInt(hex).toString(10);}catch{return '';}
  }

  function mintedToken(receipt,walletAddress){
    const wanted=normalizeAddress(walletAddress);
    for(const log of receipt?.logs||[]){
      const topics=Array.isArray(log.topics)?log.topics.map(value=>String(value).toLowerCase()):[];
      if(topics[0]===TRANSFER_TOPIC&&topics.length>=4&&topics[1]===ZERO_TOPIC&&topicAddress(topics[2])===wanted){
        const tokenId=decimalTokenId(topics[3]);
        if(tokenId)return {contractAddress:normalizeAddress(log.address,'contratto'),tokenId,standard:'ERC-721'};
      }
      if(topics[0]===TRANSFER_SINGLE_TOPIC&&topics.length>=4&&topics[2]===ZERO_TOPIC&&topicAddress(topics[3])===wanted){
        const data=String(log.data||'');
        const tokenId=/^0x[0-9a-fA-F]{128}$/.test(data)?decimalTokenId(`0x${data.slice(2,66)}`):'';
        if(tokenId)return {contractAddress:normalizeAddress(log.address,'contratto'),tokenId,standard:'ERC-1155'};
      }
    }
    return null;
  }

  async function publish({preparedRequest,conversion,wallet}){
    if(!preparedRequest?.transaction)throw new ServiceError('NOT_PREPARED','Prepara nuovamente i dati della NFT.');
    if(preparedRequest.conversionVersion!==conversion?.version){
      throw new ServiceError('CONVERSION_CHANGED','La conversione è cambiata. Prepara nuovamente la NFT.');
    }
    const active=await assertCurrentWallet(wallet.address);
    if(!sameAddress(active,preparedRequest.walletAddress)){
      throw new ServiceError('WALLET_CHANGED','Il wallet non coincide con quello che ha preparato la NFT.');
    }
    const transaction=normalizeTransaction(preparedRequest.transaction);
    await ensureTransactionChain(transaction.chain);

    let hash;
    try{
      hash=await provider().request({
        method:'eth_sendTransaction',
        params:[{
          from:active,
          to:transaction.to,
          data:transaction.data,
          value:transaction.value
        }]
      });
    }catch(error){
      throw new ServiceError('TRANSACTION_REJECTED',safeMessage(error,'Il wallet non ha inviato la transazione.'),{cause:error});
    }
    if(typeof hash!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(hash)){
      throw new ServiceError('TRANSACTION_INVALID','Il wallet non ha restituito un identificativo di transazione valido.');
    }

    let receipt;
    try{
      receipt=await waitForReceipt(hash);
    }catch(error){
      return {
        status:'submitted',
        transactionHash:hash,
        shelfSynced:false,
        message:error?.code==='RECEIPT_TIMEOUT'
          ? 'La transazione è stata inviata ma la conferma è ancora in attesa. Controllala nel wallet prima di qualunque nuova operazione.'
          : 'La transazione è stata inviata, ma la rete non ne ha restituito l’esito. Controlla l’hash nel wallet prima di qualunque nuova operazione.'
      };
    }
    let receiptSucceeded=false;
    try{receiptSucceeded=BigInt(receipt.status)===1n;}catch{/* Lo stato non valido viene trattato come errore. */}
    if(!receiptSucceeded){
      return {
        status:'failed',
        transactionHash:hash,
        shelfSynced:false,
        message:'La transazione è stata confermata ma non è riuscita. Controlla i dettagli nel wallet; l’app non la invierà nuovamente.'
      };
    }
    let token=null;
    try{token=mintedToken(receipt,active);}catch{/* Un log inatteso non rende sicuro ripetere la transazione. */}
    if(!token){
      return {
        status:'confirmed',
        transactionHash:hash,
        shelfSynced:false,
        message:'La transazione è confermata. Non sono riuscito a identificare automaticamente il token: controllalo su OpenSea prima di sincronizzare l’album.'
      };
    }

    let shelf=null;
    let shelfError=null;
    try{
      await authenticate(active);
      shelf=await api('/api/shelves/sync',{
        method:'POST',
        authenticated:true,
        body:{
          item:{chain:transaction.chain,contractAddress:token.contractAddress,tokenId:token.tokenId},
          description:String(preparedRequest.metadata?.description||'').slice(0,500)
        }
      });
    }catch(error){
      shelfError=error;
    }
    const assetUrl=`https://opensea.io/assets/${encodeURIComponent(transaction.chain)}/${token.contractAddress}/${encodeURIComponent(token.tokenId)}`;
    return {
      status:'confirmed',
      transactionHash:hash,
      token,
      assetUrl,
      shelf,
      shelfSynced:!shelfError,
      message:shelfError
        ? 'NFT creata e confermata. La sincronizzazione dell’album Pixel Sheet non è riuscita e potrà essere ripetuta.'
        : 'NFT creata, confermata e aggiunta all’album Pixel Sheet.'
    };
  }

  async function syncShelf({preparedRequest,wallet}){
    const token=preparedRequest?.token;
    if(!token||typeof token!=='object')throw new ServiceError('SHELF_RETRY_INVALID','I dati della NFT confermata non sono disponibili.');
    const active=await assertCurrentWallet(wallet.address);
    if(!sameAddress(active,preparedRequest.walletAddress)){
      throw new ServiceError('WALLET_CHANGED','Ricollega il wallet che ha creato la NFT.');
    }
    const chain=String(preparedRequest.chain||'');
    const contractAddress=normalizeAddress(token.contractAddress,'contratto');
    const tokenId=String(token.tokenId||'');
    if(!chain||!/^\d+$/.test(tokenId))throw new ServiceError('SHELF_RETRY_INVALID','I dati della NFT confermata non sono validi.');
    await authenticate(active);
    const shelf=await api('/api/shelves/sync',{
      method:'POST',
      authenticated:true,
      body:{
        item:{chain,contractAddress,tokenId},
        description:String(preparedRequest.description||'').slice(0,500)
      }
    });
    return {shelfSynced:true,shelf,message:'NFT aggiunta all’album Pixel Sheet senza creare una nuova transazione.'};
  }

  const service=Object.freeze({
    get configured(){return Boolean(configuredApiBase());},
    prepare,
    publish,
    syncShelf,
    resetAuthentication,
    __test:Object.freeze({mintedToken,chainIdFor,outputFilename})
  });
  window.PixelSheetOpenSeaService=service;

  const launchButton=document.getElementById('create-nft');
  async function activate(){
    if(launchButton)launchButton.hidden=true;
    try{
      if(!service.configured||!window.PixelSheetNft?.configure)return;
      normalizeConfiguration(await api('/api/config'));
      window.PixelSheetNft.configure({prepare:service.prepare,publish:service.publish,syncShelf:service.syncShelf});
      if(launchButton)launchButton.hidden=false;
    }catch{
      // Fail closed: the public site does not advertise an incomplete NFT flow.
    }
  }
  activate();
})();
