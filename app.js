const cfg=window.STUDY_MATERIAL_SUPABASE;
const sb=window.supabase.createClient(cfg.url,cfg.publishableKey);
const UPI="Q655416785@ybl"; let currentUser=null, selected=null;

const $=id=>document.getElementById(id);
async function init(){
  $("upiText").textContent=UPI; $("modalUpi").textContent=UPI;
  const {data}=await sb.auth.getUser(); currentUser=data.user||null;
  await loadNCERT(); await loadVideos(); await loadProducts(); updateAccount();
}
init();

async function loadNCERT(){
 const {data}=await sb.from("ncert_classes").select("*").eq("active",true).order("class_number");
 $("classes").innerHTML=(data||[]).map(x=>`<div class="card"><h3>Class ${x.class_number}</h3><p>${esc(x.title||"NCERT")}</p><button onclick="openLink('${escAttr(x.official_url||"")}')">Open</button></div>`).join("");
}
async function hasPurchase(videoId){
 if(!currentUser)return false;
 const {data}=await sb.from("purchases").select("id").eq("user_id",currentUser.id).eq("video_id",videoId).eq("status","approved").limit(1);
 return !!data?.length;
}
async function loadVideos(){
 const {data,error}=await sb.from("videos").select("id,title,description,price").eq("active",true).order("created_at",{ascending:false});
 if(error){$("videoList").innerHTML="<div class='card'>Videos unavailable.</div>";return;}
 let html="";
 for(const v of data||[]){
   const owned=await hasPurchase(v.id);
   html+=`<div class="card"><h3>${esc(v.title)}</h3><p>${esc(v.description||"")}</p><strong>₹${v.price}</strong><br>
   ${owned?`<button onclick="watchVideo(${v.id},'${escAttr(v.title)}')">Aa gaya hilaane 😎🔥</button>`:
   `<button onclick="openPay('video',${v.id},'${escAttr(v.title)}',${v.price})">Purchase</button>`}</div>`;
 }
 $("videoList").innerHTML=html||"<div class='card'>No videos available.</div>";
}
async function loadProducts(){
 const {data}=await sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 $("productList").innerHTML=(data||[]).map(x=>`<div class="card"><h3>${esc(x.title)}</h3><p>${esc(x.description||"")}</p><strong>₹${x.price}</strong><br><button onclick="openPay('product',${x.id},'${escAttr(x.title)}',${x.price})">Purchase</button></div>`).join("");
}
function openPay(type,id,title,price){
 if(!currentUser){alert("Please sign in first.");location.hash="#account";return;}
 selected={type,id,price}; $("payItem").textContent=`${title} — ₹${price}`;$("paymentRef").value="";$("payMsg").textContent="";$("payModal").classList.remove("hidden");
}
function closePay(){$("payModal").classList.add("hidden")}
async function submitPayment(){
 const ref=$("paymentRef").value.trim(); if(!ref){$("payMsg").textContent="Enter UTR/reference number.";return;}
 const row={user_id:currentUser.id,amount:selected.price,payment_ref:ref,status:"pending"};
 if(selected.type==="video")row.video_id=selected.id;else row.product_id=selected.id;
 const {error}=await sb.from("purchases").insert(row);
 $("payMsg").textContent=error?error.message:"Submitted. Admin will verify your payment.";
 if(!error)setTimeout(closePay,1200);
}
function copyUPI(){navigator.clipboard?.writeText(UPI);$("copyUpi").textContent="Copied ✓";setTimeout(()=>$("copyUpi").textContent="📋 Copy",1200)}
$("copyUpi").onclick=copyUPI;

async function watchVideo(id,title){
 if(!currentUser){alert("Please sign in.");return;}
 const owned=await hasPurchase(id); if(!owned){alert("Payment is not approved.");return;}
 const {data:v,error}=await sb.from("videos").select("storage_path").eq("id",id).single();
 if(error||!v?.storage_path){alert("Video file is not linked yet.");return;}
 // A short-lived signed URL is generated each time; the entitlement remains permanent
 // until the approved purchase is revoked.
 const {data:signed,error:se}=await sb.storage.from("videos").createSignedUrl(v.storage_path,3600);
 if(se||!signed?.signedUrl){alert("Could not open video.");return;}
 $("videoTitle").textContent=title;$("player").src=signed.signedUrl;$("videoModal").classList.remove("hidden");
}
function closeVideo(){$("player").pause();$("player").removeAttribute("src");$("videoModal").classList.add("hidden")}
async function authSubmit(e){
 e.preventDefault(); const email=$("email").value.trim(),pass=$("password").value,name=$("name").value.trim();
 if(name){const {data,error}=await sb.auth.signUp({email,password:pass,options:{data:{name}}});if(error){$("accountMsg").textContent=error.message;return;}$("accountMsg").textContent="Signup submitted. Check email if confirmation is enabled.";}
 else{const {data,error}=await sb.auth.signInWithPassword({email,password:pass});if(error){$("accountMsg").textContent=error.message;return;}currentUser=data.user;$("accountMsg").textContent="Signed in.";await loadVideos();}
}
$("authForm").onsubmit=authSubmit;
function updateAccount(){if(currentUser)$("accountMsg").textContent=`Signed in as ${currentUser.email}`;}
function openLink(u){if(u)location.href=u;else alert("Official NCERT link will be added.");}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function escAttr(s){return esc(s).replace(/`/g,"&#96;")}
window.openPay=openPay;window.closePay=closePay;window.submitPayment=submitPayment;window.copyUPI=copyUPI;window.watchVideo=watchVideo;window.closeVideo=closeVideo;window.openLink=openLink;
