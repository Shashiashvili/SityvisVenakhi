'use strict';

const TYPE_LABELS = { toast: 'ტოსტი', poem: 'ლექსი', tale: 'ზღაპარი', card: 'მილოცვის ბარათი' };
const TYPE_FULL   = { toast: 'სადღეგრძელო/ტოსტი', poem: 'ლექსი', tale: 'ზღაპარი', card: 'მილოცვის ბარათი' };
const MOOD_LABELS = { funny: 'სახალისო და მხიარული', lyrical: 'ლირიკული და თბილი', festive: 'საზეიმო და პათეტიკური' };

let currentType = 'toast';
let currentResult = null; 
let cart = [];
let bubbleInterval = null;

let els = {};

document.addEventListener('DOMContentLoaded', () => {
  els = {
    typeGrid:      document.getElementById('typeGrid'),
    occasionInput: document.getElementById('occasionInput'),
    nameInput:     document.getElementById('nameInput'),
    moodSelect:    document.getElementById('moodSelect'),
    generateBtn:   document.getElementById('generateBtn'),
    errorMsg:      document.getElementById('errorMsg'),
    qvevriCaption: document.getElementById('qvevriCaption'),
    liquidRect:    document.getElementById('liquidRect'),
    bubbleLayer:   document.getElementById('bubbleLayer'),
    resultCard:    document.getElementById('resultCard'),
    resultType:    document.getElementById('resultType'),
    resultTitle:   document.getElementById('resultTitle'),
    resultBody:    document.getElementById('resultBody'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    addToCartBtn:  document.getElementById('addToCartBtn'),
    cartCount:     document.getElementById('cartCount'),
    cartTrigger:   document.getElementById('cartTrigger'),
    drawer:        document.getElementById('drawer'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    drawerClose:   document.getElementById('drawerClose'),
    drawerBody:    document.getElementById('drawerBody'),
    drawerFoot:    document.getElementById('drawerFoot'),
    cartTotalAmt:  document.getElementById('cartTotalAmt'),
    checkoutBtn:   document.getElementById('checkoutBtn'),
    heroStartBtn:  document.getElementById('heroStartBtn'),
    heroHowBtn:    document.getElementById('heroHowBtn'),
  };

  if (els.typeGrid) {
    els.typeGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.type-card');
      if (!card) return;
      selectType(card.dataset.type);
    });
  }

  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenerate();
    });
  }

  if (els.generateBtn) els.generateBtn.addEventListener('click', handleGenerate);
  if (els.regenerateBtn) els.regenerateBtn.addEventListener('click', handleGenerate);
  if (els.addToCartBtn) els.addToCartBtn.addEventListener('click', addToCart);

  if (els.cartTrigger) els.cartTrigger.addEventListener('click', openDrawer);
  if (els.drawerClose) els.drawerClose.addEventListener('click', closeDrawer);
  if (els.drawerOverlay) els.drawerOverlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  if (els.heroStartBtn) {
    els.heroStartBtn.addEventListener('click', () => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (els.heroHowBtn) {
    els.heroHowBtn.addEventListener('click', () => {
      document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (els.checkoutBtn) {
    els.checkoutBtn.addEventListener('click', checkout);
  }

  renderCart();
});

function selectType(type) {
  if (!TYPE_LABELS[type]) return;
  currentType = type;
  document.querySelectorAll('.type-card').forEach((el) => {
    const isActive = el.dataset.type === type;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-pressed', String(isActive));
  });
}

function spawnBubbles() {
  const layer = els.bubbleLayer;
  if (!layer) return;
  layer.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 6; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const r = 2 + Math.random() * 3;
    const x = 30 + Math.random() * 90;
    c.setAttribute('cx', x);
    c.setAttribute('cy', 150 - Math.random() * 20);
    c.setAttribute('r', r);
    c.setAttribute('class', 'bubble');
    c.style.animationDelay = `${Math.random() * 2}s`;
    c.setAttribute('fill', 'rgba(239,228,207,0.5)');
    frag.appendChild(c);
  }
  layer.appendChild(frag);
}

function setLoading(isLoading) {
  if (els.generateBtn) els.generateBtn.disabled = isLoading;
  hideError();

  if (isLoading) {
    if (els.generateBtn) els.generateBtn.textContent = 'იწურება...';
    if (els.qvevriCaption) els.qvevriCaption.textContent = 'ქვევრი ივსება — სიტყვები იწურება';
    if (els.liquidRect) {
      els.liquidRect.setAttribute('y', '60');
      els.liquidRect.setAttribute('height', '105');
    }
    spawnBubbles();
    clearInterval(bubbleInterval);
    bubbleInterval = setInterval(spawnBubbles, 1800);
  } else {
    if (els.generateBtn) els.generateBtn.textContent = 'სიტყვების დაწურვა';
    clearInterval(bubbleInterval);
    bubbleInterval = null;
  }
}

function showError() {
  if (els.errorMsg) {
    els.errorMsg.style.display = 'block';
    els.errorMsg.setAttribute('data-visible', 'true');
  }
}

function hideError() {
  if (els.errorMsg) {
    els.errorMsg.style.display = 'none';
    els.errorMsg.removeAttribute('data-visible');
  }
}


function handleGenerate() {
  const occasion = els.occasionInput?.value.trim() || '';
  const name = els.nameInput?.value.trim() || '';
  const mood = els.moodSelect?.value || 'lyrical';

  setLoading(true);

  setTimeout(() => {
    const resText = generateLocalText(currentType, occasion, name, mood);

    currentResult = {
      type: currentType,
      title: resText.title,
      body: resText.body,
    };

    showResult(currentResult);
    setLoading(false);
  }, 600);
}

function generateLocalText(type, occasion, name, mood) {
  const targetName = name ? name : 'ძვირფასო მეგობარო';
  const targetOccasion = occasion ? occasion : 'ამ მშვენიერ დღეს';

  const database = {
    toast: {
      lyrical: [
        { title: "გულწრფელი სადღეგრძელო", body: `ჭიქა ავწიოთ ${targetName}-ის სადღეგრძელოდ! ${targetOccasion} იყოს მისთვის ახალი წარმატებების, უშრეტ ბედნიერებასა და სიხარულის დასაწყისი. გისურვებ სიმშვიდეს, ჯანმრთელობასა და მუდამ გახარებულ გულს. მრავალს დაესწარი!` },
        { title: "ღვინით სავსე ჭიქით", body: `ამ ლამაზ დღეს, ${targetOccasion}, განსაკუთრებით მინდა ვუდღეგრძელო ${targetName}-ს. დაელოცოს ოჯახი, საქმე და თითოეული ნაბიჯი. მუდამ გარშემორტყმული ყოფილიყოს ერთგული ადამიანებითა და თბილი ღიმილით!` }
      ],
      funny: [
        { title: "მხიარული სადღეგრძელო", body: `მოდით, ${targetName}-ს გაუმარჯოს! ${targetOccasion} ისეთი დღეა, ღვინო წყალივით რომ უნდა მივყოლოთ და დარდი საერთოდ დავივიწყოთ. იცოცხლე, იხარე და სულ ასეთ კარგ ხასიათზე გვყოლოდე!` }
      ],
      festive: [
        { title: "საზეიმო სადღეგრძელო", body: `დღეს, ${targetOccasion}, განსაკუთრებული ზეიმით ავწევთ ამ ჭიქას ${targetName}-ის პატივსაცემად! ვუსურვებთ მწვერვალების დაპყრობას, მტკიცე ჯანმრთელობას და დიდებულ მომავალს!` }
      ]
    },
    poem: {
      lyrical: [
        { title: "სითბოს სტროფები", body: `მზის სხივებივით თბილია დღე ეს,\n${targetName}-ს ვუსურვებთ სიხარულს უზღვავს.\n${targetOccasion} გულს სიყვარულით ავსებს,\nდა ბედნიერება ყოველთვის თან სდევს!` }
      ],
      funny: [
        { title: "მხიარული ლექსი", body: `დღეს ${targetOccasion} დგება,\n${targetName} იღიმის, მღერის,\nსიხარული არ თავდება,\nწინ დიდი ლხინი ელის!` }
      ],
      festive: [
        { title: "საზეიმო სტრიქონები", body: `ზარები რეკენ, დღე არის დიადი,\n${targetOccasion} გვანიჭებს შუქს,\n${targetName}-ს ვუსურვებთ ნათელ მომავალს,\nდა აუსრულდეს ყველა ოცნება!` }
      ]
    },
    card: {
      lyrical: [
        { title: "თბილი მილოცვა", body: `გულითადად გილოცავ ${targetOccasion}! ${targetName}, იყოს ეს წელი შენთვის ახალი შესაძლებლობების, დიდი წარმატებებისა და დაუვიწყარი მომენტების მომტანი. გისურვებ ჯანმრთელობასა და უსაზღვრო ბედნიერებას!` }
      ],
      funny: [
        { title: "მხიარული ბარათი", body: `გილოცავ! ${targetOccasion} იყოს ყველაზე მხიარული და თავგადასავლებით სავსე! ${targetName}, გისურვებ ბევრ ღიმილს, ნაკლებ საქმეს და უამრავ დასვენებას!` }
      ],
      festive: [
        { title: "საზეიმო ბარათი", body: `გილოცავთ ${targetOccasion}! ${targetName}, მიიღეთ ჩვენი ყველაზე გულწრფელი მილოცვა. გისურვებთ წინსვლას, აღიარებასა და ყოველდღიურ გამარჯვებებს!` }
      ]
    },
    tale: {
      lyrical: [
        { title: "ზღაპრული ამბავი", body: `ოდესღაც, შორეულ და ჯადოსნურ მხარეში, ${targetOccasion} განსაკუთრებული სასწაული მოხდა. ${targetName}-მა იპოვა ოქროს გასაღები, რომელმაც ყველა ოცნების კარი გააღო. მას შემდეგ სიხარული და სინათლე არასდროს მოშორებია მის გზას.` }
      ],
      funny: [
        { title: "მხიარული ზღაპარი", body: `ცხრა მთას იქით, ${targetOccasion}, ${targetName}-მა აღმოაჩინა ჯადოსნური ქვევრი, რომელიც მუდმივად ასხამდა სიცილს და კარგ განწყობას. მას შემდეგ იმ მხარეში მოწყენა არავის ენახა!` }
      ],
      festive: [
        { title: "დიდებული ლეგენდა", body: `სამეფოს მატიანეში ჩაწერა: ${targetOccasion} დაიბადა ახალი ლეგენდა. ${targetName}-ის სახელი შორს გაითქვა მისი სიკეთითა და სიბრძნით, ხოლო მისი სახლი მუდამ სავსე იყო სტუმრებითა და ზეიმით.` }
      ]
    }
  };

  const selectedCategory = database[type] || database.toast;
  const selectedMoodList = selectedCategory[mood] || selectedCategory.lyrical;

  return selectedMoodList[Math.floor(Math.random() * selectedMoodList.length)];
}

function showResult(r) {
  if (els.resultType) els.resultType.textContent = TYPE_LABELS[r.type];
  if (els.resultTitle) els.resultTitle.textContent = r.title;
  if (els.resultBody) els.resultBody.textContent = r.body;
  if (els.resultCard) els.resultCard.style.display = 'block';
  if (els.qvevriCaption) els.qvevriCaption.textContent = 'მზადაა — ჩამოსხმულია';
  if (els.liquidRect) {
    els.liquidRect.setAttribute('y', '30');
    els.liquidRect.setAttribute('height', '135');
  }
}

function makeId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function addToCart() {
  if (!currentResult) return;
  
  cart.push({ ...currentResult, id: makeId() });
  renderCart();


  if (els.occasionInput) els.occasionInput.value = '';
  if (els.nameInput) els.nameInput.value = '';
  if (els.moodSelect) els.moodSelect.selectedIndex = 0;


  if (els.resultCard) els.resultCard.style.display = 'none';
  currentResult = null;

 
  if (els.qvevriCaption) els.qvevriCaption.textContent = 'მზადაა დასაწურად';
  if (els.liquidRect) {
    els.liquidRect.setAttribute('height', '0');
    els.liquidRect.setAttribute('y', '165');
  }

  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
}

function renderCart() {
  if (els.cartCount) els.cartCount.textContent = String(cart.length);
  if (!els.drawerBody) return;

  if (cart.length === 0) {
    els.drawerBody.innerHTML = '<div class="drawer-empty">კალათა ჯერ ცარიელია — დაწურეთ პირველი სიტყვები.</div>';
    if (els.drawerFoot) els.drawerFoot.style.display = 'none';
    return;
  }

  if (els.drawerFoot) els.drawerFoot.style.display = 'block';
  els.drawerBody.innerHTML = '';
  const frag = document.createDocumentFragment();

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="ci-top">
        <div>
          <div class="ci-type">${escapeHtml(TYPE_LABELS[item.type])}</div>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <button type="button" class="ci-remove" data-id="${item.id}">წაშლა</button>
      </div>
    `;
    frag.appendChild(row);
  });

  els.drawerBody.appendChild(frag);
  els.drawerBody.querySelectorAll('.ci-remove').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  if (els.cartTotalAmt) els.cartTotalAmt.textContent = '0 ₾ (დემო)';
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function openDrawer() {
  if (els.drawer) els.drawer.classList.add('open');
  if (els.drawerOverlay) els.drawerOverlay.classList.add('open');
}

function closeDrawer() {
  if (els.drawer) els.drawer.classList.remove('open');
  if (els.drawerOverlay) els.drawerOverlay.classList.remove('open');
}

function checkout() {
  if (cart.length === 0) return;
  if (els.drawerFoot) els.drawerFoot.style.display = 'none';
  if (els.drawerBody) {
    els.drawerBody.innerHTML = `
      <div class="checkout-done">
        <svg class="stamp" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#CBA13A" stroke-width="1.5"/>
          <path d="M8 12.5l2.5 2.5L16 9" stroke="#CBA13A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>შეკვეთა მზადაა</h3>
        <p>ეს დემო-შეკვეთაა — რეალური გადახდა არ განხორციელებულა. ჩამოტვირთეთ თქვენი ტექსტები ქვემოთ.</p>
        <button type="button" class="btn btn-primary" id="downloadCartBtn" style="margin-top:18px;">ტექსტების ჩამოტვირთვა (.txt)</button>
      </div>
    `;
    document.getElementById('downloadCartBtn')?.addEventListener('click', downloadCart);
  }
}

function downloadCart() {
  const content = cart
    .map((item) => `${TYPE_LABELS[item.type]}\n${item.title}\n\n${item.body}\n\n----------------------\n`)
    .join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitkvis-venakhi.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}