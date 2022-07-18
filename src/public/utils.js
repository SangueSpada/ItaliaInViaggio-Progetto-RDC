
function checkin_fun() {


    var checkin = document.getElementById("CheckInDate");
    var checkout = document.getElementById("CheckOutDate");
    var in_date = new Date(checkin.value);
    var out_date = in_date;
    var today = new Date();
    if (in_date <= today) {
        alert("data non valida!");
        checkin.value = new Date();
        checkout.value = new Date();
    } else {
        out_date.setDate(out_date.getDate() + 1);
        checkout.value = out_date.toISOString().split('T')[0];
    }
  }
  
  function checkout_fun() {
  
    var checkin = document.getElementById("CheckInDate");
    var checkout = document.getElementById("CheckOutDate");
    var in_date;
    var out_date = new Date(checkout.value);
    if (checkin.value == '') {
        alert("Scegli prima la data di partenza");
        checkout.value = new Date();
        return
    } else {
        in_date = new Date(checkin.value);
        if (in_date >= out_date) {
            alert("data non valida!");
            checkout.value = new Date();
        }
    }
  }
  
  function lessBtnRangeA() {
    var lessBtn = document.getElementById("lessBtnA");
    var moreBtn = document.getElementById("moreBtnA");
    var part = document.getElementById("adulti");
  
    if (part.valueAsNumber == 1) {
        lessBtn.disabled = true;
    } else {
        lessBtn.disabled = false;
        moreBtn.disabled = false;
        part.value = part.valueAsNumber - 1;
    }
  }
  
  function moreBtnRangeA() {
    var lessBtn = document.getElementById("lessBtnA");
    var moreBtn = document.getElementById("moreBtnA");
    var part = document.getElementById("adulti");
  
    if (part.valueAsNumber == 10) {
        moreBtn.disabled = true;
    } else {
        moreBtn.disabled = false;
        lessBtn.disabled = false;
        part.value = part.valueAsNumber + 1;
    }
  }
  function lessBtnRangeR() {
    var lessBtn = document.getElementById("lessBtnR");
    var moreBtn = document.getElementById("moreBtnR");
    var part = document.getElementById("ragazzi");
  
    if (part.valueAsNumber == 0) {
        lessBtn.disabled = true;
    } else {
        lessBtn.disabled = false;
        moreBtn.disabled = false;
        part.value = part.valueAsNumber - 1;
    }
  }
  
  function moreBtnRangeR() {
    var lessBtn = document.getElementById("lessBtnR");
    var moreBtn = document.getElementById("moreBtnR");
    var part = document.getElementById("ragazzi");
  
    if (part.valueAsNumber == 10) {
        moreBtn.disabled = true;
    } else {
        moreBtn.disabled = false;
        lessBtn.disabled = false;
        part.value = part.valueAsNumber + 1;
    }
  }
  
  function waitinSolutions(){
    var element = document.getElementById("depSol");
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
    element = document.getElementById("backSol");
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
    var divP = document.getElementById("depSol");
    var divA = document.getElementById("backSol");
    let cardP = document.createElement('div');
    cardP.id="waitP";
    cardP.classList.add("card","mb-3");
    let cardA = document.createElement('div');
    cardA.id="waitA";
    cardA.classList.add("card","mb-3");
    let cardBody = document.createElement('div');
    cardBody.classList.add("card-body");
    let p = document.createElement('p');
    p.classList.add("card-text","placeholder-glow");
    let span1 = document.createElement('span');
    span1.classList.add("placeholder","col-7");
    let span2 = document.createElement('span');
    span2.classList.add("placeholder","col-5");
    let span3 = document.createElement('span');
    span3.classList.add("placeholder","col-9");
    p.appendChild(span1);
    p.appendChild(span2);
    p.appendChild(span3);
    cardBody.appendChild(p);
    cardP.appendChild(cardBody);
    cardA.appendChild(cardBody.cloneNode(true));
    divP.appendChild(cardP);
    divA.appendChild(cardA);
  }

  function waitinSolutions2(){
    var element = document.getElementById("depSol");
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
    var divP = document.getElementById("depSol");
    let cardP = document.createElement('div');
    cardP.id="waitP";
    cardP.classList.add("card","mb-3");
    cardA.classList.add("card","mb-3");
    let cardBody = document.createElement('div');
    cardBody.classList.add("card-body");
    let p = document.createElement('p');
    p.classList.add("card-text","placeholder-glow");
    let span1 = document.createElement('span');
    span1.classList.add("placeholder","col-7");
    let span2 = document.createElement('span');
    span2.classList.add("placeholder","col-5");
    let span3 = document.createElement('span');
    span3.classList.add("placeholder","col-9");
    p.appendChild(span1);
    p.appendChild(span2);
    p.appendChild(span3);
    cardBody.appendChild(p);
    cardP.appendChild(cardBody);
    divP.appendChild(cardP);
  }
  
  function cardSolutions(sol){
    var element = document.getElementById("depSol");
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
    element = document.getElementById("backSol");
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
  
    var partenze = sol.DepartureSolutions;
    var ritorni = sol.BackSolutions;
    var h3 = document.createElement("h3");
    h3.classList.add("text-center");
    h3.style.color="bisque";
    h3.style.fontWeight="bold";
    h3.innerHTML="Soluzioni andata";
    var divP = document.getElementById("depSol");
    divP.appendChild(h3.cloneNode(true));
    var divR = document.getElementById("backSol");
    h3.innerHTML="Soluzioni ritorno";
    divR.appendChild(h3.cloneNode(true));
    (partenze.solutions).forEach(item=>{
      var s = item.solution;
      var divP = document.getElementById("depSol");
      let card = document.createElement('div');
      card.classList.add("card","mb-3");
      let cardBody = document.createElement('div');
      cardBody.classList.add("row","card-body");
  
      let col1 = document.createElement('div');
      col1.classList.add("col");
      let header1 = document.createElement('h4');
      header1.style.fontWeight = "bold";
      let dt = new Date(s.departureTime).toLocaleTimeString('it-IT',{ timeStyle: 'short', hour12: false });
      let at = new Date(s.arrivalTime).toLocaleTimeString('it-IT',{ timeStyle: 'short', hour12: false });            
      header1.innerHTML=dt+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right me-1" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>'+at;
      let header2 = document.createElement('h6');
      if(s.nodes.length == 1){
        header2.innerHTML=s.duration+', '+String(s.nodes.length -1)+" cambio";
      }
      else{
        header2.innerHTML=s.duration+', '+String(s.nodes.length -1)+" cambi";
      }
      col1.appendChild(header1);
      col1.appendChild(header2);
  
      let col2 = document.createElement('div');
      col2.classList.add("col","text-center");
      (s.trains).forEach(t =>{
        let small=document.createElement('small');
        small.classList.add("text-muted","mx-2");
        let img = document.createElement('img');
        //img.src ="../media/trenitalia/"+t.acronym+".svg"
        if(t.acronym==null){
          img.src="https://lefrecce.it/Channels.Website.WEB/web/images/logo/UB.svg";
        }
        else{
          img.src="https://lefrecce.it/Channels.Website.WEB/web/images/logo/"+t.acronym+".svg";
        }
        img.classList.add("me1");
        img.width=90;
        img.height=32;
        small.appendChild(img);
        small.insertAdjacentText("beforeend",t.name);
        col2.appendChild(small);
      });
      let col3 = document.createElement('div');
      col3.classList.add("col","text-end");
      if(s.price!=null){
        let header3 = document.createElement('h3');
        header3.style.fontWeight="bold";
        header3.style.color="red";
        header3.innerHTML=s.price.amount+"€";
        let a1 = document.createElement('a');
        a1.classList.add("btn","btn-success");
        a1.classList.add("a");
  
        a1.setAttribute("target","_blank");
        //a1.target="_blank";
        a1.setAttribute("href","https://www.lefrecce.it/Channels.Website.WEB/");
       // a1.href="https://www.lefrecce.it/Channels.Website.WEB/";
        a1.textContent="Acquista";
        col3.appendChild(header3);
        col3.appendChild(a1);
      }
      else{
        let header3 = document.createElement('h3');
        header3.style.fontWeight="bold";
        header3.style.color="red";
        header3.innerHTML="Non acquistabile";
        col3.appendChild(header3);
      }
      cardBody.appendChild(col1);
      cardBody.appendChild(col2);
      cardBody.appendChild(col3);
      card.appendChild(cardBody);
      divP.appendChild(card);
    });
    (ritorni.solutions).forEach(item=>{
      var s = item.solution;
      var divP = document.getElementById("backSol");
      let card = document.createElement('div');
      card.classList.add("card","mb-3");
      let cardBody = document.createElement('div');
      cardBody.classList.add("row","card-body");
  
      let col1 = document.createElement('div');
      col1.classList.add("col");
      let header1 = document.createElement('h4');
      header1.style.fontWeight = "bold";
      let dt = new Date(s.departureTime).toLocaleTimeString('it-IT',{ timeStyle: 'short', hour12: false });
      let at = new Date(s.arrivalTime).toLocaleTimeString('it-IT',{ timeStyle: 'short', hour12: false });            
      header1.innerHTML=dt+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right me-1" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>'+at;
      let header2 = document.createElement('h6');
      if(s.nodes.length == 1){
        header2.innerHTML=s.duration+', '+String(s.nodes.length -1)+" cambio";
      }
      else{
        header2.innerHTML=s.duration+', '+String(s.nodes.length -1)+" cambi";
      }
      col1.appendChild(header1);
      col1.appendChild(header2);
  
      let col2 = document.createElement('div');
      col2.classList.add("col","text-center");
      (s.trains).forEach(t =>{
        let small=document.createElement('small');
        small.classList.add("text-muted","mx-2");
        let img = document.createElement('img');
        if(t.acronym==null){
          img.src="https://lefrecce.it/Channels.Website.WEB/web/images/logo/UB.svg";
        }
        else{
          img.src="https://lefrecce.it/Channels.Website.WEB/web/images/logo/"+t.acronym+".svg";
        }
        img.classList.add("me1");
        img.width=90;
        img.height=32;
        small.appendChild(img);
        small.insertAdjacentText("beforeend",t.name);
        col2.appendChild(small);
      });
      let col3 = document.createElement('div');
      col3.classList.add("col","text-end");
      if(s.price!=null){
        let header3 = document.createElement('h3');
        header3.style.fontWeight="bold";
        header3.style.color="red";
        header3.innerHTML=s.price.amount+"€";
        let a1 = document.createElement('a');
        a1.classList.add("btn","btn-success");
        a1.classList.add("a");
  
        a1.setAttribute("target","_blank");
        //a1.target="_blank";
        a1.setAttribute("href","https://www.lefrecce.it/Channels.Website.WEB/");
       // a1.href="https://www.lefrecce.it/Channels.Website.WEB/";
        a1.textContent="Acquista";
        col3.appendChild(header3);
        col3.appendChild(a1);
      }
      else{
        let header3 = document.createElement('h3');
        header3.style.fontWeight="bold";
        header3.style.color="red";
        header3.innerHTML="Non acquistabile";
        col3.appendChild(header3);
      }
      cardBody.appendChild(col1);
      cardBody.appendChild(col2);
      cardBody.appendChild(col3);
      card.appendChild(cardBody);
      divP.appendChild(card);
    });
  
  }