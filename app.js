const SUPABASE_URL = window.STUDY_MATERIAL_SUPABASE?.url || "";
const SUPABASE_PUBLISHABLE_KEY = window.STUDY_MATERIAL_SUPABASE?.publishableKey || "";

const classes = document.getElementById('classes');
for(let i=1;i<=12;i++){
  const d=document.createElement('div'); d.className='card';
  d.innerHTML=`<h3>Class ${i}</h3><p>NCERT books by subject.</p><button onclick="alert('Add official NCERT links for Class ${i} in the admin panel.')">Open</button>`;
  classes.appendChild(d);
}

const seedVideos=[
 {id:1,title:'Sample Video',price:49,description:'Replace this from the admin panel.',purchased:false}
];
const seedProducts=[
 {id:1,title:'Sample Ebook',price:99,description:'Replace this from the admin panel.',purchased:false}
];

function render(list,id,type){
 const el=document.getElementById(id); el.innerHTML='';
 list.forEach(x=>{
  const d=document.createElement('div'); d.className='card';
  d.innerHTML=`<h3>${x.title}</h3><p>${x.description}</p><strong>₹${x.price}</strong><br><br>
  <button onclick="purchase('${type}',${x.id})">Purchase</button>`;
  el.appendChild(d);
 });
}
render(seedVideos,'videoList','video'); render(seedProducts,'productList','product');

function purchase(type,id){
 alert(`Payment: send the amount to UPI Q655416785@ybl.\n\nAfter payment, submit the transaction/reference number for manual approval.`);
}

document.getElementById('authForm').addEventListener('submit',e=>{
 e.preventDefault();
 document.getElementById('accountMsg').textContent='Account created (demo). Connect Supabase to save users securely.';
});
