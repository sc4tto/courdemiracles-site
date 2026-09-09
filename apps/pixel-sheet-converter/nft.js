(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const dialog = byId('nft-dialog');
  const form = byId('nft-form');
  const openButton = byId('create-nft');
  const closeButton = byId('nft-dialog-close');
  const cancelButton = byId('nft-dialog-cancel');
  const connectButton = byId('connect-wallet');
  const prepareButton = byId('prepare-nft');
  const publishButton = byId('publish-nft');
  const syncShelfButton = byId('sync-nft-shelf');
  const titleInput = byId('nft-title');
  const descriptionInput = byId('nft-description');
  const preview = byId('nft-preview');
  const imageInfo = byId('nft-image-info');
  const walletStatus = byId('wallet-status');
  const actionStatus = byId('nft-action-status');
  const transactionSummary = byId('nft-transaction-summary');
  const transactionChain = byId('nft-transaction-chain');
  const transactionTo = byId('nft-transaction-to');
  const transactionValue = byId('nft-transaction-value');
  const transactionHashRow = byId('nft-transaction-hash-row');
  const transactionHash = byId('nft-transaction-hash');

  let activeSnapshot = null;
  let previewUrl = null;
  let prepared = false;
  let preparing = false;
  let preparedRequest = null;
  let publishInFlight = false;
  let publishContextChanged = false;
  let transactionWasBroadcast = false;
  let preparationGeneration = 0;
  let wallet = {connected:false,address:'',chainId:''};
  let walletConnector = connectInjectedWallet;
  let prepareHandler = notConfiguredPrepare;
  let publishHandler = notConfiguredPublish;
  let syncShelfHandler = notConfiguredShelfSync;
  let shelfRetryRequest = null;

  function stage(name,state,detail){
    const item = byId('nft-stages').querySelector(`[data-stage="${name}"]`);
    item.classList.remove('is-complete','is-current','is-pending','is-error');
    item.classList.add(`is-${state}`);
    if(state==='current')item.setAttribute('aria-current','step');
    else item.removeAttribute('aria-current');
    if(detail)item.querySelector('small').textContent=detail;
  }

  function defaultTitle(filename){
    return filename.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim() || 'Pixel Sheet';
  }

  function shortAddress(address){
    return address.length>13 ? `${address.slice(0,6)}…${address.slice(-4)}` : address;
  }

  function clearPreviewUrl(){
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    previewUrl=null;
    preview.removeAttribute('src');
  }

  function setPublishBusy(busy){
    publishInFlight=busy;
    [closeButton,cancelButton].forEach(control=>{control.disabled=busy;});
    [connectButton,titleInput,descriptionInput].forEach(control=>{control.disabled=busy||transactionWasBroadcast;});
    syncShelfButton.disabled=busy||!shelfRetryRequest;
    if(busy)dialog.setAttribute('aria-busy','true');
    else dialog.removeAttribute('aria-busy');
  }

  function hideTransactionSummary(){
    transactionSummary.hidden=true;
    transactionChain.textContent='—';
    transactionTo.textContent='—';
    transactionValue.textContent='—';
    transactionHashRow.hidden=true;
    transactionHash.textContent='—';
  }

  function formatTransactionValue(value){
    try{
      const wei=BigInt(value);
      if(wei===0n)return '0 ETH';
      const whole=wei/10n**18n;
      const fraction=(wei%10n**18n).toString().padStart(18,'0').replace(/0+$/,'').slice(0,8);
      return `${whole}${fraction?`.${fraction}`:''} ETH (${wei} wei)`;
    }catch{return String(value||'—');}
  }

  function showTransactionSummary(request){
    const transaction=request?.transaction;
    if(!transaction)return hideTransactionSummary();
    transactionChain.textContent=String(transaction.chain||'—');
    transactionTo.textContent=String(transaction.to||'—');
    transactionValue.textContent=formatTransactionValue(transaction.value);
    transactionSummary.hidden=false;
  }

  function showTransactionHash(hash){
    if(typeof hash!=='string'||!hash)return;
    transactionHash.textContent=hash;
    transactionHashRow.hidden=false;
  }

  function releaseInvalidatedPublish(){
    const message=actionStatus.textContent;
    setPublishBusy(false);
    updateReadiness();
    if(message)actionStatus.textContent=message;
  }

  function resetPrepared(message=''){
    preparationGeneration+=1;
    prepared=false;
    preparing=false;
    preparedRequest=null;
    if(!publishInFlight)setPublishBusy(false);
    prepareButton.textContent='Carica e prepara';
    publishButton.textContent='Crea NFT e firma';
    publishButton.hidden=true;
    publishButton.disabled=true;
    syncShelfButton.hidden=true;
    syncShelfButton.disabled=true;
    syncShelfButton.textContent='Riprova album';
    shelfRetryRequest=null;
    hideTransactionSummary();
    if(activeSnapshot){
      updateReadiness();
      if(message)actionStatus.textContent=message;
    }
  }

  function renderWallet(){
    if(wallet.connected){
      const network=wallet.chainId ? ` · rete ${wallet.chainId}` : '';
      walletStatus.textContent=`Collegato: ${shortAddress(wallet.address)}${network}`;
      connectButton.textContent='Cambia wallet';
      stage('wallet','complete','Wallet collegato');
    }else{
      walletStatus.textContent='Wallet non collegato';
      connectButton.textContent='Collega wallet';
      stage('wallet','current','Da collegare');
    }
    if(!publishInFlight)updateReadiness();
  }

  function updateReadiness(){
    const metadataValid=Boolean(titleInput.value.trim());
    prepareButton.disabled=!activeSnapshot||!wallet.connected||!metadataValid||prepared||preparing||publishInFlight||transactionWasBroadcast;

    if(prepared)return;
    if(metadataValid)stage('metadata','complete','Titolo e descrizione verificati');
    else stage('metadata','current','Inserisci un titolo');
    stage('publish','pending','Richiederà conferma esplicita');
    stage('shelf','pending','Dopo la pubblicazione');

    if(!activeSnapshot)actionStatus.textContent='La conversione non è più valida. Genera una nuova anteprima.';
    else if(!wallet.connected)actionStatus.textContent='Anteprima pronta. Collega il wallet per continuare.';
    else if(!metadataValid)actionStatus.textContent='Inserisci il titolo della NFT.';
    else actionStatus.textContent='Scheda pronta. Il prossimo passaggio non invierà transazioni.';
  }

  async function connectInjectedWallet(){
    const provider=window.ethereum;
    if(!provider?.request)throw new Error('Nessun wallet compatibile rilevato in questo browser.');
    const accounts=await provider.request({method:'eth_requestAccounts'});
    if(!accounts?.[0])throw new Error('Il wallet non ha restituito un account.');
    let chainId='';
    try{chainId=await provider.request({method:'eth_chainId'});}catch(_error){/* La rete resta facoltativa. */}
    return {address:accounts[0],chainId};
  }

  async function notConfiguredPrepare(){
    const error=new Error('Il servizio protetto OpenSea non è ancora configurato. Nessun file o transazione è stato inviato.');
    error.code='NOT_CONFIGURED';
    throw error;
  }

  async function notConfiguredPublish(){
    const error=new Error('Il servizio di firma e pubblicazione non è ancora configurato. Nessuna richiesta è stata inviata al wallet o alla rete.');
    error.code='NOT_CONFIGURED';
    throw error;
  }

  async function notConfiguredShelfSync(){
    const error=new Error('La sincronizzazione protetta dell’album non è ancora configurata.');
    error.code='NOT_CONFIGURED';
    throw error;
  }

  async function connectWallet(){
    resetPrepared('Il wallet deve essere verificato nuovamente.');
    connectButton.disabled=true;
    walletStatus.textContent='Richiesta di collegamento in corso…';
    stage('wallet','current','Conferma nel wallet');
    try{
      const connection=await walletConnector();
      if(!connection?.address)throw new Error('Collegamento wallet non valido.');
      wallet={connected:true,address:connection.address,chainId:connection.chainId||''};
      renderWallet();
    }catch(error){
      wallet={connected:false,address:'',chainId:''};
      walletStatus.textContent=error?.message||'Collegamento non riuscito.';
      stage('wallet','error','Collegamento non riuscito');
      updateReadiness();
    }finally{
      connectButton.disabled=false;
    }
  }

  async function openDialog(){
    const snapshot=window.PixelSheetConversion?.getSnapshot();
    if(!snapshot)return;

    activeSnapshot=snapshot;
    transactionWasBroadcast=false;
    preparationGeneration+=1;
    prepared=false;
    preparing=false;
    preparedRequest=null;
    setPublishBusy(false);
    prepareButton.textContent='Carica e prepara';
    publishButton.textContent='Crea NFT e firma';
    publishButton.hidden=true;
    publishButton.disabled=true;
    syncShelfButton.hidden=true;
    syncShelfButton.disabled=true;
    syncShelfButton.textContent='Riprova album';
    shelfRetryRequest=null;
    hideTransactionSummary();
    clearPreviewUrl();
    titleInput.value=defaultTitle(snapshot.source.name);
    descriptionInput.value='';
    imageInfo.textContent=`${snapshot.output.width} × ${snapshot.output.height} px · PNG · album “Pixel Sheet”`;
    stage('preview','complete','Immagine convertita pronta');
    stage('metadata','complete','Titolo precompilato, modificabile');
    stage('publish','pending','Richiederà conferma esplicita');
    stage('shelf','pending','Dopo la pubblicazione');
    renderWallet();

    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');

    try{
      const blob=await window.PixelSheetConversion.getBlob();
      if(!activeSnapshot||activeSnapshot.version!==snapshot.version)return;
      previewUrl=URL.createObjectURL(blob);
      preview.src=previewUrl;
    }catch(error){
      activeSnapshot=null;
      stage('preview','error','Anteprima non disponibile');
      actionStatus.textContent=error?.message||'Impossibile preparare l’anteprima.';
      updateReadiness();
    }
  }

  async function prepareNft(){
    if(transactionWasBroadcast)return;
    if(!form.reportValidity())return;
    if(!activeSnapshot||!wallet.connected)return updateReadiness();

    const attempt=++preparationGeneration;
    preparing=true;
    prepareButton.disabled=true;
    actionStatus.textContent='Caricamento del PNG e preparazione tramite OpenSea…';
    stage('publish','current','Caricamento e preparazione in corso');
    try{
      const imageBlob=await window.PixelSheetConversion.getBlob();
      if(window.PixelSheetConversion.getSnapshot()?.version!==activeSnapshot.version)throw new Error('La conversione è cambiata. Genera una nuova anteprima.');

      const detail={
        imageBlob,
        conversion:activeSnapshot,
        metadata:{
          title:titleInput.value.trim(),
          description:descriptionInput.value.trim(),
          supply:1,
          shelf:'Pixel Sheet'
        },
        wallet:{address:wallet.address,chainId:wallet.chainId}
      };
      const response=await prepareHandler(detail);
      if(attempt!==preparationGeneration)return;
      preparedRequest=response??null;
      preparing=false;
      prepared=true;
      stage('metadata','complete','Metadati pronti');
      stage('publish','complete','Dati preparati dal servizio protetto');
      stage('shelf','pending','Dopo firma e creazione');
      actionStatus.textContent='Preparazione completata. Controlla i dati, poi avvia separatamente firma e creazione.';
      prepareButton.textContent='Dati preparati';
      publishButton.hidden=false;
      publishButton.disabled=false;
      showTransactionSummary(preparedRequest);
    }catch(error){
      if(attempt!==preparationGeneration)return;
      preparing=false;
      prepared=false;
      preparedRequest=null;
      stage('publish','error',error?.code==='NOT_CONFIGURED'?'Servizio non configurato':'Preparazione non riuscita');
      actionStatus.textContent=error?.message||'Impossibile preparare la NFT.';
      prepareButton.disabled=!activeSnapshot||!wallet.connected||!titleInput.value.trim();
    }
  }

  async function publishNft(){
    if(transactionWasBroadcast||!prepared||publishInFlight||!activeSnapshot||!wallet.connected)return;
    const currentSnapshot=window.PixelSheetConversion.getSnapshot();
    if(currentSnapshot?.version!==activeSnapshot.version){
      invalidateOpenDialog({detail:null});
      return;
    }

    const attempt=++preparationGeneration;
    const request=preparedRequest;
    prepared=false;
    preparedRequest=null;
    publishContextChanged=false;
    setPublishBusy(true);
    publishButton.disabled=true;
    publishButton.textContent='Attendi il wallet…';
    stage('publish','current','Firma o conferma in corso');
    actionStatus.textContent='Controlla attentamente la richiesta nel wallet. Puoi ancora rifiutarla.';
    try{
      const response=await publishHandler({
        preparedRequest:request,
        conversion:activeSnapshot,
        wallet:{address:wallet.address,chainId:wallet.chainId}
      });
      if(attempt!==preparationGeneration){releaseInvalidatedPublish();return;}
      if(typeof response?.transactionHash==='string'&&response.transactionHash){
        transactionWasBroadcast=true;
        showTransactionHash(response.transactionHash);
      }
      setPublishBusy(false);
      publishButton.disabled=true;
      const shelfSynced=response?.shelfSynced===true;

      if(response?.status==='confirmed'){
        stage('publish','complete','NFT confermata dal servizio');
        stage('shelf',shelfSynced?'complete':'current',shelfSynced?'Album Pixel Sheet sincronizzato':'Pronta per l’album Pixel Sheet');
        actionStatus.textContent=response.message||(shelfSynced?'Il servizio segnala la NFT come confermata e l’album Pixel Sheet come sincronizzato.':'Il servizio segnala la NFT come confermata. L’inserimento nell’album resta il passaggio successivo.');
        publishButton.textContent='NFT confermata';
        if(!shelfSynced&&response?.token&&request?.transaction?.chain){
          shelfRetryRequest={
            token:response.token,
            chain:request.transaction.chain,
            description:String(request.metadata?.description||''),
            walletAddress:request.walletAddress
          };
          syncShelfButton.hidden=false;
          syncShelfButton.disabled=false;
        }
      }else if(response?.status==='submitted'){
        stage('publish','current','Transazione inviata · conferma in attesa');
        stage('shelf',shelfSynced?'complete':'pending',shelfSynced?'Album Pixel Sheet sincronizzato':'Dopo la conferma in rete');
        actionStatus.textContent=response.message||(shelfSynced?'Il servizio segnala la transazione come inviata e l’album come sincronizzato. Attendi comunque la conferma in rete.':'Il servizio segnala la transazione come inviata. Attendi la conferma prima di considerare creata la NFT.');
        publishButton.textContent='Invio effettuato';
      }else if(response?.status==='failed'){
        stage('publish','error','Transazione confermata ma non riuscita');
        stage('shelf','pending','Nessuna sincronizzazione');
        actionStatus.textContent=response.message||'La transazione non è riuscita. Controlla il wallet prima di preparare una nuova NFT.';
        publishButton.textContent='Transazione non riuscita';
      }else{
        stage('publish','current','Risposta ricevuta · verifica necessaria');
        stage('shelf',shelfSynced?'complete':'pending',shelfSynced?'Album Pixel Sheet sincronizzato':'Stato della NFT da verificare');
        actionStatus.textContent=response?.message||(shelfSynced?'Il servizio indica l’album come sincronizzato, ma non ha fornito uno stato verificabile per la NFT. Controlla il wallet.':'Il servizio ha risposto senza indicare uno stato verificabile. Controlla il wallet prima di considerare creata la NFT.');
        publishButton.textContent='Verifica nel wallet';
      }
    }catch(error){
      if(attempt!==preparationGeneration){releaseInvalidatedPublish();return;}
      setPublishBusy(false);
      if(publishContextChanged){
        prepared=false;
        preparedRequest=null;
        publishButton.hidden=true;
        publishButton.disabled=true;
        prepareButton.disabled=false;
        stage('publish','error','Wallet o rete cambiati durante l’operazione');
        actionStatus.textContent=`${error?.message||'Firma o pubblicazione non riuscita.'} Il contesto del wallet è cambiato: prepara nuovamente i dati.`;
      }else{
        prepared=true;
        preparedRequest=request;
        stage('publish','error',error?.code==='NOT_CONFIGURED'?'Firma non configurata':'Firma o pubblicazione non riuscita');
        actionStatus.textContent=error?.message||'Impossibile completare firma e pubblicazione.';
        publishButton.textContent='Crea NFT e firma';
        publishButton.disabled=false;
      }
    }
  }

  async function retryShelfSync(){
    if(!shelfRetryRequest||publishInFlight||!wallet.connected)return;
    const request=shelfRetryRequest;
    setPublishBusy(true);
    syncShelfButton.textContent='Sincronizzazione…';
    stage('shelf','current','Sincronizzazione in corso');
    actionStatus.textContent='Aggiornamento dell’album Pixel Sheet senza una nuova transazione di mint…';
    try{
      const response=await syncShelfHandler({preparedRequest:request,wallet:{address:wallet.address,chainId:wallet.chainId}});
      setPublishBusy(false);
      if(response?.shelfSynced!==true)throw new Error(response?.message||'Il servizio non ha confermato la sincronizzazione dell’album.');
      shelfRetryRequest=null;
      syncShelfButton.hidden=true;
      syncShelfButton.disabled=true;
      syncShelfButton.textContent='Riprova album';
      stage('shelf','complete','Album Pixel Sheet sincronizzato');
      actionStatus.textContent=response.message||'NFT aggiunta all’album Pixel Sheet.';
    }catch(error){
      setPublishBusy(false);
      shelfRetryRequest=request;
      syncShelfButton.hidden=false;
      syncShelfButton.disabled=false;
      syncShelfButton.textContent='Riprova album';
      stage('shelf','error','Sincronizzazione non riuscita');
      actionStatus.textContent=error?.message||'Non è stato possibile aggiornare l’album. La NFT non verrà creata di nuovo.';
    }
  }

  function invalidateOpenDialog(event){
    if(event.detail||!dialog.open)return;
    activeSnapshot=null;
    resetPrepared();
    stage('preview','error','Conversione modificata');
    actionStatus.textContent='La conversione è cambiata. Chiudi questa finestra e genera una nuova anteprima.';
    prepareButton.disabled=true;
  }

  function syncInjectedProvider(){
    const provider=window.ethereum;
    if(!provider?.on)return;
    provider.on('accountsChanged',accounts=>{
      if(!accounts?.[0])wallet={connected:false,address:'',chainId:''};
      else wallet={...wallet,connected:true,address:accounts[0]};
      if(publishInFlight){
        publishContextChanged=true;
        renderWallet();
        actionStatus.textContent='L’account del wallet è cambiato durante l’operazione. Attendi l’esito senza chiudere la finestra.';
        return;
      }
      if(transactionWasBroadcast){
        renderWallet();
        actionStatus.textContent='La transazione è già stata inviata. Chiudi questa finestra per iniziare una nuova operazione.';
        return;
      }
      resetPrepared();
      renderWallet();
      if(dialog.open)actionStatus.textContent='L’account del wallet è cambiato. Prepara nuovamente i dati.';
    });
    provider.on('chainChanged',chainId=>{
      wallet={...wallet,chainId};
      if(publishInFlight){
        publishContextChanged=true;
        renderWallet();
        actionStatus.textContent='La rete del wallet è cambiata durante l’operazione. Attendi l’esito senza chiudere la finestra.';
        return;
      }
      if(transactionWasBroadcast){
        renderWallet();
        actionStatus.textContent='La transazione è già stata inviata. Il cambio di rete non ne modifica l’esito.';
        return;
      }
      resetPrepared();
      renderWallet();
      if(dialog.open)actionStatus.textContent='La rete del wallet è cambiata. Prepara nuovamente i dati.';
    });
  }

  function cleanupDialog(){
    clearPreviewUrl();
    activeSnapshot=null;
    transactionWasBroadcast=false;
    resetPrepared();
  }

  function closeDialog(){
    if(dialog.open&&typeof dialog.close==='function')dialog.close('cancel');
    else{
      dialog.removeAttribute('open');
      cleanupDialog();
    }
  }

  openButton.addEventListener('click',openDialog);
  closeButton.addEventListener('click',closeDialog);
  cancelButton.addEventListener('click',closeDialog);
  connectButton.addEventListener('click',connectWallet);
  publishButton.addEventListener('click',publishNft);
  syncShelfButton.addEventListener('click',retryShelfSync);
  form.addEventListener('submit',event=>{event.preventDefault();prepareNft();});
  titleInput.addEventListener('input',()=>resetPrepared());
  descriptionInput.addEventListener('input',()=>resetPrepared());
  dialog.addEventListener('close',cleanupDialog);
  dialog.addEventListener('cancel',event=>{if(publishInFlight)event.preventDefault();});
  window.addEventListener('pixelsheet:conversionchange',invalidateOpenDialog);
  syncInjectedProvider();

  // Punto di integrazione per il futuro backend. `prepare` deve soltanto
  // preparare i dati: firma e invio al wallet restano un'azione separata.
  window.PixelSheetNft=Object.freeze({
    configure(options={}){
      if(Object.prototype.hasOwnProperty.call(options,'connectWallet')){
        if(typeof options.connectWallet!=='function')throw new TypeError('PixelSheetNft: connectWallet deve essere una funzione.');
        walletConnector=options.connectWallet;
      }
      if(Object.prototype.hasOwnProperty.call(options,'prepare')){
        if(typeof options.prepare!=='function')throw new TypeError('PixelSheetNft: prepare deve essere una funzione asincrona.');
        prepareHandler=options.prepare;
        resetPrepared('La configurazione del servizio è cambiata. Prepara nuovamente i dati.');
      }
      if(Object.prototype.hasOwnProperty.call(options,'publish')){
        if(typeof options.publish!=='function')throw new TypeError('PixelSheetNft: publish deve essere una funzione asincrona.');
        publishHandler=options.publish;
        resetPrepared('La configurazione del servizio è cambiata. Prepara nuovamente i dati.');
      }
      if(Object.prototype.hasOwnProperty.call(options,'syncShelf')){
        if(typeof options.syncShelf!=='function')throw new TypeError('PixelSheetNft: syncShelf deve essere una funzione asincrona.');
        syncShelfHandler=options.syncShelf;
        resetPrepared('La configurazione del servizio è cambiata. Prepara nuovamente i dati.');
      }
    }
  });
})();
